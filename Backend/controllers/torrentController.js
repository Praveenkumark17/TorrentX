import WebTorrent from 'webtorrent';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Torrent from '../models/Torrent.js';

const client = new WebTorrent();
const activeTorrents = new Map();

export const addTorrent = (magnetURI, io, customPath, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const downloadPath = customPath || path.join(__dirname, '../downloads');
      
      // Ensure directory exists
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      client.add(magnetURI, { path: downloadPath }, async (torrent) => {
        const userIdStr = userId.toString();
        console.log('Added torrent:', torrent.name, 'for user:', userIdStr);
        
        // If already tracked, just update userId and return
        if (activeTorrents.has(torrent.infoHash)) {
          activeTorrents.set(torrent.infoHash, userIdStr);
          resolve(torrent);
          return;
        }

        // Save to DB
        try {
          await Torrent.create({
            userId: userIdStr,
            infoHash: torrent.infoHash,
            name: torrent.name || 'Unknown',
            magnetURI,
            downloadPath
          });
        } catch (dbErr) {
          // If it already exists in DB, we just continue (might be re-adding)
        }

        activeTorrents.set(torrent.infoHash, userIdStr);

        torrent.on('done', () => {
          console.log('Torrent download finished:', torrent.name);
          io.to(userIdStr).emit('torrent_finished', { name: torrent.name, infoHash: torrent.infoHash });
        });

        torrent.on('error', (err) => {
          console.error('Torrent Error:', err);
          io.to(userIdStr).emit('error', { message: `Torrent error: ${err.message}` });
        });

        resolve(torrent);
      });
    } catch (error) {
      console.error('Error adding torrent:', error);
      reject(error);
    }
  });
};

// Global interval for real-time updates (1 second)
setInterval(() => {
  if (typeof global.io === 'undefined') return;

  client.torrents.forEach(torrent => {
    const userId = activeTorrents.get(torrent.infoHash);
    if (userId) {
      global.io.to(userId).emit('torrent_update', formatTorrentData(torrent));
    }
  });
}, 1000);

export const initTorrents = async (io) => {
  try {
    const allTorrents = await Torrent.find({});
    console.log(`Initializing ${allTorrents.length} torrents from DB...`);
    
    for (const t of allTorrents) {
      if (!client.get(t.infoHash)) {
        client.add(t.magnetURI, { path: t.downloadPath }, (torrent) => {
          activeTorrents.set(torrent.infoHash, t.userId.toString());
          console.log(`Resumed torrent: ${torrent.name}`);
          
          torrent.on('done', () => {
            io.to(t.userId.toString()).emit('torrent_finished', { name: torrent.name, infoHash: torrent.infoHash });
          });
        });
      } else {
        activeTorrents.set(t.infoHash, t.userId.toString());
      }
    }
  } catch (err) {
    console.error('Failed to initialize torrents:', err);
  }
};

export const getAllTorrents = async (userId) => {
  // Get hashes belonging to this user from DB
  const userTorrentHashes = await Torrent.find({ userId }).select('infoHash');
  const hashSet = new Set(userTorrentHashes.map(t => t.infoHash));

  return client.torrents
    .filter(t => hashSet.has(t.infoHash))
    .map(formatTorrentData);
};

export const pauseTorrent = (infoHash, io) => {
  if (!infoHash) return false;
  const torrent = client.torrents.find(t => 
    t.infoHash && t.infoHash.toLowerCase() === infoHash.toLowerCase()
  );

  if (torrent) {
    torrent.paused = true;
    
    if (typeof torrent.pause === 'function') {
      try { torrent.pause(); } catch (e) {}
    }

    if (torrent.ready && torrent.pieces) {
      try { torrent.deselect(0, torrent.pieces.length - 1); } catch (e) {}
    }
    
    if (torrent.discovery && typeof torrent.discovery.stop === 'function') {
      try { torrent.discovery.stop(); } catch (e) {}
    }
    
    if (torrent.wires) {
      torrent.wires.forEach(wire => {
        try {
          wire.choke();
          wire.uninterested();
        } catch (e) {}
      });
    }

    const userId = activeTorrents.get(torrent.infoHash);
    if (io && userId) {
      io.to(userId).emit('torrent_update', formatTorrentData(torrent));
    }
    return true;
  }
  return false;
};

