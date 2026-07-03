import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_URL, setLogoutHandler } from './lib/axios-config';
import { ClientLayoutWrapper } from './dashboard/client/layouts/client-layout-wrapper';
import { FreelancerLayoutWrapper } from './dashboard/freelancer/layouts/freelancer-layout-wrapper';
import { AdminLayoutWrapper } from './dashboard/admin/layouts/admin-layout-wrapper';
import { Login } from './auth/login';
import { Register } from './auth/register';
import { ExploreProjects } from './public/explore-projects';
import { Accueil } from './public/accueil';
import './App.css';

type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER';

// ─── État global de l'application ────────────────────────────────────────────


function AppContent() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('userId');
    return saved ? parseInt(saved, 10) : null;
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('userBalance');
    return saved ? parseFloat(saved) : 0;
  });

  // ── Déconnexion ─────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    ['userId', 'userName', 'userRole', 'userBalance', 'accessToken', 'refreshToken']
      .forEach((key) => localStorage.removeItem(key));
    setUserId(null);
    setUserName('');
    setBalance(0);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    setLogoutHandler(handleLogout);
  }, [handleLogout]);

  // ── WebSocket Global (Force Logout) ─────────────────────────────────────
  useEffect(() => {
    if (userId) {
      const socket = io(API_URL, {
        query: { userId: userId.toString() }
      });

      socket.on('force_logout', () => {
        handleLogout();
      });

      return () => {
        socket.close();
      };
    }
  }, [userId]);

  // ── Connexion ───────────────────────────────────────────────────────────
  const handleLoginSuccess = (
    id: number,
    name: string,
    role: Role,
    userBalance: number,
    token?: string,
    refresh?: string
  ) => {
    setUserId(id);
    setUserName(name);
    setBalance(userBalance);
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userBalance', userBalance.toString());
    if (token) localStorage.setItem('accessToken', token);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  };

  // ── Inscription ─────────────────────────────────────────────────────────
  const handleRegisterSuccess = (
    id: number,
    name: string,
    role: 'CLIENT' | 'FREELANCER',
    token?: string,
    refresh?: string
  ) => {
    setUserId(id);
    setUserName(name);
    setBalance(0);
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userBalance', '0');
    if (token) localStorage.setItem('accessToken', token);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  };

  const userRole = localStorage.getItem('userRole');
  const getDashboardPath = () => {
    if (userRole === 'CLIENT') return '/client/dashboard';
    if (userRole === 'FREELANCER') return '/freelancer/search-projects';
    if (userRole === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <Routes>
      {/* ── Pages publiques ──────────────────────────────────── */}
      <Route path="/" element={
        userId ? <Navigate to={getDashboardPath()} replace /> :
        <Accueil onNavigateTo={(screen) => {
          if (screen === 'LANDING') navigate('/');
          else if (screen === 'LOGIN') navigate('/login');
          else if (screen === 'REGISTER') navigate('/register');
          else if (screen === 'EXPLORE_PROJECTS') navigate('/explorer');
        }} />
      } />

      <Route path="/explorer" element={
        <ExploreProjects
          onBackToLanding={() => navigate('/')}
          onGoToLogin={() => navigate('/login')}
          onGoToRegister={() => navigate('/register')}
        />
      } />

      <Route path="/login" element={
        userId ? <Navigate to={getDashboardPath()} replace /> :
        <Login
          onBack={() => navigate('/')}
          onGoToRegister={() => navigate('/register')}
          onLoginSuccess={(id, name, role, userBalance, token, refresh) => {
            handleLoginSuccess(id, name, role, userBalance, token, refresh);
            if (role === 'CLIENT') navigate('/client/dashboard');
            else if (role === 'FREELANCER') navigate('/freelancer/search-projects');
            else if (role === 'ADMIN') navigate('/admin/dashboard');
          }}
        />
      } />

      <Route path="/register" element={
        userId ? <Navigate to={getDashboardPath()} replace /> :
        <Register
          onBackToLanding={() => navigate('/')}
          onGoToLogin={() => navigate('/login')}
          onRegisterSuccess={(id, name, role, token, refresh) => {
            handleRegisterSuccess(id, name, role, token, refresh);
            if (role === 'CLIENT') navigate('/client/dashboard');
            else if (role === 'FREELANCER') navigate('/freelancer/search-projects');
          }}
        />
      } />

      {/* ── Espace Client ────────────────────────────────────── */}
      <Route path="/client/*" element={
        localStorage.getItem('userRole') === 'CLIENT' ? (
          <ClientLayoutWrapper
            userId={userId}
            userName={userName}
            handleLogout={handleLogout}
          />
        ) : <Navigate to="/login" replace />
      } />

      {/* ── Espace Freelance ─────────────────────────────────── */}
      <Route path="/freelancer/*" element={
        localStorage.getItem('userRole') === 'FREELANCER' ? (
          <FreelancerLayoutWrapper
            userId={userId}
            userName={userName}
            handleLogout={handleLogout}
            balance={balance}
            setBalance={setBalance}
          />
        ) : <Navigate to="/login" replace />
      } />

      {/* ── Espace Admin ─────────────────────────────────────── */}
      <Route path="/admin/*" element={
        localStorage.getItem('userRole') === 'ADMIN' ? (
          <AdminLayoutWrapper
            userName={userName}
            handleLogout={handleLogout}
          />
        ) : <Navigate to="/login" replace />
      } />

      {/* ── Redirection par défaut ───────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Point d'entrée de l'application ─────────────────────────────────────────

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
