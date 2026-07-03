import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import './layout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  userName: string;
  userId: number | null;
  onLogout: () => void;
  onPublishProject: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  userName,
  userId,
  onLogout,
  onPublishProject,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
        userId={userId}
      />
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className="dashboard-main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          onLogout={onLogout}
          onPublishProject={onPublishProject}
          onNavigate={onNavigate}
        />
        <main className="dashboard-page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
