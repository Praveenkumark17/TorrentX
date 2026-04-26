import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle, CheckSquare, Square } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, torrentName }) => {
  const [deleteData, setDeleteData] = useState(true);

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
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[var(--bg-sidebar)] border border-red-500/20 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-3xl text-red-500">
              <Trash2 size={40} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-heading)] text-center mb-2">Delete Torrent?</h2>
          <p className="text-sm text-[var(--text-muted)] text-center mb-8 px-4 leading-relaxed">
            You are about to remove <span className="font-bold text-[var(--text-heading)]">"{torrentName}"</span>. This action cannot be undone.
          </p>

          <div className="space-y-4 mb-10">
            <button 
              onClick={() => setDeleteData(!deleteData)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${deleteData ? 'bg-red-500/5 border-red-500/30 text-red-500' : 'bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)]'}`}
            >
              {deleteData ? <CheckSquare size={20} className="fill-current" /> : <Square size={20} />}
              <div className="text-left">
                <p className="text-sm font-bold">Delete physical files</p>
                <p className="text-[10px] uppercase font-bold opacity-60">Removes data from your hard drive</p>
              </div>
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-[var(--bg-main)] hover:bg-[var(--border-main)] text-[var(--text-heading)] font-bold rounded-2xl transition-all border border-[var(--border-main)]"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(deleteData)}
              className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95"
            >
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
