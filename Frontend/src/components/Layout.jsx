import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ArrowUpCircle, 
  Shield, 
  Clock, 
  FileText, 
  Trash2, 
  LayoutDashboard, 
  Zap, 
  Settings, 
  Search, 
  Plus, 
  Menu, 
  Sun, 
  Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import AddTorrentModal from './AddTorrentModal';

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Download, label: "Downloads", path: "/downloads" },
    { icon: ArrowUpCircle, label: "Uploads", path: "/uploads" },
    { icon: Shield, label: "Security", path: "/security" },
    { icon: Clock, label: "History", path: "/history" },
  ];

  const libraryItems = [
    { icon: FileText, label: "All Files", path: "/files" },
    { icon: Trash2, label: "Trash", path: "/trash" },
  ];

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
  };

  const SidebarContent = () => (
    <>
      {/* Profile Top */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--text-heading)] truncate">
              {user?.name || 'Guest User'}
            </h3>
            <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest mt-0.5">Pro Member</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavItem 
            key={item.path} 
            icon={item.icon} 
            label={item.label} 
            path={item.path} 
            active={location.pathname === item.path} 
          />
        ))}
        
        <div className="pt-8 pb-2 px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Library
        </div>
        
        {libraryItems.map((item) => (
          <NavItem 
            key={item.path} 
            icon={item.icon} 
            label={item.label} 
            path={item.path} 
            active={location.pathname === item.path} 
          />
        ))}
      </nav>

      {/* Storage & Bottom Actions */}
      <div className="p-4 space-y-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-main)] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cloud Storage</span>
            <span className="text-[10px] font-bold text-[var(--text-heading)]">82%</span>
          </div>
          <div className="w-full bg-[var(--bg-main)] rounded-full h-1.5 mb-3 border border-[var(--border-main)] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <button className="w-full py-2 bg-[var(--bg-main)] hover:bg-[var(--border-main)] text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)]">
            Upgrade Plan
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <button 
            className="p-3 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)] rounded-xl border border-[var(--border-main)] transition-all group flex-shrink-0"
            title="Settings"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
          </button>
          <Link 
            to="/" 
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-3 py-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all group font-bold uppercase tracking-[0.2em] text-[10px]"
          >
            <ArrowUpCircle size={18} className="rotate-90 group-hover:-translate-x-1 transition-transform" />
            Logout
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex h-screen font-sans selection:bg-purple-500/30 overflow-hidden"
    >
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-main)' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-64 border-r flex flex-col hidden lg:flex"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] z-[70] flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <motion.header 
          initial={false}
          animate={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-main)' }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="h-20 border-b flex items-center justify-between px-4 md:px-8 backdrop-blur-md z-10"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-48 xl:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm text-[var(--text-main)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsLight(!isLight)}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all hover:scale-110 active:scale-95 overflow-hidden w-10 h-10 flex items-center justify-center"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isLight ? 'light' : 'dark'}
                  initial={{ y: 20, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -20, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  {isLight ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden xs:inline">Add Torrent</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </motion.header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>

      <AddTorrentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </motion.div>
  );
};

const NavItem = ({ icon: Icon, label, path, active = false }) => (
  <Link 
    to={path} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
      active 
        ? 'bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-inner' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-heading)]'
    }`}
  >
    <Icon size={20} className={active ? 'text-purple-600 dark:text-purple-400' : 'group-hover:text-[var(--text-heading)]'} />
    {label}
  </Link>
);

export default Layout;
