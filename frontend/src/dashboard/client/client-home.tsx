import React, { useEffect, useState } from 'react';
import { FolderKanban, MessageSquare, TrendingUp, Eye } from 'lucide-react';
import axios from 'axios';
import './client-home.css';

interface Project {
  id: number;
  title: string;
  budget: number;
  status: string;
  applicationsCount: number;
}

interface ClientStats {
  projects: Project[];
  activeContractsCount: number;
  totalExpenses: number;
}

interface ClientHomeProps {
  userId: number | null;
  onNavigate: (path: string) => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({ userId, onNavigate }) => {
  const [stats, setStats] = useState<ClientStats>({
    projects: [],
    activeContractsCount: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/client/${userId || 1}/dashboard`);
        setStats(response.data);
      } catch (err) {
        console.log("Le backend n'a pas répondu, utilisation de données simulées.");
        setStats({
          projects: [
            { id: 1, title: 'Site Web E-Commerce React', budget: 450000, status: 'IN_PROGRESS', applicationsCount: 8 },
            { id: 2, title: 'Refonte Application Mobile', budget: 1200000, status: 'OPEN', applicationsCount: 14 },
            { id: 3, title: 'Création de Logo & Charte Graphique', budget: 80000, status: 'COMPLETED', applicationsCount: 5 },
          ],
          activeContractsCount: 1,
          totalExpenses: 530000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-container">Chargement de votre espace client...</div>;
  }

  return (
    <div className="client-dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bienvenue sur votre espace Client</h1>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stats-card card card-teal">
          <div className="stats-card-header">
            <span className="stats-card-title">Projets Actifs</span>
            <div className="stats-card-icon"><FolderKanban size={24} /></div>
          </div>
          <div className="stats-card-body">
            <h2 className="stats-card-value">
              {stats.projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'OPEN').length}
            </h2>
            <div className="stats-card-trend">
              <span className="trend-time">Projets en cours de réalisation</span>
            </div>
          </div>
        </div>

        <div className="stats-card card card-purple">
          <div className="stats-card-header">
            <span className="stats-card-title">Contrats signés</span>
            <div className="stats-card-icon"><TrendingUp size={24} /></div>
          </div>
          <div className="stats-card-body">
            <h2 className="stats-card-value">{stats.activeContractsCount}</h2>
            <div className="stats-card-trend">
              <span className="trend-time">Missions en cours avec un freelance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="projects-section card">
        <div className="section-header">
          <h3 className="card-section-title">Mes Projets Récents</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('projects')}>Voir tous mes projets</button>
        </div>
        
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Titre du Projet</th>
                <th>Budget</th>
                <th>Statut</th>
                <th>Candidatures</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.projects.map((project) => (
                <tr key={project.id}>
                  <td className="project-title-td">{project.title}</td>
                  <td>{project.budget.toLocaleString()} XOF</td>
                  <td>
                    <span className={`status-badge ${
                      project.status === 'OPEN' ? 'status-open' :
                      project.status === 'IN_PROGRESS' ? 'status-progress' : 'status-completed'
                    }`}>
                      {project.status === 'OPEN' ? 'Ouvert' :
                       project.status === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}
                    </span>
                  </td>
                  <td className="applications-count-td">
                    <span className="app-badge">{project.applicationsCount} reçues</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-icon-only" title="Voir les candidatures">
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-secondary btn-icon-only" title="Messages">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
