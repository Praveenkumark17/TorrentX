

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Downloads from './pages/Downloads';
import Uploads from './pages/Uploads';
import Security from './pages/Security';
import History from './pages/History';
import AllFiles from './pages/AllFiles';
import Trash from './pages/Trash';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />

          {/* Main App Routes wrapped in Layout */}
          <Route 
            path="/dashboard" 
            element={<Layout><Dashboard /></Layout>} 
          />
          <Route 
            path="/downloads" 
            element={<Layout><Downloads /></Layout>} 
          />
          <Route 
            path="/uploads" 
            element={<Layout><Uploads /></Layout>} 
          />
          <Route 
            path="/security" 
            element={<Layout><Security /></Layout>} 
          />
          <Route 
            path="/history" 
            element={<Layout><History /></Layout>} 
          />
          <Route 
            path="/files" 
            element={<Layout><AllFiles /></Layout>} 
          />
          <Route 
            path="/trash" 
            element={<Layout><Trash /></Layout>} 
          />

          {/* Catch all redirect to login if not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
