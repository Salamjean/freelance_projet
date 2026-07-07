import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Calendar, Briefcase, User, Send, Heart } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './search-projects.css';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number | string;
  budgetType: 'FIXED' | 'HOURLY';
  experienceLevel: 'JUNIOR' | 'INTERMEDIATE' | 'EXPERT';
  duration?: string;
  createdAt: string;
  status: string;
  category: Category;
  subCategory: SubCategory;
  clientId: number;
  client?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      companyName?: string;
      avatarUrl?: string;
    };
  };
}

interface ProjectDetailsProps {
  userId: number | null;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ userId }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/client/projects/public/${projectId}`);
        setProject(res.data);

        if (userId) {
          const appsRes = await axios.get(`http://localhost:3000/api/freelance/${userId}/applications`);
          const applied = appsRes.data.some((app: any) => app.projectId === Number(projectId));
          setHasApplied(applied);

          try {
            const favsRes = await axios.get(`http://localhost:3000/api/freelance/${userId}/favorites`);
            const isFav = favsRes.data.some((fav: any) => fav.id === Number(projectId));
            setIsFavorite(isFav);
          } catch (e) {
            console.error("Impossible de récupérer les favoris");
          }
        }
      } catch (err) {
        console.error('Erreur de chargement du projet', err);
        Swal.fire('Erreur', 'Projet introuvable', 'error');
        navigate('/freelancer/search-projects');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId, userId, navigate]);

  const toggleFavorite = async () => {
    if (!userId || !project) return;
    const previous = isFavorite;
    setIsFavorite(!isFavorite);
    try {
      await axios.post(`http://localhost:3000/api/freelance/${userId}/favorites/${project.id}`);
    } catch (err) {
      setIsFavorite(previous);
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  if (!project) return null;

  const getClientName = () => {
    if (project.client?.profile?.companyName) return project.client.profile.companyName;
    if (project.client?.profile?.firstName && project.client?.profile?.lastName) {
      return `${project.client.profile.firstName} ${project.client.profile.lastName}`;
    }
    return project.client?.email || 'Client Anonyme';
  };

  const formattedBudget = Number(project.budget).toLocaleString('fr-FR') + ' FCFA';
  const isFixed = project.budgetType === 'FIXED';

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="project-cat-badge">{project.category?.name}</span>
              {project.subCategory && <span className="project-subcat-badge">{project.subCategory.name}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{project.title}</h1>
              <button 
                onClick={toggleFavorite}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '6px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isFavorite ? '#dc2626' : '#9ca3af',
                  backgroundColor: isFavorite ? '#fee2e2' : '#f3f4f6',
                  transition: 'all 0.2s'
                }}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart size={24} fill={isFavorite ? '#dc2626' : 'none'} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <User size={16} /> Proposé par <strong>{getClientName()}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{formattedBudget}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{isFixed ? 'Budget Fixe' : 'Taux horaire'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
            <Award size={18} /> 
            <span>{project.experienceLevel === 'EXPERT' ? 'Expert' : project.experienceLevel === 'INTERMEDIATE' ? 'Intermédiaire' : 'Junior'}</span>
          </div>
          {project.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Calendar size={18} />
              <span>{project.duration}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
            <Briefcase size={18} />
            <span>Posté le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Description du projet</h2>
          <div style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {project.description}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div>
          {project.status !== 'OPEN' ? (
            <button className="btn-apply-disabled" disabled style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'not-allowed', backgroundColor: '#e2e8f0', color: '#64748b' }}>
              Projet fermé
            </button>
          ) : hasApplied ? (
            <button className="btn-apply-disabled" disabled style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'not-allowed' }}>
              ✓ Candidature Envoyée
            </button>
          ) : (
            <button 
              className="btn-apply-action" 
              onClick={() => navigate(`/freelancer/search-projects?projectId=${project.id}`)}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              <Send size={18} /> Postuler maintenant
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
