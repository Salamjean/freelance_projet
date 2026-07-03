import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from './app';
import { ClientHome } from '../client-home';
import { PublishProject } from '../projects/publish-project';
import { ProjectList } from '../projects/project-list';
import { SearchFreelancers } from '../freelancers/search-freelancers';
import { SignContractClient } from '../projects/sign-contract-client';
import { MyContracts } from '../contracts/my-contracts';
import { ClientHistory } from '../history/client-history';
import { ClientChat } from '../chat/client-chat';

interface ClientLayoutWrapperProps {
  userId: number | null;
  userName: string;
  handleLogout: () => void;
}

export const ClientLayoutWrapper: React.FC<ClientLayoutWrapperProps> = ({
  userId,
  userName,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/client/projects')) return 'projects';
    if (path.endsWith('/client/publish')) return 'publish-project';
    if (path.endsWith('/client/freelancers')) return 'search-freelancers';
    if (path.includes('/client/contracts')) return 'contracts';
    if (path.includes('/client/history')) return 'history';
    if (path.includes('/client/chat')) return 'chat';
    return 'dashboard';
  };

  const currentPath = getActiveTab();

  const handleNavigate = (path: string) => {
    if (path === 'dashboard') navigate('/client/dashboard');
    else if (path === 'projects') navigate('/client/projects');
    else if (path === 'search-freelancers') navigate('/client/freelancers');
    else if (path === 'contracts') navigate('/client/contracts');
    else if (path === 'history') navigate('/client/history');
    else if (path === 'chat') navigate('/client/chat');
    else if (path === 'publish-project') {
      setEditingProject(null);
      navigate('/client/publish');
    }
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      userName={userName}
      userId={userId}
      onLogout={handleLogout}
      onPublishProject={() => {
        setEditingProject(null);
        navigate('/client/publish');
      }}
    >
      <Routes>
        <Route path="dashboard" element={
          <ClientHome
            userId={userId}
            onNavigate={(path) => {
              if (path === 'projects') navigate('/client/projects');
              else if (path === 'publish-project') navigate('/client/publish');
            }}
          />
        } />

        <Route path="projects" element={
          <ProjectList
            userId={userId}
            onPublishProject={() => {
              setEditingProject(null);
              navigate('/client/publish');
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              navigate('/client/publish');
            }}
          />
        } />

        <Route path="publish" element={
          <PublishProject
            userId={userId}
            projectToEdit={editingProject}
            onProjectPublished={() => {
              setEditingProject(null);
              navigate('/client/projects');
            }}
          />
        } />

        <Route path="freelancers" element={
          <SearchFreelancers userId={userId} />
        } />

        <Route path="projects/:projectId/applications/:appId/sign" element={<SignContractClient />} />
        
        <Route path="contracts" element={<MyContracts userId={userId} />} />

        <Route path="history" element={<ClientHistory userId={userId} />} />

        <Route path="chat" element={<ClientChat userId={userId} />} />

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};
