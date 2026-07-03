import React from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import './layout.css';

interface NavbarProps {
  onToggleSidebar: () => void;
  userName: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, userName, onLogout }) => {
  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">Espace Administration</h2>
      </div>
      <div className="navbar-right">
        <button className="nav-icon-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile-summary">
          <div className="avatar-placeholder">
            <User size={16} />
          </div>
          <span className="user-name">{userName}</span>
        </div>
        <button className="nav-icon-btn logout-btn" onClick={onLogout} title="Déconnexion">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
