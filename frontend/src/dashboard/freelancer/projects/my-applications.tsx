import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, FolderKanban, Filter } from 'lucide-react';
import './my-applications.css';

interface Application {
  id: number;
  bidAmount: number;
  deliveryDelay: number;
  status: string;
  createdAt: string;
  project: {
    id: number;
    title: string;
    budget: number;
    budgetType: string;
    experienceLevel: string;
    status: string;
    client: {
      id: number;
      profile: {
        firstName: string;
        lastName: string;
        avatarUrl: string;
        companyName: string;
      }
    }
  }
}

interface MyApplicationsProps {
  userId: number | null;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ userId }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`http://localhost:3000/api/freelance/${userId}/applications`);
        setApplications(response.data || []);
      } catch (err) {
        console.error('Erreur de chargement des candidatures', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [userId]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.project?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Refusée';
      case 'WITHDRAWN': return 'Retirée';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading-container">Chargement de vos candidatures...</div>;
  }

  return (
    <div className="my-applications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Candidatures</h1>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>Suivez l'état de vos propositions commerciales envoyées aux clients.</p>
        </div>
      </div>

      <div className="applications-filters-card card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par titre de projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={18} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ACCEPTED">Acceptée</option>
            <option value="REJECTED">Refusée</option>
            <option value="WITHDRAWN">Retirée</option>
          </select>
        </div>
      </div>

      <div className="applications-grid">
        {filteredApplications.length === 0 ? (
          <div className="no-applications-card">
            <FolderKanban size={56} className="no-data-icon" />
            <h3>Aucune candidature trouvée</h3>
            <p>Vous n'avez aucune candidature correspondant à vos critères de recherche.</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="app-card-header">
                <div className="project-client-info">
                  <h3 className="project-title">{app.project?.title}</h3>
                  <div className="client-info">
                    {app.project?.client?.profile?.avatarUrl ? (
                      <img src={`http://localhost:3000${app.project.client.profile.avatarUrl}`} alt="Client" className="client-avatar-mini" />
                    ) : (
                      <div className="client-avatar-placeholder">
                        {(app.project?.client?.profile?.firstName?.[0] || 'C').toUpperCase()}
                      </div>
                    )}
                    <span>
                      {app.project?.client?.profile?.companyName || 
                       `${app.project?.client?.profile?.firstName || ''} ${app.project?.client?.profile?.lastName || ''}`}
                    </span>
                  </div>
                </div>
                <div className="status-container">
                  <span className={`status-badge status-${app.status.toLowerCase()}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>
              </div>
              
              <div className="app-card-body">
                <div className="detail-item bid-highlight">
                  <span className="detail-label">Mon offre</span>
                  <span className="detail-value">{Number(app.bidAmount).toLocaleString()} XOF</span>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-item">
                  <span className="detail-label">Délai proposé</span>
                  <span className="detail-value">{app.deliveryDelay} jours</span>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-item">
                  <span className="detail-label">Envoyée le</span>
                  <span className="detail-value">
                    {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="app-card-footer">
                <button className="btn-view-project" onClick={() => window.location.href = `/freelancer/projects/${app.project?.id}`}>
                  Voir le projet
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
