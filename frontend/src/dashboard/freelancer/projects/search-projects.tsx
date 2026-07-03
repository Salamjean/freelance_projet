import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Calendar, Send, Award, Eye, Heart } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './search-projects.css';

import { useSearchParams, useNavigate } from 'react-router-dom';

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

interface SearchProjectsProps {
  userId: number | null;
}

export const SearchProjects: React.FC<SearchProjectsProps> = ({ userId }) => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId');
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<Set<number>>(new Set());
  
  // Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDelay, setDeliveryDelay] = useState('');
  const [deliveryUnit, setDeliveryUnit] = useState<'jours' | 'mois' | 'années'>('jours');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userCvUrl, setUserCvUrl] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Charger les projets ouverts
        const projectsRes = await axios.get('http://192.168.1.18:3000/api/client/projects/public');
        setProjects(projectsRes.data);

        // 2. Charger les catégories
        const categoriesRes = await axios.get('http://192.168.1.18:3000/api/client/categories');
        setCategories(categoriesRes.data);

        // 3. Charger les candidatures du freelance pour marquer celles déjà postulées
        if (userId) {
          const appsRes = await axios.get(`http://192.168.1.18:3000/api/freelance/${userId}/applications`);
          const ids = new Set<number>(appsRes.data.map((app: any) => app.projectId));
          setAppliedProjectIds(ids);

          // 4. Charger le profil pour récupérer le CV pré-chargé
          const profileRes = await axios.get(`http://192.168.1.18:3000/api/auth/profile/${userId}`);
          setUserCvUrl(profileRes.data.cvUrl || '');

          // 5. Charger les projets favoris
          const favsRes = await axios.get(`http://192.168.1.18:3000/api/freelance/${userId}/favorites`);
          const favIds = new Set<number>(favsRes.data.map((fav: any) => fav.id));
          setFavoriteProjectIds(favIds);
        }

        // 5. Ouvrir automatiquement le modal si projectId est dans l'URL
        if (initialProjectId) {
          const targetProject = projectsRes.data.find((p: Project) => p.id === Number(initialProjectId));
          if (targetProject) {
            setSelectedProject(targetProject);
            setShowApplyModal(true);
          }
        }

      } catch (err) {
        console.error('Erreur de chargement des projets ou candidatures', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, initialProjectId]);

  // Filtrage
  const filteredProjects = projects.filter((p) => {
    const title = p.title.toLowerCase();
    const desc = p.description.toLowerCase();
    const categoryName = p.category?.name.toLowerCase() || '';
    const subCategoryName = p.subCategory?.name.toLowerCase() || '';
    
    const matchSearch = 
      searchTerm === '' ||
      title.includes(searchTerm.toLowerCase()) ||
      desc.includes(searchTerm.toLowerCase()) ||
      categoryName.includes(searchTerm.toLowerCase()) ||
      subCategoryName.includes(searchTerm.toLowerCase());
      
    const matchCategory = categoryFilter === 'ALL' || p.category?.id.toString() === categoryFilter;
    const matchLevel = levelFilter === 'ALL' || p.experienceLevel === levelFilter;
    
    // N'afficher que les projets auxquels le freelance n'a pas encore postulé
    const notApplied = !appliedProjectIds.has(p.id);

    // Filtre favoris
    const matchFavorite = showFavoritesOnly ? favoriteProjectIds.has(p.id) : true;

    return matchSearch && matchCategory && matchLevel && notApplied && matchFavorite;
  });

  const toggleFavorite = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (!userId) return;

    const isFav = favoriteProjectIds.has(projectId);
    
    // Mise à jour optimiste
    setFavoriteProjectIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(projectId);
      else next.add(projectId);
      return next;
    });

    try {
      await axios.post(`http://192.168.1.18:3000/api/freelance/${userId}/favorites/${projectId}`);
    } catch (err) {
      console.error("Erreur toggle favori", err);
      // Revert en cas d'erreur
      setFavoriteProjectIds(prev => {
        const next = new Set(prev);
        if (isFav) next.add(projectId);
        else next.delete(projectId);
        return next;
      });
    }
  };

  const handleModalCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: 'Format invalide',
        text: 'Veuillez téléverser un fichier au format PDF.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: 'Fichier trop volumineux',
        text: 'La taille maximale autorisée pour le CV est de 10 Mo.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64Cv = event.target!.result as string;
        try {
          // Charger le profil pour avoir les infos complètes avant PATCH
          const profileRes = await axios.get(`http://192.168.1.18:3000/api/auth/profile/${userId}`);
          const p = profileRes.data;

          await axios.patch(`http://192.168.1.18:3000/api/auth/profile/${userId}`, {
            firstName: p.firstName,
            lastName: p.lastName,
            title: p.title,
            bio: p.bio,
            location: p.location,
            phone: p.phone,
            hourlyRate: p.hourlyRate,
            githubLink: p.githubLink || null,
            linkedinLink: p.linkedinLink || null,
            websiteLink: p.websiteLink || null,
            skillNames: p.skills.map((s: any) => s.skill?.name || s.name),
            avatarUrl: p.avatarUrl || null,
            cvUrl: base64Cv,
          });

          setUserCvUrl(base64Cv);
          Swal.fire({
            title: 'CV ajouté !',
            text: 'Votre CV a été importé et enregistré sur votre profil.',
            icon: 'success',
            confirmButtonColor: '#2563eb',
            heightAuto: false,
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Erreur',
            text: 'Impossible de charger le CV sur votre profil.',
            icon: 'error',
            confirmButtonColor: '#2563eb',
            heightAuto: false,
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const openApplyModal = (project: Project) => {
    setSelectedProject(project);
    setBidAmount(String(project.budget));
    setDeliveryDelay('7');
    setDeliveryUnit('jours');
    setCoverLetter('');
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedProject) return;

    if (!bidAmount || Number(bidAmount) <= 0) {
      Swal.fire({
        title: 'Montant invalide',
        text: 'Veuillez saisir une offre budgétaire valide supérieure à 0 FCFA.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      return;
    }

    let multiplier = 1;
    if (deliveryUnit === 'mois') multiplier = 30;
    else if (deliveryUnit === 'années') multiplier = 365;
    const finalDeliveryDelay = parseInt(deliveryDelay, 10) * multiplier;

    if (!deliveryDelay || finalDeliveryDelay <= 0) {
      Swal.fire({
        title: 'Délai invalide',
        text: 'Veuillez renseigner un délai de livraison valide.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      return;
    }

    if (coverLetter.trim().length < 50) {
      Swal.fire({
        title: 'Lettre trop courte',
        text: 'Votre lettre de motivation doit faire au moins 50 caractères pour être professionnelle.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://192.168.1.18:3000/api/freelance/${userId}/applications`, {
        projectId: selectedProject.id,
        bidAmount: parseFloat(bidAmount),
        deliveryDelay: finalDeliveryDelay,
        coverLetter: coverLetter,
      });

      // Update local state
      setAppliedProjectIds((prev) => {
        const copy = new Set(prev);
        copy.add(selectedProject.id);
        return copy;
      });

      Swal.fire({
        title: 'Candidature envoyée !',
        text: 'Votre candidature a été soumise avec succès au client.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
      setShowApplyModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Impossible de soumettre votre candidature.';
      Swal.fire({
        title: 'Erreur',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getClientName = (project: Project) => {
    if (!project.client) return 'Client Anonyme';
    const profile = project.client.profile;
    if (profile?.companyName) return profile.companyName;
    if (profile?.firstName && profile?.lastName) return `${profile.firstName} ${profile.lastName}`;
    return project.client.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="search-projects-page">
        <div className="page-header">
          <h2 className="page-title">Rechercher des projets</h2>
        </div>
        <div className="projects-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="project-card-skeleton">
              <div className="skeleton-line" style={{ height: 20, width: '60%' }} />
              <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
              <div className="skeleton-line" style={{ height: 48, width: '100%', marginTop: 8 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div className="skeleton-line" style={{ height: 24, width: 80 }} />
                <div className="skeleton-line" style={{ height: 24, width: 80 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="search-projects-page">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Trouver un projet</h2>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="project-search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="project-search-input"
            placeholder="Rechercher par mot-clé, titre, technologie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="project-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="project-filter-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="ALL">Niveau d'expérience (Tous)</option>
          <option value="JUNIOR">Débutant / Junior</option>
          <option value="INTERMEDIATE">Intermédiaire</option>
          <option value="EXPERT">Expert / Sénior</option>
        </select>

        <span className="projects-count-badge">
          {filteredProjects.length} offre{filteredProjects.length !== 1 ? 's' : ''} disponible{filteredProjects.length !== 1 ? 's' : ''}
        </span>
        
        <button 
          className={`btn-favorite-filter ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', border: '1px solid #d1d5db',
            borderRadius: '6px', backgroundColor: showFavoritesOnly ? '#fee2e2' : 'white',
            color: showFavoritesOnly ? '#dc2626' : '#374151',
            cursor: 'pointer', fontWeight: 500, fontSize: '14px',
            marginLeft: 'auto'
          }}
        >
          <Heart size={16} fill={showFavoritesOnly ? '#dc2626' : 'none'} color={showFavoritesOnly ? '#dc2626' : '#6b7280'} />
          Mes favoris
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-projects">
          <Briefcase size={48} />
          <p>Aucun projet ne correspond à vos critères</p>
          <span>Essayez d'ajuster vos filtres ou de modifier votre recherche.</span>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const hasApplied = appliedProjectIds.has(project.id);
            const clientName = getClientName(project);
            const isFixed = project.budgetType === 'FIXED';
            const formattedBudget = Number(project.budget).toLocaleString('fr-FR') + ' FCFA';
            const isFav = favoriteProjectIds.has(project.id);

            return (
              <div key={project.id} className="project-card">
                {/* Upper section */}
                <div className="project-card-top">
                  <div style={{ flex: 1 }}>
                    <div className="project-category-row">
                      <span className="project-cat-badge">{project.category?.name}</span>
                      {project.subCategory && (
                        <span className="project-subcat-badge">{project.subCategory.name}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="project-card-title">{project.title}</h3>
                      <button 
                        onClick={(e) => toggleFavorite(e, project.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '4px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isFav ? '#dc2626' : '#9ca3af',
                          backgroundColor: isFav ? '#fee2e2' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Heart size={20} fill={isFav ? '#dc2626' : 'none'} />
                      </button>
                    </div>
                    <p className="project-client-name">
                      Proposé par : <strong>{clientName}</strong>
                    </p>
                  </div>
                  <div className="project-budget-badge">
                    <span className="budget-type">{isFixed ? 'Budget Fixe' : 'Taux horaire'}</span>
                    <span className="budget-value">{formattedBudget}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="project-card-description">{project.description}</p>

                {/* Specs */}
                <div className="project-card-specs">
                  <div className="spec-item" title="Niveau d'expérience requis">
                    <Award size={14} />
                    <span>{project.experienceLevel === 'EXPERT' ? 'Expert' : project.experienceLevel === 'INTERMEDIATE' ? 'Intermédiaire' : 'Junior'}</span>
                  </div>
                  {project.duration && (
                    <div className="spec-item" title="Durée estimée">
                      <Calendar size={14} />
                      <span>{project.duration}</span>
                    </div>
                  )}
                  <div className="spec-item text-muted" style={{ marginLeft: 'auto' }}>
                    Posté le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="project-card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => navigate(`/freelancer/projects/${project.id}`)}
                    title="Voir les détails"
                  >
                    <Eye size={18} />
                  </button>
                  
                  {hasApplied ? (
                    <button className="btn-apply-disabled" disabled style={{ flex: 1 }}>
                      ✓ Candidature Envoyée
                    </button>
                  ) : (
                    <button className="btn-apply-action" onClick={() => openApplyModal(project)} style={{ flex: 1 }}>
                      <Send size={14} /> Postuler à cette offre
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="apply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Postuler : {selectedProject.title}</h3>
              <button className="close-modal-btn" onClick={() => setShowApplyModal(false)}>×</button>
            </div>
            <form onSubmit={handleApplySubmit} className="modal-form">
              <div className="modal-info-bar">
                <p>Budget proposé par le client : <strong>{Number(selectedProject.budget).toLocaleString('fr-FR')} FCFA</strong> ({selectedProject.budgetType === 'FIXED' ? 'Budget Fixe' : 'Horaire'})</p>
              </div>

              <div className="form-fields-row">
                <div className="modal-form-field">
                  <label>Votre offre budgétaire (FCFA)</label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      required
                      disabled
                      value={bidAmount}
                      placeholder="Montant de votre offre"
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#4b5563' }}
                    />
                    <span className="input-right-label">FCFA</span>
                  </div>
                </div>

                <div className="modal-form-field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ marginBottom: 0 }}>Délai de livraison estimé</label>
                    <div className="delivery-unit-toggle">
                      {(['jours', 'mois', 'années'] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          className={`unit-pill${deliveryUnit === unit ? ' active' : ''}`}
                          onClick={() => setDeliveryUnit(unit)}
                        >
                          {unit === 'jours' ? 'JJ' : unit === 'mois' ? 'MM' : 'AA'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      required
                      value={deliveryDelay}
                      onChange={(e) => setDeliveryDelay(e.target.value)}
                      placeholder={deliveryUnit === 'jours' ? 'Ex : 7' : deliveryUnit === 'mois' ? 'Ex : 2' : 'Ex : 1'}
                    />
                    <span className="input-right-label">
                      {deliveryUnit === 'jours' ? 'Jours' : deliveryUnit === 'mois' ? 'Mois' : 'Années'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-form-field">
                <label>CV de candidature</label>
                {userCvUrl ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <span>✓ Votre CV est attaché à cette candidature</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(
                              `<iframe src="${userCvUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                            );
                          }
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#166534',
                          textDecoration: 'underline',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Visualiser
                      </button>
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('modal-cv-upload-input')?.click()}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#4b5563',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        Remplacer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '6px',
                    color: '#b45309',
                    fontSize: '13px'
                  }}>
                    <span style={{ fontWeight: 600 }}>⚠️ Aucun CV n'est attaché à votre profil.</span>
                    <span>Nous vous conseillons fortement de lier un CV pour postuler à ce projet.</span>
                    <button
                      type="button"
                      onClick={() => document.getElementById('modal-cv-upload-input')?.click()}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#d97706',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Charger un CV (PDF)
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  id="modal-cv-upload-input" 
                  accept="application/pdf" 
                  style={{ display: 'none' }}
                  onChange={handleModalCvChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="modal-form-field">
                <label>Lettre de motivation / Proposition commerciale</label>
                <textarea
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Décrivez votre expérience avec des projets similaires et proposez votre méthodologie de travail..."
                  rows={6}
                />
                <span className="char-count-hint" style={{ color: coverLetter.length < 50 ? '#b45309' : '#059669' }}>
                  {coverLetter.length} caractères (minimum 50 requis)
                </span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowApplyModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-modal-submit" disabled={submitting}>
                  {submitting ? 'Envoi...' : 'Envoyer ma proposition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
