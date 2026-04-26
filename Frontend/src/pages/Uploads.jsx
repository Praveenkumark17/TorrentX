import React from 'react';
import { ArrowUpCircle, Share2, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Uploads = () => {
  const uploads = [
    { id: 1, name: 'Open_Source_Dataset_2024.zip', ratio: '2.4', speed: '1.2 MB/s', seeds: 42, peers: 156 },
    { id: 2, name: 'Linux_Kernel_Custom_Build.tar.gz', ratio: '1.8', speed: '420 KB/s', seeds: 12, peers: 89 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
        <ArrowUpCircle className="text-blue-500" />
        Seeding Tasks
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploads.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-3xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Share2 size={24} />
              </div>
              <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full uppercase tracking-wider">
                Ratio: {item.ratio}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-[var(--text-heading)] mb-4 truncate">{item.name}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-main)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">Upload Speed</p>
                <div className="flex items-center gap-2 text-blue-500 font-bold">
                  <Activity size={16} />
                  {item.speed}
                </div>
              </div>
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-main)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">Active Peers</p>
                <div className="flex items-center gap-2 text-[var(--text-heading)] font-bold">
                  <Users size={16} />
                  {item.peers}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Uploads;
