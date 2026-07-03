import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import './layout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  userName: string;
  onLogout: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  userName,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout-container">
      {/* Sidebar de navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
      
      {/* Overlay pour fermer la sidebar sur mobile en cliquant à l'extérieur */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Contenu principal */}
      <div className="dashboard-main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          onLogout={onLogout}
        />
        <main className="dashboard-page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
