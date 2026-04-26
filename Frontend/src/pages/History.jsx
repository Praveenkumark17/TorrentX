import React from 'react';
import { Clock, CheckCircle2, XCircle, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const logs = [
    { id: 1, name: 'Windows_11_ISO_Retail.iso', date: '2024-03-24 14:20', status: 'completed', size: '5.2 GB' },
    { id: 2, name: 'Project_Venus_Final_Render.mp4', date: '2024-03-23 09:15', status: 'completed', size: '1.8 GB' },
    { id: 3, name: 'Unknown_File_Metadata.bin', date: '2024-03-22 18:45', status: 'failed', size: '0 KB' },
    { id: 4, name: 'VSCode_Setup_Win64.exe', date: '2024-03-21 11:30', status: 'completed', size: '92 MB' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
        <Clock className="text-amber-500" />
        Transfer History
      </h1>

      <div className="bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-[2rem] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-main)]">
              <tr className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest border-b border-[var(--border-main)]">
                <th className="px-8 py-5 flex items-center gap-2"><FileText size={14} /> File</th>
                <th className="px-6 py-5"><Calendar size={14} /> Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {logs.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[var(--bg-main)]/50 transition-colors"
                >
                  <td className="px-8 py-5 text-sm font-medium text-[var(--text-heading)]">{log.name}</td>
                  <td className="px-6 py-5 text-xs text-[var(--text-muted)]">{log.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {log.status === 'completed' ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500 uppercase">Completed</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-500" />
                          <span className="text-xs font-bold text-red-500 uppercase">Failed</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-[var(--text-muted)]">{log.size}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
