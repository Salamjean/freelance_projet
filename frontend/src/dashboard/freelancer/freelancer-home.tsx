import React, { useEffect, useState } from 'react';
import { Send, Briefcase, DollarSign, ArrowUpRight, Award, MessageSquare, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './freelancer-home.css';

interface Mission {
  id: number;
  project: {
    title: string;
    budget: number;
  };
  status: string;
}

interface FreelancerStats {
  applicationsCount: number;
  activeMissionsCount: number;
  activeMissions: Mission[];
  balance: number;
  isSubscribed?: boolean;
}

interface Skill {
  skillId: number;
  name: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  location: string;
  phone: string;
  hourlyRate: string;
  githubLink: string;
  linkedinLink: string;
  websiteLink: string;
  skills: Skill[];
  avatarUrl: string;
}

interface FreelancerHomeProps {
  userId: number | null;
  onNavigateToProfile: () => void;
}

function calcCompletion(data: ProfileData): number {
  const fields = [
    data.firstName, data.lastName, data.title, data.bio,
    data.location, data.hourlyRate, data.phone,
  ];
  const filledFields = fields.filter((f) => f.trim().length > 0).length;
  const hasSkills = data.skills.length > 0 ? 1 : 0;
  const hasLinks = (data.githubLink || data.linkedinLink || data.websiteLink) ? 1 : 0;
  const hasAvatar = data.avatarUrl && data.avatarUrl.trim().length > 0 ? 1 : 0;
  
  const total = fields.length + 3;
  return Math.round(((filledFields + hasSkills + hasLinks + hasAvatar) / total) * 100);
}

export const FreelancerHome: React.FC<FreelancerHomeProps> = ({ userId, onNavigateToProfile }) => {
  const [stats, setStats] = useState<FreelancerStats>({
    applicationsCount: 0,
    activeMissionsCount: 0,
    activeMissions: [],
    balance: 0,
  });
  const [completion, setCompletion] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const updateStatus = async (missionId: number, status: 'DELIVERED' | 'DISPUTE') => {
    const labels: Record<string, string> = {
      DELIVERED: 'Marquer comme livré',
      DISPUTE: 'Signaler un litige'
    };
    const confirms: Record<string, string> = {
      DELIVERED: 'Confirmez-vous que vous avez livré les livrables au client ?',
      DISPUTE: 'Confirmez-vous vouloir signaler un litige sur cette mission ?'
    };

    const result = await Swal.fire({
      title: labels[status],
      text: confirms[status],
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`http://192.168.1.18:3000/api/freelance/${userId}/missions/${missionId}/status`, { status });
      setStats((prev) => ({
        ...prev,
        activeMissions: prev.activeMissions.map((m) => (m.id === missionId ? { ...m, status } : m))
      }));
      Swal.fire('Succès', 'Le statut de la mission a été mis à jour.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Erreur', 'Une erreur est survenue lors de la mise à jour.', 'error');
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchStatsAndProfile = async () => {
      try {
        const response = await axios.get(`http://192.168.1.18:3000/api/freelance/${userId}/dashboard`);
        setStats(response.data);
      } catch (err) {
        console.log("Le backend n'a pas répondu, utilisation de données simulées.");
        setStats({
          applicationsCount: 12,
          activeMissionsCount: 2,
          activeMissions: [
            { id: 1, project: { title: 'Site Web E-Commerce React', budget: 450000 }, status: 'IN_PROGRESS' },
            { id: 2, project: { title: 'Design UI/UX Application Saas', budget: 300000 }, status: 'IN_PROGRESS' },
          ],
          balance: 0,
        });
      }

      try {
        const profileRes = await axios.get(`http://192.168.1.18:3000/api/auth/profile/${userId}`);
        const p = profileRes.data;
        const skillsMapped = (p.skills || []).map((s: any) => ({
          skillId: s.skillId || s.skill?.id || 0,
          name: s.skill?.name || s.name || '',
        }));

        const pData: ProfileData = {
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          title: p.title || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          hourlyRate: p.hourlyRate ? String(p.hourlyRate) : '',
          githubLink: p.githubLink || '',
          linkedinLink: p.linkedinLink || '',
          websiteLink: p.websiteLink || '',
          skills: skillsMapped,
          avatarUrl: p.avatarUrl || '',
        };

        setCompletion(calcCompletion(pData));
      } catch {
        setCompletion(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndProfile();
  }, [userId]);

  if (loading) {
    return <div className="loading-container">Chargement de votre espace freelance...</div>;
  }

  return (
    <div className="freelancer-dashboard-page">
      {completion < 80 && (
        <div className="profile-warning-banner" style={{
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fef3c7',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: '#b45309'
        }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.5' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>
              Profil invisible pour les clients ({completion}%)
            </h4>
            <p style={{ margin: 0 }}>
              Votre profil n'est pas encore visible par les recruteurs car il est complété à moins de 80%.
              Veuillez compléter votre profil à au moins <strong>80%</strong> pour apparaître dans l'annuaire.
            </p>
          </div>
          <button
            onClick={onNavigateToProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
          >
            Compléter mon profil
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Bienvenue sur votre espace Freelance</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card card card-blue" onClick={() => navigate('/freelancer/wallet')} style={{ cursor: 'pointer' }}>
          <div className="stats-card-header">
            <span className="stats-card-title">Portefeuille (Revenus)</span>
            <div className="stats-card-icon"><DollarSign size={24} /></div>
          </div>
          <div className="stats-card-body">
            <h2 className="stats-card-value">{stats.balance.toLocaleString()} XOF</h2>
            <div className="stats-card-trend">
              <span className="trend-up">
                <ArrowUpRight size={14} /> +20%
              </span>
              <span className="trend-time">depuis le mois dernier</span>
            </div>
          </div>
        </div>

        <div className="stats-card card card-teal" onClick={() => navigate('/freelancer/missions')} style={{ cursor: 'pointer' }}>
          <div className="stats-card-header">
            <span className="stats-card-title">Missions en cours</span>
            <div className="stats-card-icon"><Briefcase size={24} /></div>
          </div>
          <div className="stats-card-body">
            <h2 className="stats-card-value">{stats.activeMissionsCount}</h2>
            <div className="stats-card-trend">
              <span className="trend-time">Projets actifs sous contrat</span>
            </div>
          </div>
        </div>

        <div className="stats-card card card-purple" onClick={() => navigate('/freelancer/applications')} style={{ cursor: 'pointer' }}>
          <div className="stats-card-header">
            <span className="stats-card-title">Candidatures</span>
            <div className="stats-card-icon"><Send size={24} /></div>
          </div>
          <div className="stats-card-body">
            <h2 className="stats-card-value">{stats.applicationsCount}</h2>
            <div className="stats-card-trend">
              <span className="trend-time">Offres et propositions envoyées</span>
            </div>
          </div>
        </div>
      </div>

      <div className="missions-section card">
        <h3 className="card-section-title">Mes Missions Actives</h3>
        {stats.activeMissions.length === 0 ? (
          <p className="no-data-text text-muted">Vous n'avez pas de mission en cours. Recherchez des projets pour postuler !</p>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Budget</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeMissions.map((mission) => (
                  <tr key={mission.id}>
                    <td className="mission-title-td">{mission.project.title}</td>
                    <td>{mission.project.budget.toLocaleString()} XOF</td>
                    <td>
                      <span className="status-badge status-progress">En cours</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {mission.status !== 'DELIVERED' ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            title="Livrer le projet"
                            onClick={() => updateStatus(mission.id, 'DELIVERED')}
                          >
                            <Award size={14} /> Livrer
                          </button>
                        ) : (
                          <span className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                            Livré
                          </span>
                        )}
                        <button 
                          className="btn btn-secondary btn-icon-only" 
                          title="Discuter avec le client"
                          onClick={() => navigate('/freelancer/chat')}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
