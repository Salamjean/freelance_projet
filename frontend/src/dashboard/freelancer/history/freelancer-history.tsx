import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { History, Calendar, CheckCircle2, DollarSign, User, FileText } from 'lucide-react';
import '../projects/my-missions.css';

interface Project {
  id: number;
  title: string;
  description: string;
  category?: { name: string };
}

interface ClientProfile {
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
}

interface Client {
  email: string;
  profile: ClientProfile | null;
}

interface Mission {
  id: number;
  projectId: number;
  project: Project;
  clientId: number;
  client: Client;
  freelancerId: number;
  amount: number | string;
  status: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
}

interface FreelancerHistoryProps {
  userId: number | null;
}

export const FreelancerHistory: React.FC<FreelancerHistoryProps> = ({ userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const fetchMissions = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/freelance/${userId}/missions`);
        const completed = res.data.filter((m: Mission) => m.status === 'VALIDATED' || m.status === 'COMPLETED');
        setMissions(completed);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, [userId]);

  const getClientName = (client: Client) => {
    if (client.profile?.companyName) return client.profile.companyName;
    if (client.profile?.firstName && client.profile?.lastName) {
      return `${client.profile.firstName} ${client.profile.lastName}`;
    }
    return client.email;
  };

  if (loading) {
    return (
      <div className="missions-loading">
        <div className="spinner"></div>
        <p>Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="my-missions-page">
      <div className="page-header">
        <h1 className="page-title">Historique des Missions</h1>
        <p className="page-subtitle">Retrouvez toutes vos missions terminées et payées</p>
      </div>

      {missions.length === 0 ? (
        <div className="empty-state">
          <History size={48} color="#cbd5e1" />
          <h3>Aucune mission terminée</h3>
          <p>Vous n'avez pas encore de missions clôturées.</p>
        </div>
      ) : (
        <div className="missions-grid">
          {missions.map((mission) => (
            <div className="mission-card" key={mission.id}>
              <div className="mission-card-header">
                <div>
                  <h3 className="mission-title">{mission.project.title}</h3>
                  {mission.project.category && (
                    <span className="mission-category">{mission.project.category.name}</span>
                  )}
                </div>
                <span className="status-badge status-completed"><CheckCircle2 size={12} /> Terminé</span>
              </div>

              <div className="mission-card-body">
                <div className="mission-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span><strong>Client:</strong> {getClientName(mission.client)}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span><strong>Gagné:</strong> {Number(mission.amount).toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span><strong>Terminé le:</strong> {mission.endDate ? new Date(mission.endDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="mission-card-footer">
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/freelancer/missions/${mission.id}/sign`)}
                >
                  <FileText size={14} style={{ marginRight: '6px' }} />
                  Voir le contrat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
