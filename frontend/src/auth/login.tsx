import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER';

interface LoginProps {
  onBack: () => void;
  onGoToRegister: () => void;
  onLoginSuccess: (userId: number, userName: string, role: Role, balance: number, token?: string, refresh?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, onGoToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Veuillez saisir votre e-mail et mot de passe.");
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.18:3000/api/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      
      Swal.fire({
        title: 'Connexion réussie !',
        text: 'Redirection vers votre espace...',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
        heightAuto: false,
      }).then(() => {
        const displayName = user.profile?.firstName && user.profile?.lastName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.email.split('@')[0];
        onLoginSuccess(user.id, displayName, user.role, user.balance || 0, accessToken, refreshToken);
      });
    } catch (err: any) {
      console.error("Échec connexion API :", err);
      const message = err.response?.data?.message || "Identifiants incorrects ou serveur indisponible.";
      setError(message);
    }
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-card">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Accueil
        </button>

        <div className="auth-header">
          <h2>Se connecter</h2>
          <p>Accédez à votre espace professionnel</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Adresse E-mail</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-control"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="password-input-wrapper input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                tabIndex={-1}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Connexion
          </button>
        </form>

        <p className="auth-footer-text">
          Nouveau sur la plateforme ?{' '}
          <button className="link-btn" onClick={onGoToRegister}>
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};
