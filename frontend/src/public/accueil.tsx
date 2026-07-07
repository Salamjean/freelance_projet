import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Target, 
  UserCheck, 
  ShieldCheck, 
  Zap, 
  Globe, 
  CheckCircle,
  Star,
  ChevronDown,
  Menu,
  X,
  Briefcase,
  Settings,
  Code,
  Clock,
  CreditCard
} from 'lucide-react';

interface AccueilProps {
  onNavigateTo: (screen: 'LANDING' | 'LOGIN' | 'REGISTER' | 'EXPLORE_PROJECTS', params?: any) => void;
}

export const Accueil: React.FC<AccueilProps> = ({ onNavigateTo }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Sélectionnez une catégorie...');
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, projRes, freeRes] = await Promise.all([
          axios.get('http://localhost:3000/api/client/categories'),
          axios.get('http://localhost:3000/api/client/projects/public'),
          axios.get('http://localhost:3000/api/freelance/public')
        ]);
        
        if (catRes.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data.map((c: any) => c.name));
        }
        
        if (projRes.data && Array.isArray(projRes.data)) {
          setProjects(projRes.data.slice(0, 4));
        }

        if (freeRes.data && Array.isArray(freeRes.data)) {
          setFreelancers(freeRes.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    };
    fetchData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Récemment';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `À l'instant`;
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  };

  const dummyProjects = [
    {
      id: 'dummy-1',
      category: { name: 'Dev Web' },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      title: "Création d'une plateforme E-commerce moderne",
      description: "Boutique en ligne complète avec paiements sécurisés et admin sur-mesure.",
      experienceLevel: 'EXPERT',
      budget: '500 000 - 1 000 000',
      budgetType: 'FIXED',
      client: { profile: { companyName: 'E-Corp' } }
    },
    {
      id: 'dummy-2',
      category: { name: 'Design' },
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      title: "Refonte de l'identité visuelle (Logo + Charte)",
      description: "Création d'un logo minimaliste et d'une charte graphique déclinable.",
      experienceLevel: 'INTERMEDIATE',
      budget: '200 000 - 400 000',
      budgetType: 'FIXED',
      client: { profile: { companyName: 'Studio Vision' } }
    },
    {
      id: 'dummy-3',
      category: { name: 'Rédaction' },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      title: "10 articles de blog tech & SEO",
      description: "Recherche rédacteur pour articles de 1000 mots avec maillage interne optimisé.",
      experienceLevel: 'JUNIOR',
      budget: '150 000 - 250 000',
      budgetType: 'FIXED',
      client: { profile: { companyName: 'Media Plus' } }
    },
    {
      id: 'dummy-4',
      category: { name: 'Marketing' },
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      title: "Gestion campagnes Facebook Ads B2C",
      description: "Mission de 3 mois pour paramétrer et optimiser nos campagnes pour maximiser le ROAS.",
      experienceLevel: 'EXPERT',
      budget: '300 000',
      budgetType: 'HOURLY', // Will display as FCFA/h
      client: { profile: { companyName: 'Agence Alpha' } }
    }
  ];

  const dummyFreelancers = [
    {
      id: 'dummy-f1',
      profile: {
        firstName: 'Mamadou',
        lastName: 'Traoré',
        title: 'Développeur Full Stack',
        bio: 'Expert en création d\'applications web modernes et performantes.',
        hourlyRate: 35,
        avatarUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
      },
      skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Python' }]
    },
    {
      id: 'dummy-f2',
      profile: {
        firstName: 'Fatoumata',
        lastName: 'Diop',
        title: 'UX/UI Designer',
        bio: 'Passionnée par la création d\'interfaces intuitives et esthétiques.',
        hourlyRate: 25,
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfff2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
      },
      skills: [{ name: 'Figma' }, { name: 'Design System' }, { name: 'Illustration' }]
    }
  ];

  const projectsToDisplay = projects.length > 0 ? projects : dummyProjects;
  const freelancersToDisplay = freelancers.length > 0 ? freelancers : dummyFreelancers;

  const handleShowDetails = (project: any) => {
    Swal.fire({
      title: `<h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0;">${project.title}</h3>`,
      html: `
        <div style="text-align: left; font-size: 0.95rem; color: #475569; margin-top: 15px;">
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
             <span style="background: #eff6ff; color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem;">
               ${project.category?.name || 'Général'}
             </span>
             <span style="background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem;">
               ${project.budget} ${project.budgetType === 'FIXED' ? 'FCFA' : 'FCFA/h'}
             </span>
          </div>
          <p style="margin-bottom: 15px; line-height: 1.5;"><strong>Description :</strong><br/> ${project.description}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0;"><strong>Niveau demandé :</strong> ${project.experienceLevel === 'JUNIOR' ? 'Junior' : project.experienceLevel === 'INTERMEDIATE' ? 'Intermédiaire' : 'Expert'}</p>
            <p style="margin: 0;"><strong>Client :</strong> ${project.client?.profile?.companyName || project.client?.profile?.firstName || 'Client'}</p>
          </div>
          <p style="text-align: center; color: #3b82f6; font-size: 0.85rem; font-weight: 600; margin: 0;">
            Connectez-vous pour postuler à cette offre !
          </p>
        </div>
      `,
      confirmButtonText: 'Postuler',
      confirmButtonColor: '#3b82f6',
      showCancelButton: true,
      cancelButtonText: 'Fermer',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'premium-swal-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onNavigateTo('LOGIN');
      }
    });
  };

  return (
    <div className="landing-container">
      {/* --- NAVIGATION --- */}
      <nav className="landing-nav">
        <div className="landing-logo" onClick={() => onNavigateTo('LANDING')} style={{ cursor: 'pointer' }}>
          <span className="logo-blue">Free</span><span className="logo-dark">Link</span>
        </div>

        <div className="landing-nav-tabs">
          <button className="nav-tab active" onClick={() => onNavigateTo('LANDING')}>
            Accueil
          </button>
          <button className="nav-tab" onClick={() => onNavigateTo('EXPLORE_PROJECTS')}>
            Missions
          </button>
        </div>

        <div className="landing-nav-actions">
          <button className="btn link-btn hide-on-mobile" onClick={() => onNavigateTo('LOGIN')}>
            Connexion
          </button>
          <button className="btn btn-primary btn-rounded hide-on-mobile" onClick={() => onNavigateTo('REGISTER')}>
            S'inscrire
          </button>
          <button className="btn btn-primary btn-rounded show-on-mobile" onClick={() => onNavigateTo('LOGIN')}>
            Se connecter
          </button>
        </div>
      </nav>

        {/* --- NEW CENTERED HERO SECTION --- */}
        <main className="hero-centered-layout">
          <div className="hero-background-gradient"></div>
          
          <div className="hero-content-wrapper">
            <span className="hero-badge-pill">✨ LA PLATEFORME N°1 EN AFRIQUE</span>
            <h1 className="hero-title-massive">
              Propulsez vos projets avec l'élite du <span className="text-gradient">freelancing en Afrique</span>
            </h1>
            <p className="hero-subtitle-centered">
              Trouvez les compétences qui manquent à votre équipe avec FreeLink, la première plateforme de mise en relation de talents certifiés en Afrique.
            </p>

            <div className="hero-search-container">
              <div className="hero-search-bar-premium">
                
                <div className="search-section search-category">
                  <div className="custom-dropdown-wrapper">
                    
                    <div 
                      className="custom-dropdown-header"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <div className="dropdown-left">
                        <div className="icon-badge">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                          </svg>
                        </div>
                        <div className="dropdown-text-group">
                          <label className="dropdown-label">Catégorie</label>
                          <span className={selectedCategory === 'Sélectionnez une catégorie...' ? 'placeholder-text' : 'selected-text'}>
                            {selectedCategory}
                          </span>
                        </div>
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={`dropdown-chevron ${isCategoryOpen ? 'open' : ''}`} 
                      />
                    </div>

                    {isCategoryOpen && (
                      <div className="custom-dropdown-list">
                        {categories.map((cat, idx) => (
                          <div 
                            key={idx} 
                            className={`custom-dropdown-item ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryOpen(false);
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-search-premium" 
                  onClick={() => {
                    const categoryToPass = selectedCategory !== 'Sélectionnez une catégorie...' ? selectedCategory : '';
                    onNavigateTo('EXPLORE_PROJECTS', { category: categoryToPass });
                  }}
                >
                  Rechercher
                </button>
              </div>
            </div>
            
            {/* End of Hero Content */}
          </div>
        </main>

      {/* --- RECENT PROJECTS SECTION --- */}
      <section className="projects-section">
        <div className="section-header-row">
          <div className="section-header-left">
            <h2 className="section-title">Projets récents</h2>
            <p className="section-subtitle">Découvrez les dernières offres publiées par nos clients et proposez vos services.</p>
          </div>
          <button className="btn link-btn view-all-btn" onClick={() => onNavigateTo('EXPLORE_PROJECTS')}>Voir tout</button>
        </div>

        <div className="projects-grid">
          {projectsToDisplay.map((project: any) => (
            <div className="project-widget-card" key={project.id}>
              <div className="widget-header">
                <div className="widget-badge bg-blue-light text-blue">
                  <Code size={14} /> <span>{project.category?.name || 'Général'}</span>
                </div>
                <div className="widget-time">
                  <Clock size={14} /> <span>{formatTimeAgo(project.createdAt)}</span>
                </div>
              </div>
              
              <h3 className="widget-title">{project.title}</h3>
              <p className="widget-desc">{project.description}</p>
              
              <div className="widget-pills-row">
                <div className="widget-pill">
                  <Briefcase size={14} /> 
                  <span>
                    {project.experienceLevel === 'JUNIOR' ? 'Junior' : 
                     project.experienceLevel === 'INTERMEDIATE' ? 'Intermédiaire' : 'Expert'}
                  </span>
                </div>
                <div className="widget-pill budget-pill">
                  <CreditCard size={14} /> 
                  <span>{project.budget} {project.budgetType === 'FIXED' ? 'FCFA' : 'FCFA/h'}</span>
                </div>
              </div>
              
              <div className="widget-footer">
                <div className="client-mini">
                  <div className="client-mini-avatar bg-blue-light text-blue">
                    {project.client?.profile?.companyName?.charAt(0) || project.client?.profile?.firstName?.charAt(0) || 'C'}
                  </div>
                  <span className="client-mini-name">
                    {project.client?.profile?.companyName || project.client?.profile?.firstName || 'Client'}
                  </span>
                </div>
                <button className="widget-btn" onClick={() => handleShowDetails(project)}>Voir</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="how-it-works-section">
        <div className="section-header-centered text-center">
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-subtitle">Une méthode simple pour démarrer vos projets rapidement et de façon sécurisée.</p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-icon-wrapper">
              <Target size={28} className="text-blue" />
            </div>
            <h3 className="step-title">Publiez une offre</h3>
            <p className="step-desc">Décrivez vos besoins et recevez des propositions d'experts qualifiés.</p>
          </div>

          <div className="step-divider"></div>

          <div className="step-item">
            <div className="step-icon-wrapper">
              <UserCheck size={28} className="text-blue" />
            </div>
            <h3 className="step-title">Faites un choix</h3>
            <p className="step-desc">Comparez les profils, échangez avec les candidats et choisissez le bon expert.</p>
          </div>

          <div className="step-divider"></div>

          <div className="step-item">
            <div className="step-icon-wrapper">
              <CheckCircle size={28} className="text-blue" />
            </div>
            <h3 className="step-title">Réussite</h3>
            <p className="step-desc">Collaborez en toute sécurité, payez de manière transparente et atteignez vos objectifs.</p>
          </div>
        </div>
      </section>

      {/* --- TOP FREELANCERS SECTION --- */}
      <section className="top-freelancers-section">
        <div className="section-header-row align-items-end">
          <div className="section-header-left">
            <h2 className="section-title">Nos Meilleurs Talents</h2>
            <p className="section-subtitle">Découvrez nos freelances les mieux notés.</p>
          </div>
          <div className="trust-indicator">
            <div className="avatar-group">
              <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" />
              <img src="https://i.pravatar.cc/100?img=33" alt="Avatar" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Avatar" />
            </div>
            <span className="trust-text">Ils nous font confiance</span>
          </div>
        </div>

        <div className="freelancers-grid">
          {freelancersToDisplay.map((freelancer: any) => (
            <div className="freelancer-card" key={freelancer.id}>
              <div className="freelancer-header">
                <img 
                  src={freelancer.profile?.avatarUrl || "https://i.pravatar.cc/150"} 
                  alt={freelancer.profile?.firstName || 'Freelance'} 
                  className="freelancer-img" 
                />
                <div className="freelancer-info">
                  <div className="name-rating">
                    <h3 className="freelancer-name">{freelancer.profile?.firstName} {freelancer.profile?.lastName}</h3>
                    <span className="freelancer-rating"><Star size={14} className="star-icon" fill="currentColor"/> 4.9</span>
                  </div>
                  <p className="freelancer-title">{freelancer.profile?.title || 'Freelance Indépendant'}</p>
                  <div className="freelancer-tags">
                    {freelancer.skills?.slice(0, 3).map((skill: any, idx: number) => (
                      <span className="tag-sm" key={idx}>{skill.name || skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="freelancer-bio">{freelancer.profile?.bio || 'Aucune description fournie.'}</p>
              <div className="freelancer-footer">
                <span className="freelancer-price">{freelancer.profile?.hourlyRate || 0} FCFA <span className="text-muted">/ heure</span></span>
                <button className="btn btn-dark btn-rounded-sm" onClick={() => onNavigateTo('REGISTER')}>Voir le profil</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section className="why-choose-section">
        <div className="why-choose-content">
          <div className="why-text-col">
            <h2 className="why-title">Pourquoi choisir<br/> FreeLink ?</h2>
            
            <div className="why-feature">
              <div className="why-icon-wrapper">
                <Globe size={20} className="text-blue" />
              </div>
              <div className="why-feature-text">
                <h3>Expertise Locale</h3>
                <p>Des talents qui comprennent vos réalités culturelles et économiques.</p>
              </div>
            </div>
            
            <div className="why-feature">
              <div className="why-icon-wrapper">
                <ShieldCheck size={20} className="text-blue" />
              </div>
              <div className="why-feature-text">
                <h3>Sécurité Garantie</h3>
                <p>Vos paiements sont sécurisés et ne sont libérés qu'après satisfaction.</p>
              </div>
            </div>
            
            <div className="why-feature">
              <div className="why-icon-wrapper">
                <Zap size={20} className="text-blue" />
              </div>
              <div className="why-feature-text">
                <h3>Recrutement Rapide</h3>
                <p>Trouvez les bons profils en quelques heures et démarrez vos projets rapidement.</p>
              </div>
            </div>
          </div>
          
          <div className="why-image-col">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Team meeting" 
              className="why-image"
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-icon-bg"><Target size={120} /></div>
          <h2 className="cta-title">Prêt à transformer votre vision en réalité ?</h2>
          <p className="cta-subtitle">Rejoignez la plateforme de freelancing en croissance rapide en Afrique.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-lg btn-rounded" onClick={() => onNavigateTo('REGISTER')}>Trouver un talent</button>
            <button className="btn btn-white btn-lg btn-rounded" onClick={() => onNavigateTo('REGISTER')}>S'inscrire</button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer-new">
        <div className="footer-content">
          <div className="footer-brand-col">
            <div className="landing-logo">
              <span className="logo-blue">Free</span><span className="logo-dark">Link</span>
            </div>
            <p className="footer-desc">
              La première plateforme de freelancing en Afrique qui connecte les talents locaux aux opportunités globales.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon"><TwitterIcon /></a>
              <a href="#" className="social-icon"><LinkedinIcon /></a>
              <a href="#" className="social-icon"><FacebookIcon /></a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>PLATEFORME</h4>
            <ul>
              <li><a href="#">Accueil</a></li>
              <li><a href="#">Fonctionnement</a></li>
              <li><a href="#">Trouver un talent</a></li>
              <li><a href="#">S'inscrire</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>LÉGAL</h4>
            <ul>
              <li><a href="#">Mentions Légales</a></li>
              <li><a href="#">CGU / CGV</a></li>
              <li><a href="#">Politique de confidentialité</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>FAQ</h4>
            <ul>
              <li><a href="#">Centre d'aide</a></li>
              <li><a href="#">Contactez-nous</a></li>
              <li><a href="#">Devenir Partenaire</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 FreeLink. Tous droits réservés.</p>
          <div className="footer-bottom-badge">
            <Globe size={14} /> Made in Africa
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper components for icons to match design

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
