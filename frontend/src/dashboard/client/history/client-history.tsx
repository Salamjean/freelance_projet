import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, User, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../contracts/my-contracts.css';

interface Contract {
  id: number;
  projectId: number;
  freelancerId: number;
  amount: string;
  status: string;
  createdAt: string;
  endDate?: string;
  applicationId?: number;
  project: {
    title: string;
    description: string;
  };
  freelancer: {
    profile?: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
}

export const ClientHistory: React.FC<{ userId: number | null }> = ({ userId }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`http://192.168.1.18:3000/api/client/${userId}/contracts`);
        // On ne garde que les contrats terminés (VALIDATED)
        const completed = res.data.filter((c: Contract) => c.status === 'VALIDATED');
        setContracts(completed);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContracts();
    }
  }, [userId]);

  const getFreelancerName = (freelancer: Contract['freelancer']) => {
    if (freelancer.profile?.firstName || freelancer.profile?.lastName) {
      return `${freelancer.profile.firstName || ''} ${freelancer.profile.lastName || ''}`.trim();
    }
    return freelancer.email;
  };

  if (loading) {
    return <div className="loading-container">Chargement de l'historique...</div>;
  }

  return (
    <div className="my-contracts-page">
      <div className="page-header">
        <h1 className="page-title">Historique des Projets</h1>
        <p className="page-subtitle">Retrouvez tous vos projets terminés avec succès</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-state">
          <History size={48} color="#cbd5e1" />
          <h3>Aucun projet terminé</h3>
          <p>Vous n'avez pas encore de projets clôturés.</p>
        </div>
      ) : (
        <div className="contracts-grid">
          {contracts.map(contract => (
            <div className="contract-card" key={contract.id}>
              <div className="contract-card-header">
                <h3>{contract.project.title}</h3>
                <span className="status-badge status-completed"><CheckCircle size={12} /> Terminé</span>
              </div>

              <div className="contract-card-body">
                <div className="contract-details">
                  <div className="detail-item">
                    <span><strong>Freelance:</strong> {getFreelancerName(contract.freelancer)}</span>
                  </div>
                  <div className="detail-item">
                    <span><strong>Montant payé:</strong> {Number(contract.amount).toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="detail-item">
                    <span><strong>Terminé le:</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="contract-card-footer">
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (contract.applicationId) {
                      navigate(`/client/projects/${contract.projectId}/applications/${contract.applicationId}/sign`);
                    } else {
                      navigate(`/client/projects`);
                    }
                  }}
                >
                  Détails du contrat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
