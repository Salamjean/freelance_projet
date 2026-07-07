import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { RoleSelection } from './role-selection';
import axios from 'axios';
import Swal from 'sweetalert2';

type Role = 'CLIENT' | 'FREELANCER';

interface RegisterProps {
  onBackToLanding: () => void;
  onGoToLogin: () => void;
  onRegisterSuccess: (userId: number, userName: string, role: 'CLIENT' | 'FREELANCER', token?: string, refresh?: string) => void;
}

export const Register: React.FC<RegisterProps> = ({
  onBackToLanding,
  onGoToLogin,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<'SELECT_ROLE' | 'FORM'>('SELECT_ROLE');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // États de formulaires
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setError(null);
    setStep('FORM');
  };

  const handleBack = () => {
    if (step === 'FORM') {
      setStep('SELECT_ROLE');
      setSelectedRole(null);
      setError(null);
    } else {
      onBackToLanding();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !firstName || !lastName) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const payload = {
        email,
        password,
        role: selectedRole,
        firstName,
        lastName,
      };

      await axios.post('http://localhost:3000/api/auth/register', payload);

      // Effectuer une auto-connexion pour récupérer les tokens réels
      let token: string | undefined;
      let refresh: string | undefined;
      let userId = 0;
      try {
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', { email, password });
        token = loginRes.data.accessToken;
        refresh = loginRes.data.refreshToken;
        userId = loginRes.data.user?.id || 0;
      } catch (loginErr) {
        console.warn("Échec de la tentative de connexion automatique après inscription.", loginErr);
      }
      
      Swal.fire({
        title: 'Inscription réussie !',
        text: 'Redirection automatique en cours...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        heightAuto: false,
      }).then(() => {
        onRegisterSuccess(userId, `${firstName} ${lastName}`, selectedRole || 'CLIENT', token, refresh);
      });
    } catch (err: any) {
      console.error("Échec d'inscription API :", err);
      const message = err.response?.data?.message || "Impossible de créer le compte. Veuillez réessayer.";
      setError(message);
    }
  };

  // --- RENDU SELECT ROLE (délégué au composant RoleSelection) ---
  if (step === 'SELECT_ROLE') {
    return (
      <RoleSelection
        onBack={handleBack}
        onGoToLogin={onGoToLogin}
        onSelectRole={handleSelectRole}
      />
    );
  }

  // --- RENDU FORMULAIRE ---
  return (
    <div className="auth-outer-container">
      <div className="auth-card">
        <button className="back-btn" onClick={handleBack}>
          Précédent
        </button>

        <div className="auth-header">
          <h2>Inscription {selectedRole === 'FREELANCER' ? 'Freelance' : 'Client'}</h2>
          <p>Créez votre profil professionnel en quelques instants</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="auth-form">
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Amadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Diallo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse E-mail *</label>
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <div className="password-input-wrapper input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmez le mot de passe *</label>
              <div className="password-input-wrapper input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Ressaisissez"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Créer mon compte
          </button>
        </form>

        <p className="auth-footer-text">
          Déjà inscrit ?{' '}
          <button className="link-btn" onClick={onGoToLogin}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};
