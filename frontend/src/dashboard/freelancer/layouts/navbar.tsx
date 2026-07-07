import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, User, LogOut, Menu, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react';
import './layout.css';

interface NavbarProps {
  onToggleSidebar: () => void;
  userName: string;
  onLogout: () => void;
  balance: number;
  onNavigate: (path: string) => void;
  isVerified?: boolean;
  avatarUrl?: string | null;
  userId?: number | null;
}

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  userName,
  onLogout,
  balance,
  onNavigate,
  isVerified,
  avatarUrl,
  userId,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/auth/profile/${userId}/notifications`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications', err);
      }
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await axios.put(`http://localhost:3000/api/auth/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Error marking as read', err);
      }
    }
    
    // Navigation basée sur le type de notification
    setShowNotifications(false);
    if (notif.type === 'invitation') {
      onNavigate('invitations');
    } else if (
      notif.type === 'contract_signed' || 
      notif.type === 'application_status' || 
      notif.type === 'advance_validated' || 
      notif.type === 'delivery_validated' || 
      notif.type === 'delivery_disputed'
    ) {
      onNavigate('missions');
    } else {
      onNavigate('dashboard');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">Espace Freelance</h2>
      </div>

      <div className="navbar-right">
        {/* Badge solde du portefeuille */}
        <div 
          className="freelancer-balance-header" 
          title="Solde de votre portefeuille"
          onClick={() => onNavigate('wallet')}
          style={{ cursor: 'pointer' }}
        >
          <Wallet size={16} />
          <span>{balance.toLocaleString('fr-FR')} XOF</span>
        </div>

        {/* Notifications */}
        <div className="nav-notifications-wrapper" style={{ position: 'relative' }}>
          <button 
            className="nav-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown-menu" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '320px',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              zIndex: 100,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px 0',
              marginTop: '8px'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  Aucune notification
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: notif.isRead ? 'transparent' : '#f0fdf4',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: notif.isRead ? 500 : 600, color: '#0f172a' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {notif.content}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dropdown utilisateur */}
        <div className="user-profile-wrapper">
          <div className="user-profile-summary" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="avatar-placeholder" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={16} />
              )}
            </div>
            <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {userName}
              {isVerified && (
                <span title="Profil certifié" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CheckCircle2 size={14} fill="#3b82f6" color="white" />
                </span>
              )}
            </span>
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
