import React from 'react';
import { Trash2, RotateCcw, XOctagon, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Trash = () => {
  const deletedFiles = [
    { id: 1, name: 'Old_Project_Backup.rar', size: '256 MB', deletedAt: '2 days ago' },
    { id: 2, name: 'Duplicate_Movie_File.mkv', size: '4.2 GB', deletedAt: 'Yesterday' },
    { id: 3, name: 'Corrupted_Installer.exe', size: '15 MB', deletedAt: '3 hours ago' },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
          <Trash2 className="text-red-500" />
          Trash
        </h1>
        <button className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-red-500/20 transition-all">
          <XOctagon size={18} />
          Empty Trash
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-500"
      >
        <AlertTriangle size={20} />
        <p className="text-sm font-medium">Items in trash will be permanently deleted after 30 days.</p>
      </motion.div>

      <div className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-[2rem] overflow-hidden flex flex-col shadow-lg min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-main)]">
              <tr className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest border-b border-[var(--border-main)]">
                <th className="px-8 py-5">File</th>
                <th className="px-6 py-5">Deleted</th>
                <th className="px-6 py-5">Size</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {deletedFiles.map((file, i) => (
                <motion.tr 
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-red-500/5 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-heading)]">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs text-[var(--text-muted)] font-medium">{file.deletedAt}</td>
                  <td className="px-6 py-5 text-xs font-bold text-[var(--text-main)]">{file.size}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-all"
                        title="Restore"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                      <button className="p-2 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-transparent hover:border-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trash;
