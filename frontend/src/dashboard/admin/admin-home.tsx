import React, { useEffect, useState } from 'react';
import { Users, FolderKanban, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './admin-home.css';

interface Stats {
  clients: number;
  freelancers: number;
  projects: number;
  contracts: number;
  commissions: number;
  revenues: number;
}

export const AdminHome: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    clients: 0,
    freelancers: 0,
    projects: 0,
    contracts: 0,
    commissions: 0,
    revenues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API ou utiliser axios s'il est en cours d'exécution
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://192.168.1.18:3000/api/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.log("Le backend n'a pas répondu, utilisation de données simulées.");
        // Données d'exemple conformes au cahier des charges
        setStats({
          clients: 120,
          freelancers: 340,
          projects: 85,
          contracts: 42,
          commissions: 15, // 15% par ex
          revenues: 2500000, // FCFA par exemple
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-container">Chargement des données analytiques...</div>;
  }

  const statCards = [
    { title: 'Total Clients', value: stats.clients, icon: <Users size={24} />, color: 'blue' },
    { title: 'Total Freelances', value: stats.freelancers, icon: <Users size={24} />, color: 'teal' },
    { title: 'Projets Publiés', value: stats.projects, icon: <FolderKanban size={24} />, color: 'purple' },
    { title: 'Revenus Totaux', value: `${stats.revenues.toLocaleString()} XOF`, icon: <DollarSign size={24} />, color: 'green' },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de Bord Analytique</h1>
          <p className="page-subtitle">Vue globale des performances de la plateforme</p>
        </div>
        <div className="date-picker-btn btn btn-secondary">
          <TrendingUp size={16} /> Statistiques du mois
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div className={`stats-card card card-${card.color}`} key={index}>
            <div className="stats-card-header">
              <span className="stats-card-title">{card.title}</span>
              <div className="stats-card-icon">{card.icon}</div>
            </div>
            <div className="stats-card-body">
              <h2 className="stats-card-value">{card.value}</h2>
              <div className="stats-card-trend">
                <span className="trend-up">
                  <ArrowUpRight size={14} /> +12%
                </span>
                <span className="trend-time">depuis le mois dernier</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="details-grid">
        <div className="card list-card">
          <h3 className="card-section-title">Contrats Récents</h3>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Client</th>
                  <th>Freelance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Site E-Commerce React</td>
                  <td>KKS Tech</td>
                  <td>Amadou Diallo</td>
                  <td>450,000 XOF</td>
                  <td><span className="status-badge status-success">Actif</span></td>
                </tr>
                <tr>
                  <td>Application Mobile NestJS</td>
                  <td>Sénégal Ciment</td>
                  <td>Marie Ndiaye</td>
                  <td>1,200,000 XOF</td>
                  <td><span className="status-badge status-pending">En Attente</span></td>
                </tr>
                <tr>
                  <td>Design UI/UX Saas</td>
                  <td>Digital agency</td>
                  <td>Paul Sarr</td>
                  <td>300,000 XOF</td>
                  <td><span className="status-badge status-success">Actif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card summary-card">
          <h3 className="card-section-title">Répartition Globale</h3>
          <div className="progress-bars-container">
            <div className="progress-item">
              <div className="progress-label">
                <span>Freelanceurs Actifs</span>
                <span>74%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '74%' }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Projets Validés</span>
                <span>88%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill bg-teal" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Litiges Résolus</span>
                <span>95%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill bg-purple" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
