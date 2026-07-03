import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, XCircle, Clock, Building, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './my-invitations.css';

interface Invitation {
  id: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  project: {
    id: number;
    title: string;
    description: string;
    budget: number;
  };
  client: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      companyName: string;
    };
  };
}

export const MyInvitations: React.FC<{ userId: number | null }> = ({ userId }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await axios.get(`http://192.168.1.18:3000/api/freelance/${userId}/invitations`);
        setInvitations(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des invitations", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchInvitations();
    }
  }, [userId]);

  const handleUpdateStatus = (id: number, status: 'ACCEPTED' | 'DECLINED', projectId: number) => {
    const isAccepted = status === 'ACCEPTED';
    
    Swal.fire({
      title: 'Confirmation',
      text: isAccepted 
        ? 'Êtes-vous sûr de vouloir accepter cette invitation ? Vous serez redirigé vers le projet pour postuler.' 
        : 'Êtes-vous sûr de vouloir décliner cette invitation ? Le client en sera informé.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isAccepted ? 'Oui, accepter' : 'Oui, décliner',
      cancelButtonText: 'Non, annuler',
      confirmButtonColor: isAccepted ? '#10b981' : '#ef4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://192.168.1.18:3000/api/freelance/invitations/${id}/status`, { status });
          
          setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
          
          if (status === 'ACCEPTED') {
            Swal.fire({
              title: 'Invitation acceptée !',
              text: 'Vous allez être redirigé vers la page du projet pour finaliser votre candidature.',
              icon: 'success',
              timer: 2500,
              showConfirmButton: false
            }).then(() => {
              navigate(`/freelancer/projects/${projectId}`);
            });
          } else {
            Swal.fire({
              title: 'Invitation déclinée',
              text: 'Le client a été notifié de votre refus.',
              icon: 'info',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de mettre à jour le statut de l\'invitation.'
          });
        }
      }
    });
  };

  const getClientName = (client: Invitation['client']) => {
    if (client.profile?.companyName) return client.profile.companyName;
    if (client.profile?.firstName) return `${client.profile.firstName} ${client.profile.lastName || ''}`.trim();
    return client.email;
  };

  if (loading) {
    return <div className="loading-container">Chargement de vos invitations...</div>;
  }

  return (
    <div className="my-invitations-page">
      <div className="page-header">
        <h1 className="page-title">Mes Invitations</h1>
        <p className="page-subtitle">Projets pour lesquels les clients vous ont directement sollicité</p>
      </div>

      {invitations.length === 0 ? (
        <div className="empty-state">
          <Mail size={48} color="#cbd5e1" />
          <h3>Aucune invitation</h3>
          <p>Vous n'avez pas encore reçu d'invitation directe. Continuez de postuler pour améliorer votre visibilité !</p>
        </div>
      ) : (
        <div className="invitations-grid">
          {invitations.map(inv => (
            <div className={`invitation-card ${inv.status.toLowerCase()}`} key={inv.id}>
              <div className="invitation-card-header">
                <div>
                  <h3>{inv.project.title}</h3>
                  <div className="client-info">
                    <Building size={14} />
                    <span>{getClientName(inv.client)}</span>
                  </div>
                </div>
                {inv.status === 'PENDING' && <span className="status-badge pending"><Clock size={12}/> En attente</span>}
                {inv.status === 'ACCEPTED' && <span className="status-badge accepted"><CheckCircle size={12}/> Acceptée</span>}
                {inv.status === 'DECLINED' && <span className="status-badge declined"><XCircle size={12}/> Déclinée</span>}
              </div>

              <div className="invitation-card-body">
                <div className="project-budget-tag">
                  Budget: {Number(inv.project.budget).toLocaleString()} XOF
                </div>
                {inv.message && (
                  <div className="invitation-message">
                    <p><strong>Message du client :</strong></p>
                    <p className="message-text">"{inv.message}"</p>
                  </div>
                )}
                <p className="invitation-date">Reçue le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>

              <div className="invitation-card-footer">
                {inv.status === 'PENDING' ? (
                  <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary w-100" 
                      onClick={() => navigate(`/freelancer/projects/${inv.project.id}`)}
                    >
                      Voir le projet <ArrowRight size={14} style={{marginLeft: '8px'}} />
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={() => handleUpdateStatus(inv.id, 'DECLINED', inv.project.id)}
                        style={{ flex: 1 }}
                      >
                        Décliner
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateStatus(inv.id, 'ACCEPTED', inv.project.id)}
                        style={{ flex: 1 }}
                      >
                        Accepter
                      </button>
                    </div>
                  </div>
                ) : inv.status === 'ACCEPTED' ? (
                   <button className="btn btn-secondary w-100" onClick={() => navigate(`/freelancer/projects/${inv.project.id}`)}>
                    Voir le projet <ArrowRight size={14} style={{marginLeft: '8px'}} />
                  </button>
                ) : (
                  <div className="declined-text">Vous avez décliné cette invitation.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
