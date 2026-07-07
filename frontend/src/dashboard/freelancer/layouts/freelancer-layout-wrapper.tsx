import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AppLayout } from './app';
import { FreelancerHome } from '../freelancer-home';
import { FreelancerProfileEdit } from '../profile/freelancer-profile-edit';
import { SearchProjects } from '../projects/search-projects';
import { MyApplications } from '../projects/my-applications';
import { MyInvitations } from '../invitations/my-invitations';
import { MyMissions } from '../projects/my-missions';
import { SignContractFreelance } from '../projects/sign-contract-freelance';
import { ProjectDetails } from '../projects/project-details';
import { MyWallet } from '../wallet/my-wallet';
import { FreelancerHistory } from '../history/freelancer-history';
import { FreelancerChat } from '../chat/freelancer-chat';
import { Subscription } from '../subscription/subscription';

interface FreelancerLayoutWrapperProps {
  userId: number | null;
  userName: string;
  handleLogout: () => void;
  balance: number;
  setBalance?: (val: number) => void;
}

export const FreelancerLayoutWrapper: React.FC<FreelancerLayoutWrapperProps> = ({
  userId,
  userName,
  handleLogout,
  balance,
  setBalance,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchVerificationStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/auth/profile/${userId}`);
        setIsVerified(res.data.idVerificationStatus === 'APPROVED');
        setAvatarUrl(res.data.avatarUrl || null);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/freelance/${userId}/wallet`);
        if (setBalance && res.data && res.data.balance !== undefined) {
          setBalance(Number(res.data.balance));
          localStorage.setItem('userBalance', res.data.balance.toString());
        }
      } catch (err) {
        console.error('Erreur récupération wallet', err);
      }
    };
    fetchVerificationStatus();
    fetchWallet();
  }, [userId, setBalance]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/freelancer/profile')) return 'profile';
    if (path.endsWith('/freelancer/search-projects')) return 'search-projects';
    if (path.endsWith('/freelancer/applications')) return 'applications';
    if (path.endsWith('/freelancer/invitations')) return 'invitations';
    if (path.endsWith('/freelancer/missions')) return 'missions';
    if (path.endsWith('/freelancer/wallet')) return 'wallet';
    if (path.endsWith('/freelancer/history')) return 'history';
    if (path.endsWith('/freelancer/subscription')) return 'subscription';
    if (path.includes('/freelancer/chat')) return 'chat';
    return 'dashboard';
  };

  const currentPath = getActiveTab();

  const handleNavigate = (path: string) => {
    if (path === 'dashboard') navigate('/freelancer/dashboard');
    else if (path === 'profile') navigate('/freelancer/profile');
    else if (path === 'search-projects') navigate('/freelancer/search-projects');
    else if (path === 'applications') navigate('/freelancer/applications');
    else if (path === 'invitations') navigate('/freelancer/invitations');
    else if (path === 'missions') navigate('/freelancer/missions');
    else if (path === 'wallet') navigate('/freelancer/wallet');
    else if (path === 'history') navigate('/freelancer/history');
    else if (path === 'subscription') navigate('/freelancer/subscription');
    else if (path === 'chat') navigate('/freelancer/chat');
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      userName={userName}
      onLogout={handleLogout}
      balance={balance}
      isVerified={isVerified}
      avatarUrl={avatarUrl}
      userId={userId}
    >
      <Routes>
        <Route path="dashboard" element={
          <FreelancerHome
            userId={userId}
            onNavigateToProfile={() => navigate('/freelancer/profile')}
          />
        } />
        <Route path="profile" element={
          <FreelancerProfileEdit userId={userId} userName={userName} />
        } />
        <Route path="search-projects" element={
          <SearchProjects userId={userId} />
        } />
        <Route path="applications" element={
          <MyApplications userId={userId} />
        } />
        <Route path="invitations" element={
          <MyInvitations userId={userId} />
        } />
        <Route path="missions" element={
          <MyMissions userId={userId} />
        } />
        <Route path="missions/:contractId/sign" element={
          <SignContractFreelance userId={userId} />
        } />
        <Route path="projects/:projectId" element={<ProjectDetails userId={userId} />} />
        
        <Route path="wallet" element={<MyWallet userId={userId} />} />

        <Route path="history" element={<FreelancerHistory userId={userId} />} />

        <Route path="chat" element={<FreelancerChat userId={userId} />} />

        <Route path="subscription" element={<Subscription userId={userId} />} />

        <Route path="*" element={<Navigate to="search-projects" replace />} />
      </Routes>
    </AppLayout>
  );
};
