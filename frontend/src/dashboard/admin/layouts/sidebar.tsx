import React from 'react';
import { LayoutDashboard, Users, FolderKanban, Tags, CreditCard, AlertTriangle, Settings, X, ShieldCheck, Mail } from 'lucide-react';
import './layout.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath, onNavigate }) => {
  const menuItems = [
    { name: 'Tableau de bord', path: 'dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Vérifications', path: 'verifications', icon: <ShieldCheck size={18} /> },
    { name: 'Utilisateurs', path: 'users', icon: <Users size={18} /> },
    { name: 'Projets', path: 'projects', icon: <FolderKanban size={18} /> },
    { name: 'Catégories', path: 'categories', icon: <Tags size={18} /> },
    { name: 'Paiements', path: 'payments', icon: <CreditCard size={18} /> },
    { name: 'Litiges', path: 'disputes', icon: <AlertTriangle size={18} /> },
    { name: 'Paramètres', path: 'settings', icon: <Settings size={18} /> },
    { name: 'Mailing', path: 'mailing', icon: <Mail size={18} /> },
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
              onClose(); // Ferme le menu sur mobile après clic
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
