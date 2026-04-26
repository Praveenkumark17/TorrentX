import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText, 
  HardDrive, 
  Pause, 
  Play, 
  Trash2, 
  Users 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext';
import api from '../api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ['websocket', 'polling']
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [torrents, setTorrents] = useState([]);
  const [deletingTorrent, setDeletingTorrent] = useState(null);
  const [expandedTorrents, setExpandedTorrents] = useState(new Set());
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { addToast } = useToast();

  const toggleExpand = (infoHash) => {
    setExpandedTorrents(prev => {
      const next = new Set(prev);
      if (next.has(infoHash)) next.delete(infoHash);
      else next.add(infoHash);
      return next;
    });
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    const onConnect = () => {
      setIsConnected(true);
      if (userInfo?._id) {
        socket.emit('join', userInfo._id);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      onConnect();
    }

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

    socket.on('torrent_finished', (data) => {
      addToast(`Finished: ${data.name}`, 'success');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('initial_state');
      socket.off('torrent_update');
      socket.off('torrent_finished');
    };
  }, []);

  const togglePause = async (torrent) => {
    const action = torrent.status === 'paused' ? 'resume' : 'pause';
    try {
      await api.post(`/torrent/${action}`, { 
        infoHash: torrent.infoHash 
      });
    } catch (err) {
      addToast(`Failed to ${action} torrent`, 'error');
    }
  };

  const handleDelete = async (deleteData) => {
    try {
      await api.post('/torrent/delete', { 
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

  const stats = [
    { 
      label: 'Active Tasks', 
      value: torrents.filter(t => t.progress < 100 && t.status !== 'paused').length.toString(), 
      icon: Play, 
      color: 'text-purple-400' 
    },
    { 
      label: 'Total Size', 
      value: formatSize(torrents.reduce((acc, t) => acc + (t.rawLength || 0), 0)), 
      icon: HardDrive, 
      color: 'text-amber-400' 
    },
  ];

  const filteredTorrents = torrents.filter(t => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  return (
    <>
      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-10"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className={`p-2 rounded-xl bg-purple-500/10 ${stat.color} group-hover:scale-105 transition-transform flex-shrink-0`}>
                  <stat.icon size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[var(--text-muted)] text-[10px] md:text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-lg md:text-xl font-bold text-[var(--text-heading)] tracking-tight truncate">{stat.value}</h3>
                </div>
              </div>
              <ChevronRight size={14} className="text-[var(--text-muted)] flex-shrink-0 ml-2 md:w-4 md:h-4 hidden sm:block" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Torrent List Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col min-h-0 shadow-lg"
      >
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-bold text-[var(--text-heading)]">Active Torrents</h2>
          <div className="flex bg-[var(--bg-main)] rounded-lg p-1 border border-[var(--border-main)] overflow-x-auto no-scrollbar">
            {['all', 'downloading', 'seeding'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs font-semibold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[var(--bg-card)] text-[var(--text-heading)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {filteredTorrents.length > 0 ? (
            <>
              {/* Desktop View - Table */}
              <div className="hidden lg:block flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="sticky top-0 bg-[var(--bg-sidebar)] z-10 shadow-sm">
                    <tr className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--border-main)]">
                      <th className="px-8 py-4 w-[40%]">File Name</th>
                      <th className="px-6 py-4 w-[15%]">Progress</th>
                      <th className="px-6 py-4 w-[15%]">Speed</th>
                      <th className="px-6 py-4 w-[10%] hidden lg:table-cell">Peers</th>
                      <th className="px-6 py-4 w-[10%]">Size</th>
                      <th className="px-8 py-4 w-[10%] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-main)]">
                    {filteredTorrents.map((torrent) => (
                      <React.Fragment key={torrent.infoHash}>
                        <tr className="hover:bg-[var(--bg-main)] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3 min-w-0">
                              {torrent.files?.length > 1 ? (
                                <button 
                                  onClick={() => toggleExpand(torrent.infoHash)}
                                  className="p-1 hover:bg-[var(--bg-card)] rounded-md text-[var(--text-muted)] transition-all flex-shrink-0"
                                >
                                  {expandedTorrents.has(torrent.infoHash) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              ) : (
                                <div className="w-6 flex-shrink-0" />
                              )}
                              <div className={`p-2 rounded-lg flex-shrink-0 ${torrent.status === 'seeding' ? 'bg-blue-500/10 text-blue-400' : torrent.status === 'downloading' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
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
                                  className={`h-full rounded-full ${torrent.status === 'seeding' ? 'bg-blue-500' : 'bg-emerald-500'}`}
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
                          <td className="px-6 py-5 hidden lg:table-cell">
                            <div className="flex items-center gap-4 text-[var(--text-muted)]">
                              <div className="flex items-center gap-1.5">
                                <Users size={14} />
                                <span className="text-sm font-medium">{torrent.numPeers}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium">
                            <div className="flex flex-col">
                              <span className="text-[var(--text-main)] font-bold">{torrent.totalSize === '0 B' ? '--' : torrent.totalSize}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5 truncate">{torrent.downloaded}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => togglePause(torrent)}
                                className={`p-2 rounded-lg transition-all ${torrent.status === 'paused' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)]'}`}
                                title={torrent.status === 'paused' ? 'Resume' : 'Pause'}
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

                        <AnimatePresence>
                          {expandedTorrents.has(torrent.infoHash) && torrent.files?.length > 1 && (
                            <motion.tr 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[var(--bg-main)]/30"
                            >
                              <td colSpan="6" className="px-12 py-4">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                                    <FileText size={14} />
                                    Included Files ({torrent.files?.length || 0})
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    {torrent.files?.map((file, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-card)]/50 rounded-xl border border-[var(--border-main)] group/file hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="p-1.5 bg-[var(--bg-sidebar)] rounded-lg text-[var(--text-muted)] group-hover/file:text-purple-400 transition-colors">
                                            <FileText size={14} />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium text-[var(--text-main)] truncate" title={file.name}>{file.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{file.size}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                                          <div className="w-32">
                                            <div className="flex justify-between mb-1">
                                              <span className="text-[10px] font-bold text-[var(--text-muted)]">{file.progress}%</span>
                                            </div>
                                            <div className="w-full bg-[var(--border-main)] rounded-full h-1 overflow-hidden">
                                              <div 
                                                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${file.progress}%` }}
                                              />
                                            </div>
                                          </div>
                                          <span className="text-[10px] font-bold text-[var(--text-muted)] min-w-[70px] text-right">{file.downloaded}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet & Mobile View - Cards */}
              <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredTorrents.map((torrent) => (
                  <motion.div 
                    key={torrent.infoHash}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${torrent.status === 'seeding' ? 'bg-blue-500/10 text-blue-400' : torrent.status === 'downloading' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-[var(--text-muted)]'}`}>
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
                            className={`h-full rounded-full ${torrent.status === 'seeding' ? 'bg-blue-500' : 'bg-emerald-500'}`}
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
                          <Users size={12} />
                          <span>{torrent.numPeers} Peers</span>
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
                <FileText size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">No active torrents found</p>
              <p className="text-xs opacity-50 mt-1">Try changing the filter or add a new torrent</p>
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
    </>
  );
};

export default Dashboard;
