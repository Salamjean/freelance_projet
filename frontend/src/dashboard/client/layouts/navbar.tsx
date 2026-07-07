import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, Menu, Plus, ChevronDown } from 'lucide-react';
import axios from 'axios';
import './layout.css';

interface NavbarProps {
  onToggleSidebar: () => void;
  userName: string;
  onLogout: () => void;
  onPublishProject: () => void;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  userName,
  onLogout,
  onPublishProject,
  onNavigate,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios.get(`http://localhost:3000/api/auth/profile/${userId}/notifications`)
        .then(res => {
          setNotifications(res.data);
        })
        .catch(err => console.error("Erreur notifications", err));
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await axios.put(`http://localhost:3000/api/auth/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la notification", err);
      }
    }
    
    setNotificationsOpen(false);
    
    // Navigation selon le type de notification
    if (notif.type === 'new_application' || notif.type === 'application_status' || notif.type === 'invitation_status') {
      onNavigate('projects');
    } else if (notif.type === 'mission_delivered' || notif.type === 'mission_dispute' || notif.type === 'advance_claimed') {
      onNavigate('contracts');
    }
  };

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">Espace Client</h2>
      </div>
      <div className="navbar-right">
        <button className="btn btn-primary btn-publish-nav" onClick={onPublishProject}>
          <Plus size={16} /> Publier un projet
        </button>

        <div style={{ position: 'relative' }}>
          <button className="nav-icon-btn" onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setDropdownOpen(false);
          }}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {notificationsOpen && (
            <div className="notifications-dropdown" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: '-50px', width: '320px', backgroundColor: 'white',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', borderRadius: '12px', zIndex: 1000,
              maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 2 }}>
                <span>Notifications</span>
                {unreadCount > 0 && <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px' }}>{unreadCount} non lues</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                    <Bell size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid #f8fafc', 
                        backgroundColor: n.isRead ? 'white' : '#f0f9ff',
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'background-color 0.2s'
                      }} 
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div style={{ fontSize: '14px', fontWeight: n.isRead ? '500' : '600', color: '#1e293b', marginBottom: '4px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                        {n.content}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                        {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile-wrapper">
          <div className="user-profile-summary" onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setNotificationsOpen(false);
          }}>
            <div className="avatar-placeholder">
              <User size={16} />
            </div>
            <span className="user-name">{userName}</span>
            <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  onNavigate('profile');
                  setDropdownOpen(false);
                }}
              >
                <User size={14} /> Mon Profil
              </button>
              <button
                className="dropdown-item logout-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
