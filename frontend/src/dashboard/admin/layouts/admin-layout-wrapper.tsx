import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout as AdminLayout } from './app';
import { AdminHome } from '../admin-home';
import { AdminVerifications } from '../admin-verifications';
import { AdminUsers } from '../admin-users';
import { AdminProjects } from '../admin-projects';
import { AdminCategories } from '../admin-categories';
import { AdminPayments } from '../admin-payments';
import { AdminDisputes } from '../admin-disputes';
import { AdminSettings } from '../admin-settings';
import { AdminMailing } from '../admin-mailing';

interface AdminLayoutWrapperProps {
  userName: string;
  handleLogout: () => void;
}

export const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({
  userName,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/admin/verifications')) return 'verifications';
    if (path.endsWith('/admin/users')) return 'users';
    if (path.endsWith('/admin/projects')) return 'projects';
    if (path.endsWith('/admin/categories')) return 'categories';
    if (path.endsWith('/admin/payments')) return 'payments';
    if (path.endsWith('/admin/disputes')) return 'disputes';
    if (path.endsWith('/admin/settings')) return 'settings';
    if (path.endsWith('/admin/mailing')) return 'mailing';
    return 'dashboard';
  };

  const currentPath = getActiveTab();

  const handleNavigate = (path: string) => {
    navigate(`/admin/${path}`);
  };

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      userName={userName}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="mailing" element={<AdminMailing />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};
