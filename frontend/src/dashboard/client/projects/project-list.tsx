import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Eye, FolderKanban, Filter, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { ProjectApplications } from './project-applications';
import './project-list.css';

interface Project {
  id: number;
  title: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  experienceLevel: 'JUNIOR' | 'INTERMEDIATE' | 'EXPERT';
  status: string;
  applicationsCount: number;
  applications?: any[];
  createdAt: string;
}

interface ProjectListProps {
  userId: number | null;
  onPublishProject: () => void;
  onEditProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ userId, onPublishProject, onEditProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/client/${userId || 1}/dashboard`);
        // Le dashboard renvoie { projects, activeContractsCount, totalExpenses }
        const mappedProjects = (response.data.projects || []).map((p: any) => ({
          ...p,
          applicationsCount: p.applications?.length || 0,
        }));
        setProjects(mappedProjects);
      } catch (err) {
        console.warn("Impossible de récupérer la liste des projets, utilisation de données simulées.");
        setProjects([
          { id: 1, title: 'Site Web E-Commerce React', budget: 450000, budgetType: 'FIXED', experienceLevel: 'INTERMEDIATE', status: 'IN_PROGRESS', applicationsCount: 8, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
          { id: 2, title: 'Refonte Application Mobile Flutter', budget: 1200000, budgetType: 'FIXED', experienceLevel: 'EXPERT', status: 'OPEN', applicationsCount: 14, createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
          { id: 3, title: 'Création de Logo & Charte Graphique', budget: 80000, budgetType: 'FIXED', experienceLevel: 'JUNIOR', status: 'COMPLETED', applicationsCount: 5, createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString() },
          { id: 4, title: 'Développement API Rest NestJS', budget: 25000, budgetType: 'HOURLY', experienceLevel: 'EXPERT', status: 'OPEN', applicationsCount: 3, createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: number) => {
    Swal.fire({
      title: 'Supprimer ce projet ?',
      text: "Cette action est irréversible et supprimera également toutes les candidatures reçues.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      heightAuto: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/client/projects/${projectId}`);
          
          Swal.fire({
            title: 'Supprimé !',
            text: 'Le projet a été retiré avec succès.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            heightAuto: false,
          });

          // Mettre à jour l'état local
          setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err: any) {
          console.error("Erreur de suppression du projet :", err);
          const message = err.response?.data?.message || "Impossible de supprimer ce projet. Veuillez réessayer.";
          Swal.fire({
            title: 'Erreur',
            text: message,
            icon: 'error',
            confirmButtonColor: '#2563eb',
            heightAuto: false,
          });
        }
      }
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_ADVANCE': return 'Attente acompte';
      case 'OPEN': return 'Ouvert';
      case 'IN_PROGRESS': return 'En cours';
      case 'DELIVERED': return 'Livré';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      case 'UNDER_DISPUTE': return 'En litige';
      default: return status;
    }
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'Junior';
      case 'INTERMEDIATE': return 'Intermédiaire';
      case 'EXPERT': return 'Expert';
      default: return level;
    }
  };

  const getBudgetTypeLabel = (type: string) => {
    return type === 'FIXED' ? 'Fixe' : 'Horaire';
  };

  // Filtrer les projets
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-container">Chargement de vos projets...</div>;
  }

  if (viewingProject) {
    return (
      <ProjectApplications 
        project={viewingProject} 
        onBack={() => setViewingProject(null)} 
      />
    );
  }

  return (
    <div className="project-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Projets</h1>
        </div>
      </div>

      <div className="project-filters-card card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un projet par titre..."
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
            <option value="OPEN">Ouvert</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      <div className="project-list-table-card card">
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Titre du Projet</th>
                <th>Budget</th>
                <th>Type</th>
                <th>Expérience Requisite</th>
                <th>Date de Publication</th>
                <th>Statut</th>
                <th>Candidatures</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data-td">
                    <div className="no-data-container">
                      <FolderKanban size={48} className="no-data-icon" />
                      <p>Aucun projet trouvé correspondant à vos critères.</p>
                      <button className="btn btn-secondary btn-sm" onClick={onPublishProject}>
                        Publier mon premier projet
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="project-title-td">{project.title}</td>
                    <td className="project-budget-td">
                      {project.budget.toLocaleString()} XOF
                    </td>
                    <td>{getBudgetTypeLabel(project.budgetType)}</td>
                    <td>
                      <span className={`exp-badge exp-${project.experienceLevel.toLowerCase()}`}>
                        {getExperienceLabel(project.experienceLevel)}
                      </span>
                    </td>
                    <td className="project-date-td">
                      {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        project.status === 'OPEN' ? 'status-open' :
                        project.status === 'IN_PROGRESS' ? 'status-progress' :
                        project.status === 'DELIVERED' ? 'status-delivered' :
                        project.status === 'COMPLETED' ? 'status-completed' :
                        project.status === 'UNDER_DISPUTE' ? 'status-dispute' : 'status-cancelled'
                      }`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="applications-count-td">
                      <span className="app-badge">{project.applicationsCount || 0} reçues</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {project.status === 'OPEN' && !project.applications?.some(app => app.status === 'ACCEPTED') && (
                          <>
                            <button
                              className="btn btn-secondary btn-icon-only"
                              title="Modifier le projet"
                              onClick={() => onEditProject(project)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary btn-icon-only btn-delete-action"
                              title="Supprimer le projet"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-secondary btn-icon-only" 
                          title="Voir les candidatures"
                          onClick={() => setViewingProject(project)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
