import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, BookOpen, Briefcase } from 'lucide-react';
import './explore-projects.css';

interface Category {
  name: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  experienceLevel: 'JUNIOR' | 'INTERMEDIATE' | 'EXPERT';
  createdAt: string;
  category: Category;
}

interface ExploreProjectsProps {
  onBackToLanding: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const ExploreProjects: React.FC<ExploreProjectsProps> = ({
  onBackToLanding,
  onGoToLogin,
  onGoToRegister,
}) => {
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState(location.state?.category || '');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [budgetTypeFilter, setBudgetTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/client/projects/public');
        setProjects(response.data);
      } catch (err) {
        console.warn("Impossible de récupérer la liste des projets, utilisation de données simulées.");
        setProjects([
          { id: 1, title: 'Site Web E-Commerce React', budget: 450000, budgetType: 'FIXED', experienceLevel: 'INTERMEDIATE', description: 'Recherche développeur Fullstack React/Node pour créer un e-commerce complet avec panier et paiements locaux.', category: { name: 'Développement Web' }, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
          { id: 2, title: 'Refonte Application Mobile Flutter', budget: 1200000, budgetType: 'FIXED', experienceLevel: 'EXPERT', description: 'Besoin d\'un développeur mobile senior pour refondre complètement notre application de livraison.', category: { name: 'Développement Mobile' }, createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
          { id: 3, title: 'Création de Logo & Charte Graphique', budget: 80000, budgetType: 'FIXED', experienceLevel: 'JUNIOR', description: 'Besoin d\'un graphiste créatif pour concevoir un logo moderne et sa charte graphique associée.', category: { name: 'Design & Graphisme' }, createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString() },
          { id: 4, title: 'Développement API Rest NestJS', budget: 25000, budgetType: 'HOURLY', experienceLevel: 'EXPERT', description: 'Mission de 2 semaines pour structurer des modules d\'API robustes avec NestJS et PostgreSQL.', category: { name: 'Développement Web' }, createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtrer les projets
  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = project.title.toLowerCase().includes(searchLower) || 
                          project.description.toLowerCase().includes(searchLower) ||
                          (project.category && project.category.name.toLowerCase().includes(searchLower));
    const matchesExp = experienceFilter === 'ALL' || project.experienceLevel === experienceFilter;
    const matchesBudget = budgetTypeFilter === 'ALL' || project.budgetType === budgetTypeFilter;
    return matchesSearch && matchesExp && matchesBudget;
  });

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'Junior';
      case 'INTERMEDIATE': return 'Intermédiaire';
      case 'EXPERT': return 'Expert';
      default: return level;
    }
  };

  return (
    <div className="explore-container">
      {/* NAVBAR PUBLIQUE */}
      <nav className="landing-nav">
        <div className="landing-logo" onClick={onBackToLanding} style={{ cursor: 'pointer' }}>
          <span className="logo-blue">Free</span><span className="logo-dark">Link</span>
        </div>

        <div className="landing-nav-tabs">
          <button className="nav-tab" onClick={onBackToLanding}>
            Accueil
          </button>
          <button className="nav-tab active" onClick={() => {}}>
            Missions
          </button>
        </div>

        <div className="landing-nav-actions">
          <button className="btn link-btn hide-on-mobile" onClick={onGoToLogin}>
            Connexion
          </button>
          <button className="btn btn-primary btn-rounded hide-on-mobile" onClick={onGoToRegister}>
            S'inscrire
          </button>
          <button className="btn btn-primary btn-rounded show-on-mobile" onClick={onGoToLogin}>
            Se connecter
          </button>
        </div>
      </nav>
      {/* FILTRES & GRILLE */}
      <main className="explore-main">
        {/* BARRE DE FILTRES */}
        <div className="explore-filters card">
          <div className="explore-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Mots-clés, compétences, technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="explore-search-input"
            />
          </div>
          
          <div className="explore-filter-options">
            <div className="filter-item">
              <Filter size={14} className="filter-icon" />
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="explore-select"
              >
                <option value="ALL">Tous les niveaux</option>
                <option value="JUNIOR">Junior (Débutant)</option>
                <option value="INTERMEDIATE">Intermédiaire</option>
                <option value="EXPERT">Expert (Senior)</option>
              </select>
            </div>

            <div className="filter-item">
              <BookOpen size={14} className="filter-icon" />
              <select
                value={budgetTypeFilter}
                onChange={(e) => setBudgetTypeFilter(e.target.value)}
                className="explore-select"
              >
                <option value="ALL">Tous les types de budget</option>
                <option value="FIXED">Budget Fixe</option>
                <option value="HOURLY">Taux Horaire</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRILLE DES PROJETS */}
        {loading ? (
          <div className="explore-loading">Chargement des projets de la plateforme...</div>
        ) : (
          <div className="explore-grid">
            {filteredProjects.length === 0 ? (
              <div className="explore-no-results card">
                <Briefcase size={48} className="no-results-icon" />
                <h3>Aucun projet ne correspond à votre recherche</h3>
                <p>Essayez de modifier vos filtres ou vos mots-clés pour élargir les résultats.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="project-public-card card">
                  <div className="project-public-header">
                    <span className="project-public-category">
                      {project.category?.name || 'Général'}
                    </span>
                    <span className="project-public-budget">
                      {project.budget.toLocaleString()} XOF {project.budgetType === 'FIXED' ? '' : '/ h'}
                    </span>
                  </div>
                  
                  <h3 className="project-public-title">{project.title}</h3>
                  
                  <div className="project-public-meta">
                    <span className={`exp-badge exp-${project.experienceLevel.toLowerCase()}`}>
                      {getExperienceLabel(project.experienceLevel)}
                    </span>
                    <span className="project-date">
                      Publié le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="project-public-desc">
                    {project.description}
                  </p>

                  <div className="project-public-footer">
                    <button className="btn btn-primary btn-full-width" onClick={onGoToLogin}>
                      Postuler à cette offre
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