export const resumeTorrent = (infoHash, io) => {
  if (!infoHash) return false;
  const torrent = client.torrents.find(t => 
    t.infoHash && t.infoHash.toLowerCase() === infoHash.toLowerCase()
  );

  if (torrent) {
    torrent.paused = false;

    if (typeof torrent.resume === 'function') {
      try { torrent.resume(); } catch (e) {}
    }

    if (torrent.ready && torrent.pieces) {
      try { torrent.select(0, torrent.pieces.length - 1); } catch (e) {}
    }

    if (torrent.discovery && typeof torrent.discovery.start === 'function') {
      try { torrent.discovery.start(); } catch (e) {}
    }

    if (torrent.wires) {
      torrent.wires.forEach(wire => {
        try {
          wire.unchoke();
          wire.interested();
        } catch (e) {}
      });
    }

    const userId = activeTorrents.get(torrent.infoHash);
    if (io && userId) {
      io.to(userId).emit('torrent_update', formatTorrentData(torrent));
    }
    return true;
  }
  return false;
};

export const deleteTorrent = async (infoHash, deleteData, io) => {
  if (!infoHash) return false;
  const torrent = client.torrents.find(t => 
    t.infoHash && t.infoHash.toLowerCase() === infoHash.toLowerCase()
  );

  if (torrent) {
    const torrentPath = torrent.path;
    const name = torrent.name;
    const hash = torrent.infoHash;
    const userId = activeTorrents.get(hash);
    
    // Remove from DB
    await Torrent.deleteOne({ infoHash: hash });

    client.remove(infoHash, (err) => {
      if (err) console.error('Error removing torrent from client:', err);

      if (deleteData && typeof torrentPath === 'string' && typeof name === 'string') {
        const fullPath = path.join(torrentPath, name);
        try {
          if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (e) {
          console.error('Error deleting physical files:', e);
        }
      }

      if (io && userId) {
        io.to(userId).emit('torrent_deleted', hash);
      }
      activeTorrents.delete(hash);
    });
    return true;
  }
  return false;
};

export const formatTorrentData = (t) => {
  const isPaused = t.paused || false;
  const downloadSpeed = isPaused ? 0 : (t.downloadSpeed || 0);
  const uploadSpeed = isPaused ? 0 : (t.uploadSpeed || 0);
  
  return {
    infoHash: t.infoHash,
    name: t.name || 'Fetching metadata...',
    progress: t.progress ? (t.progress * 100).toFixed(2) : '0.00',
    downloaded: formatSize(t.downloaded || 0),
    totalSize: formatSize(t.length || 0),
    downloadSpeed: formatSpeed(downloadSpeed),
    uploadSpeed: formatSpeed(uploadSpeed),
    rawDownloadSpeed: downloadSpeed,
    rawUploadSpeed: uploadSpeed,
    rawLength: t.length || 0,
    numPeers: isPaused ? 0 : (t.numPeers || 0),
    timeRemaining: isPaused ? 0 : (t.timeRemaining || 0),
    status: isPaused ? 'paused' : (t.done ? 'seeding' : (downloadSpeed > 0 ? 'downloading' : 'stalled')),
    files: (t.files || []).map(f => ({
      name: f.name,
      path: f.path,
      size: formatSize(f.length || 0),
      progress: (f.progress * 100).toFixed(2),
      downloaded: formatSize(f.downloaded || 0)
    }))
  };
};

const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSpeed = (bytes) => {
  return formatSize(bytes) + '/s';
};
