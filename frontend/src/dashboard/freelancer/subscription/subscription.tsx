import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import './subscription.css';

interface SubscriptionProps {
  userId: number | null;
}

export const Subscription: React.FC<SubscriptionProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        'http://192.168.1.18:3000/api/subscriptions/checkout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Assurez-vous que le token est stocké
          }
        }
      );
      
      if (response.data.success && response.data.url) {
        // Rediriger vers la page de paiement Wave
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erreur', 'Impossible d\'initialiser le paiement. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container card">
        <div className="subscription-header">
          <ShieldCheck size={48} className="text-primary mb-3" />
          <h2 className="subscription-title">Abonnement Premium Freelance</h2>
          <p className="subscription-subtitle">
            Rejoignez notre réseau exclusif de professionnels et rendez votre profil visible aux clients.
          </p>
        </div>

        <div className="pricing-card">
          <div className="pricing-header">
            <h3>Plan Mensuel</h3>
            <div className="price">
              <span className="amount">100</span>
              <span className="currency">XOF</span>
              <span className="period">/ mois</span>
            </div>
          </div>
          <div className="pricing-features">
            <ul>
              <li><CheckCircle size={18} className="feature-icon" /> Profil visible par tous les clients</li>
              <li><CheckCircle size={18} className="feature-icon" /> Postulez aux offres en illimité</li>
              <li><CheckCircle size={18} className="feature-icon" /> Vos candidatures sont affichées en priorité</li>
              <li><CheckCircle size={18} className="feature-icon" /> Support prioritaire</li>
            </ul>
          </div>
          <button 
            className="btn btn-primary subscribe-btn" 
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Redirection vers Wave...' : (
              <>
                <CreditCard size={18} />
                Payer avec Wave
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
