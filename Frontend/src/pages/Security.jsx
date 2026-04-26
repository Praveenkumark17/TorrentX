import React from 'react';
import { Shield, Lock, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Security = () => {
  const securityStats = [
    { label: 'VPN Status', value: 'Connected', icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Encryption', value: 'AES-256', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'IP Masking', value: 'Enabled', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--text-heading)] flex items-center gap-3">
        <Shield className="text-purple-500" />
        Privacy & Security
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-3xl p-6 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-[var(--text-heading)]">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-[2rem] p-8">
        <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6 flex items-center gap-2">
          <CheckCircle className="text-emerald-500" size={20} />
          System Integrity Check
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--text-main)]">Threat Database updated</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">Just now</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--text-main)]">Firewall active and monitoring</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">Active</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-amber-500">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">3 trackers blocked in the last hour</span>
            </div>
            <span className="text-xs font-bold">Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
