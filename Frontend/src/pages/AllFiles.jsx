import React from 'react';
import { FileText, MoreVertical, Download, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const AllFiles = () => {
  const files = [
    { id: 1, name: 'Cyberpunk_2077_Update_v2.1.zip', size: '12.4 GB', date: 'Today', type: 'Archive' },
    { id: 2, name: 'Ubuntu-24.04-desktop-amd64.iso', size: '4.8 GB', date: 'Yesterday', type: 'Disc Image' },
    { id: 3, name: 'Blender_Project_Assets_v4.rar', size: '1.2 GB', date: '2 days ago', type: 'Archive' },
    { id: 4, name: 'NodeJS_Masterclass_Videos.mkv', size: '15.6 GB', date: '3 days ago', type: 'Video' },
    { id: 5, name: 'Adobe_Photoshop_2024.dmg', size: '2.8 GB', date: 'Last week', type: 'Installer' },
    { id: 6, name: 'Project_Alpha_Final.pdf', size: '42 MB', date: 'Last week', type: 'Document' },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
          <FileText className="text-blue-500" />
          All Files
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
            <Download size={18} />
            Download All
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-[2rem] overflow-hidden flex flex-col shadow-lg min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[var(--bg-main)] z-10">
              <tr className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest border-b border-[var(--border-main)]">
                <th className="px-8 py-5">Name</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Added</th>
                <th className="px-6 py-5">Size</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {files.map((file, i) => (
                <motion.tr 
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[var(--bg-main)]/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-heading)] group-hover:text-blue-500 transition-colors">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs px-2.5 py-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-full text-[var(--text-muted)] font-medium">
                      {file.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-[var(--text-muted)] font-medium">{file.date}</td>
                  <td className="px-6 py-5 text-xs font-bold text-[var(--text-main)]">{file.size}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-blue-500/10 rounded-lg text-[var(--text-muted)] hover:text-blue-500 transition-all">
                        <Download size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all">
                        <MoreVertical size={18} />
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

export default AllFiles;
