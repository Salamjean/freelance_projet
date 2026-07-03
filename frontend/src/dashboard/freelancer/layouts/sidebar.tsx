import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, UserCheck, Search, Send, FileText, Wallet, MessageSquare, Settings, X, Mail, History } from 'lucide-react';
import './layout.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  userId?: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath, onNavigate, userId }) => {
  const [stats, setStats] = useState({
    activeMissions: 0,
    pendingApplications: 0,
    pendingInvitations: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    const fetchStats = () => {
      if (userId) {
        axios.get(`http://192.168.1.18:3000/api/freelance/${userId}/sidebar-stats`)
          .then(res => setStats(res.data))
          .catch(err => console.error("Erreur stats sidebar", err));
      }
    };

    fetchStats();

    window.addEventListener('refreshSidebarStats', fetchStats);
    const intervalId = setInterval(fetchStats, 15000);

    return () => {
      window.removeEventListener('refreshSidebarStats', fetchStats);
      clearInterval(intervalId);
    };
  }, [userId]);

  const menuItems = [
    { name: 'Rechercher des projets', path: 'search-projects', icon: <Search size={18} /> },
    { name: 'Mes Missions', path: 'missions', icon: <FileText size={18} />, badge: stats.activeMissions },
    { name: 'Candidatures', path: 'applications', icon: <Send size={18} />, badge: stats.pendingApplications },
    { name: 'Messagerie', path: 'chat', icon: <MessageSquare size={18} />, badge: stats.unreadMessages },
    { name: 'Invitations', path: 'invitations', icon: <Mail size={18} />, badge: stats.pendingInvitations },
    { name: 'Portefeuille', path: 'wallet', icon: <Wallet size={18} /> },
    { name: 'Statistiques', path: 'dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Historique', path: 'history', icon: <History size={18} /> },
    { name: 'Profil professionnel', path: 'profile', icon: <UserCheck size={18} /> },
    { name: 'Paramètres', path: 'settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-blue">Free</span><span className="logo-white">Link</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => {
              onNavigate(item.path);
              onClose();
            }}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.badge && item.badge > 0 ? (
              <span className="sidebar-badge">{item.badge}</span>
            ) : null}
          </button>
        ))}
      </nav>
    </aside>
  );
};
