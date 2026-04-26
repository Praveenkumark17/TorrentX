import express from 'express';
import { addTorrent, getAllTorrents, pauseTorrent, resumeTorrent, deleteTorrent, initTorrents } from '../controllers/torrentController.js';
import { openFolderPicker } from '../controllers/utilsController.js';
import { protect } from '../middleware/authMiddleware.js';

export { initTorrents };

const router = express.Router();

export const torrentRoutes = (io) => {
  router.post('/add', protect, async (req, res) => {
    try {
      const { magnetURI, savePath } = req.body;
      if (!magnetURI) {
        return res.status(400).json({ error: 'Magnet URI is required' });
      }
      
      const torrent = await addTorrent(magnetURI, io, savePath, req.user._id);
      res.json({ message: 'Torrent added successfully', infoHash: torrent.infoHash });
    } catch (error) {
      console.error('Add Torrent Error:', error);
      res.status(500).json({ error: 'Failed to add torrent' });
    }
  });

  router.get('/all', protect, async (req, res) => {
    try {
      const torrents = await getAllTorrents(req.user._id);
      res.json(torrents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch torrents' });
    }
  });

  router.post('/pause', protect, (req, res) => {
    const { infoHash } = req.body;
    if (pauseTorrent(infoHash, io)) {
      res.json({ message: 'Torrent paused' });
    } else {
      res.status(404).json({ error: 'Torrent not found' });
    }
  });

  router.post('/resume', protect, (req, res) => {
    const { infoHash } = req.body;
    if (resumeTorrent(infoHash, io)) {
      res.json({ message: 'Torrent resumed' });
    } else {
      res.status(404).json({ error: 'Torrent not found' });
    }
  });

  router.post('/delete', protect, (req, res) => {
    const { infoHash, deleteData } = req.body;
    if (deleteTorrent(infoHash, deleteData, io)) {
      res.json({ message: 'Torrent deleted' });
    } else {
      res.status(404).json({ error: 'Torrent not found' });
    }
  });

  router.get('/browse-folder', protect, openFolderPicker);

  return router;
};
