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
  balance: number;
  isVerified?: boolean;
  avatarUrl?: string | null;
  userId?: number | null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  userName,
  onLogout,
  balance,
  isVerified,
  avatarUrl,
  userId,
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
          balance={balance}
          onNavigate={onNavigate}
          isVerified={isVerified}
          avatarUrl={avatarUrl}
          userId={userId}
        />
        <main className="dashboard-page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
