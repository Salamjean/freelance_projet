import React, { useState, useEffect } from 'react';
import { Award, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  category?: {
    name: string;
  };
}

interface AccueilProps {
  onNavigateTo: (screen: 'LANDING' | 'LOGIN' | 'REGISTER' | 'EXPLORE_PROJECTS') => void;
}

export const Accueil: React.FC<AccueilProps> = ({ onNavigateTo }) => {
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProjects = async () => {
      try {
        const response = await axios.get('http://192.168.1.18:3000/api/client/projects/public');
        setPublicProjects(response.data);
      } catch (err) {
        console.warn("Impossible de récupérer les projets publics, simulation de données.");
        setPublicProjects([
          { id: 1, title: 'Développement Site E-Commerce', budget: 450000, budgetType: 'FIXED', description: 'Recherche développeur Fullstack React/Node pour créer un e-commerce complet avec panier et paiements locaux.', category: { name: 'Développement Web' } },
          { id: 2, title: 'Création Logo & Charte Graphique', budget: 80000, budgetType: 'FIXED', description: 'Besoin d\'un graphiste professionnel pour concevoir l\'identité visuelle d\'une marque de mode.', category: { name: 'Design & Graphisme' } },
          { id: 3, title: 'Développement API Rest NestJS', budget: 25000, budgetType: 'HOURLY', description: 'Recherche développeur backend senior pour structurer et coder des API Rest robustes avec NestJS et Prisma.', category: { name: 'Développement Web' } }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProjects();
  }, []);

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="landing-logo" onClick={() => onNavigateTo('LANDING')} style={{ cursor: 'pointer' }}>
          <span className="logo-blue">Free</span><span className="logo-dark">Link</span>
        </div>

        <div className="landing-nav-tabs">
          <button className="nav-tab active" onClick={() => onNavigateTo('LANDING')}>
            Accueil
          </button>
          <button className="nav-tab" onClick={() => onNavigateTo('EXPLORE_PROJECTS')}>
            Explorer les projets
          </button>
        </div>

        <div className="landing-nav-actions">
          <button className="btn btn-secondary" onClick={() => onNavigateTo('LOGIN')}>
            Se Connecter
          </button>
          <button className="btn btn-primary" onClick={() => onNavigateTo('REGISTER')}>
            S'inscrire
          </button>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <span className="hero-badge"><Award size={14} /> La plateforme n°1 en Afrique de l'Ouest</span>
          <h1 className="hero-title">
            Trouvez les meilleurs <span className="text-blue">Freelances</span> pour vos projets.
          </h1>
          <p className="hero-description">
            Une plateforme moderne, rapide et sécurisée pour mettre en relation les entreprises et les experts du numérique au Sénégal et dans toute la sous-région.
          </p>
          <div className="hero-cta-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => onNavigateTo('REGISTER')}>
              Commencer gratuitement <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigateTo('EXPLORE_PROJECTS')}>
              Explorer les projets
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card visual-card-1">
            <div className="visual-icon"><Briefcase size={20} /></div>
            <div>
              <h4>+ 1,200 Freelances</h4>
              <p>Développeurs, Designers, Rédacteurs</p>
            </div>
          </div>
          <div className="visual-card visual-card-2">
            <div className="visual-icon bg-green"><CheckCircle size={20} /></div>
            <div>
              <h4>Paiements Sécurisés</h4>
              <p>Wave, Orange Money, Moov, Cartes</p>
            </div>
          </div>
        </div>
      </main>

      {/* SECTION PROJETS RÉCENTS PUBLICS */}
      <section className="landing-projects-section">
        <div className="section-header-centered">
          <h2 className="landing-section-title">Dernières missions publiées</h2>
          <p className="landing-section-subtitle">
            Postulez aux projets récents déposés par nos clients et développez votre activity.
          </p>
        </div>

        {loading ? (
          <div className="explore-loading">Chargement des offres...</div>
        ) : (
          <div className="landing-projects-grid">
            {publicProjects.slice(0, 6).map((project) => (
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
                <p className="project-public-desc">
                  {project.description && project.description.length > 130
                    ? `${project.description.substring(0, 130)}...`
                    : project.description || "Aucune description détaillée."}
                </p>
                <div className="project-public-footer">
                  <button className="btn btn-secondary btn-sm btn-full-width" onClick={() => onNavigateTo('LOGIN')}>
                    Postuler à cette offre
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
