import React from 'react';
import { ArrowLeft, Briefcase, User } from 'lucide-react';

type Role = 'CLIENT' | 'FREELANCER';

interface RoleSelectionProps {
  onBack: () => void;
  onGoToLogin: () => void;
  onSelectRole: (role: Role) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onBack,
  onGoToLogin,
  onSelectRole,
}) => {
  return (
    <div className="auth-outer-container">
      <div className="auth-card">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Retour
        </button>
        
        <div className="auth-header">
          <h2>Créer un compte</h2>
          <p>Choisissez le profil qui vous correspond pour démarrer</p>
        </div>

        <div className="roles-selector-grid">
          <button className="role-select-card" onClick={() => onSelectRole('FREELANCER')}>
            <div className="role-icon-wrapper icon-freelancer">
              <Briefcase size={24} />
            </div>
            <div className="role-details">
              <h3>Je suis Freelance</h3>
              <p>Je propose mes compétences, postule aux offres et gagne des revenus.</p>
            </div>
          </button>

          <button className="role-select-card" onClick={() => onSelectRole('CLIENT')}>
            <div className="role-icon-wrapper icon-client">
              <User size={24} />
            </div>
            <div className="role-details">
              <h3>Je suis Client</h3>
              <p>Je publie des projets, recherche des freelances et contractualise.</p>
            </div>
          </button>
        </div>

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
