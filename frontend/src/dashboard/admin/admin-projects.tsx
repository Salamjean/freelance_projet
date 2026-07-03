import React, { useEffect, useState } from 'react';

import axios from 'axios';

interface Project {
  id: number;
  title: string;
  status: string;
  budget: number;
  createdAt: string;
  client: {
    profile?: {
      firstName: string | null;
      lastName: string | null;
    }
  };
  category: {
    name: string;
  };
}

const translateStatus = (status: string) => {
  switch(status) {
    case 'OPEN': return 'Ouvert';
    case 'IN_PROGRESS': return 'En cours';
    case 'COMPLETED': return 'Terminé';
    case 'CANCELLED': return 'Annulé';
    case 'DRAFT': return 'Brouillon';
    default: return status;
  }
};

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://192.168.1.18:3000/api/admin/projects');
        setProjects(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des projets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Gestion des Projets</h1>
          <p className="page-subtitle">Visualisez et modérez tous les projets de la plateforme</p>
        </div>
      </div>
      
      <div className="card list-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-section-title" style={{ margin: 0 }}>Tous les Projets ({projects.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Chargement des projets...</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Client</th>
                  <th>Catégorie</th>
                  <th>Budget</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{project.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Posté le {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#4b5563' }}>
                        {project.client.profile?.firstName} {project.client.profile?.lastName}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {project.category.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: '#111827' }}>
                      {project.budget} FCFA
                    </td>
                    <td>
                      <span className={`status-badge status-${project.status.toLowerCase()}`}>
                        {translateStatus(project.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                      Aucun projet trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
