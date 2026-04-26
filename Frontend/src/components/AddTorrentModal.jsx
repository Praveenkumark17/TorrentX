import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Folder, Shield, Zap, Loader2 } from 'lucide-react';
import api from '../api';
import { useToast } from '../context/ToastContext';

const AddTorrentModal = ({ isOpen, onClose }) => {
  const [magnetURI, setMagnetURI] = useState('');
  const [savePath, setSavePath] = useState('E:\\Downloads\\Torrents');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async () => {
    if (!magnetURI) {
      addToast('Please enter a magnet link or URL', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/torrent/add', { 
        magnetURI,
        savePath
      });
      addToast('Torrent added successfully!', 'success');
      setMagnetURI('');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add torrent.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const response = await api.get('/torrent/browse-folder');
      if (response.data.path) {
        setSavePath(response.data.path);
        addToast('Folder selected', 'success');
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        addToast('Failed to open folder picker', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl text-purple-500">
                <PlusIcon size={20} md={24} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[var(--text-heading)]">Add Torrent</h2>
                <p className="text-[10px] md:text-xs text-[var(--text-muted)]">Paste a magnet link or URL</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                Magnet Link or URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  type="text" 
                  value={magnetURI}
                  onChange={(e) => setMagnetURI(e.target.value)}
                  placeholder="magnet:?xt=urn:btih:..." 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm text-[var(--text-main)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                Save Path
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                  <input 
                    type="text" 
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                    placeholder="E:\Downloads"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm text-[var(--text-main)]"
                  />
                </div>
                <button 
                  onClick={handleBrowse}
                  className="px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl md:rounded-2xl text-[10px] font-bold text-[var(--text-heading)] hover:bg-[var(--border-main)] transition-all whitespace-nowrap"
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                  Priority
                </label>
                <select className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl md:rounded-2xl py-2.5 md:py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm text-[var(--text-main)] appearance-none">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Sequential</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                  Network
                </label>
                <div className="flex items-center gap-2 py-2.5 md:py-3 px-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl md:rounded-2xl text-sm text-emerald-500 font-bold">
                  <Shield size={16} />
                  VPN Active
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 md:mt-10">
            <button 
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-3 md:py-4 bg-[var(--bg-main)] hover:bg-[var(--border-main)] text-[var(--text-heading)] font-bold rounded-xl md:rounded-2xl transition-all border border-[var(--border-main)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-[2] py-3 md:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                'Start Download'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PlusIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default AddTorrentModal;
