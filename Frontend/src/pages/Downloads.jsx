import React, { useState, useEffect } from 'react';
import { Download, FileText, ArrowDownCircle, ArrowUpCircle, Play, Pause, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const socket = io(import.meta.env.VITE_API_URL);

const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Downloads = () => {
  const [torrents, setTorrents] = useState([]);
  const [deletingTorrent, setDeletingTorrent] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    socket.on('initial_state', (data) => {
      setTorrents(data);
    });

    socket.on('torrent_update', (updatedTorrent) => {
      setTorrents(prev => {
        const index = prev.findIndex(t => t.infoHash === updatedTorrent.infoHash);
        if (index === -1) {
          return [...prev, updatedTorrent];
        } else {
          const newState = [...prev];
          newState[index] = updatedTorrent;
          return newState;
        }
      });
    });

    socket.on('torrent_deleted', (infoHash) => {
      setTorrents(prev => prev.filter(t => t.infoHash !== infoHash));
    });

    return () => {
      socket.off('initial_state');
      socket.off('torrent_update');
      socket.off('torrent_deleted');
    };
  }, []);

  const togglePause = async (torrent) => {
    const action = torrent.status === 'paused' ? 'resume' : 'pause';
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/torrent/${action}`, { 
        infoHash: torrent.infoHash 
      });
      addToast(`Torrent ${action}d`, 'info');
    } catch (err) {
      addToast(`Failed to ${action} torrent`, 'error');
    }
  };

  const handleDelete = async (deleteData) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/torrent/delete`, { 
        infoHash: deletingTorrent.infoHash,
        deleteData
      });
      setTorrents(prev => prev.filter(t => t.infoHash !== deletingTorrent.infoHash));
      addToast('Torrent deleted successfully', 'success');
      setDeletingTorrent(null);
    } catch (err) {
      addToast('Failed to delete torrent', 'error');
    }
  };

  const activeDownloads = torrents.filter(t => 
    t.status === 'downloading' || t.status === 'stalled' || (t.status === 'paused' && parseFloat(t.progress) < 100)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
          <Download className="text-emerald-500" size={window.innerWidth < 768 ? 24 : 32} />
          Active Downloads
        </h1>
        <span className="px-3 md:px-4 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
          {activeDownloads.length} {activeDownloads.length === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col min-h-[400px] shadow-lg"
      >
        <div className="flex-1 flex flex-col min-h-0">
          {activeDownloads.length > 0 ? (
            <>
              {/* Desktop View - Table */}
              <div className="hidden lg:block flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="sticky top-0 bg-[var(--bg-sidebar)] z-10 shadow-sm">
                    <tr className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--border-main)]">
                      <th className="px-8 py-4 w-[40%]">File Name</th>
                      <th className="px-6 py-4 w-[15%]">Progress</th>
                      <th className="px-6 py-4 w-[15%]">Speed</th>
                      <th className="px-6 py-4 w-[10%] hidden xl:table-cell">Status</th>
                      <th className="px-6 py-4 w-[10%]">Size</th>
                      <th className="px-8 py-4 w-[10%] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-main)]">
                    {activeDownloads.map((torrent) => (
                      <tr key={torrent.infoHash} className="hover:bg-[var(--bg-main)] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${torrent.status === 'downloading' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--text-heading)] transition-colors truncate" title={torrent.name}>{torrent.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase font-bold tracking-widest">{torrent.status}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-full">
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs font-bold text-[var(--text-heading)]">{torrent.progress}%</span>
                            </div>
                            <div className="w-full bg-[var(--border-main)] rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${torrent.progress}%` }}
                                className={`h-full rounded-full ${torrent.status === 'downloading' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                              ></motion.div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                              <ArrowDownCircle size={12} />
                              {torrent.downloadSpeed}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold">
                              <ArrowUpCircle size={12} />
                              {torrent.uploadSpeed}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden xl:table-cell">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${torrent.status === 'downloading' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
                            {torrent.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium">
                          <div className="flex flex-col">
                            <span className="text-[var(--text-main)] font-bold">{torrent.totalSize}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">{torrent.downloaded}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => togglePause(torrent)}
                              className={`p-2 rounded-lg transition-all ${torrent.status === 'paused' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'}`}
                            >
                              {torrent.status === 'paused' ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                            </button>
                            <button 
                              onClick={() => setDeletingTorrent(torrent)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet & Mobile View - Cards */}
              <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activeDownloads.map((torrent) => (
                  <motion.div 
                    key={torrent.infoHash}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${torrent.status === 'downloading' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[var(--text-heading)] truncate pr-2" title={torrent.name}>{torrent.name}</h3>
                          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">{torrent.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => togglePause(torrent)}
                          className={`p-2 rounded-lg transition-all ${torrent.status === 'paused' ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-muted)]'}`}
                        >
                          {torrent.status === 'paused' ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                        </button>
                        <button 
                          onClick={() => setDeletingTorrent(torrent)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-bold text-[var(--text-heading)]">{torrent.progress}%</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">{torrent.totalSize}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-main)] rounded-full h-2 overflow-hidden border border-[var(--border-main)]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${torrent.progress}%` }}
                            className={`h-full rounded-full ${torrent.status === 'downloading' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                          ></motion.div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-[var(--bg-main)]/50 rounded-xl p-2.5 border border-[var(--border-main)]">
                          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Download Speed</p>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                            <ArrowDownCircle size={12} />
                            {torrent.downloadSpeed}
                          </div>
                        </div>
                        <div className="bg-[var(--bg-main)]/50 rounded-xl p-2.5 border border-[var(--border-main)]">
                          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Upload Speed</p>
                          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold">
                            <ArrowUpCircle size={12} />
                            {torrent.uploadSpeed}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-1 text-[10px] text-[var(--text-muted)] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>Status: {torrent.status}</span>
                        </div>
                        <span>{torrent.downloaded} downloaded</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-[var(--text-muted)]">
              <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-main)]">
                <Download size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">No active downloads at the moment</p>
              <p className="text-xs opacity-50 mt-1">Add a new torrent to start downloading</p>
            </div>
          )}
        </div>
      </motion.div>

      <DeleteConfirmModal 
        isOpen={!!deletingTorrent} 
        onClose={() => setDeletingTorrent(null)} 
        onConfirm={handleDelete} 
        torrentName={deletingTorrent?.name} 
      />
    </div>
  );
};

export default Downloads;
