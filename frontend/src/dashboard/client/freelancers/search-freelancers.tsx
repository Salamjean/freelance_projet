import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Briefcase, Send, Eye, Users, Phone, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { FreelancerProfile } from './freelancer-profile';
import { InviteModal } from './invite-modal';
import type { FreelancerFull } from './freelancer-profile';
import './search-freelancers.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  skill: { id: number; name: string };
}

interface Profile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  location?: string;
  hourlyRate?: number | string | null;
  skills?: Skill[];
  phone?: string;
  idVerificationStatus?: string;
}

type Freelancer = FreelancerFull;

interface SearchFreelancersProps {
  userId?: number | null;
}

// ─── Données simulées (fallback) ──────────────────────────────────────────────

const MOCK_FREELANCERS: Freelancer[] = [
  {
    id: 1,
    email: 'alpha.diallo@gmail.com',
    completedMissions: 12,
    averageRating: 4.8,
    reviewsCount: 10,
    profile: {
      firstName: 'Alpha',
      lastName: 'Diallo',
      title: 'Développeur Fullstack React / Node.js',
      bio: 'Développeur passionné avec 5 ans d\'expérience en développement web. Spécialisé dans la création d\'applications modernes et performantes.',
      location: 'Abidjan, Côte d\'Ivoire',
      hourlyRate: 15000,
      skills: [
        { skill: { id: 1, name: 'React' } },
        { skill: { id: 2, name: 'Node.js' } },
        { skill: { id: 3, name: 'TypeScript' } },
        { skill: { id: 4, name: 'PostgreSQL' } },
      ],
    },
  },
  {
    id: 2,
    email: 'fatou.ndiaye@gmail.com',
    completedMissions: 8,
    averageRating: 4.6,
    reviewsCount: 7,
    profile: {
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      title: 'Designer UI/UX & Graphiste',
      bio: 'Créatrice d\'interfaces et d\'identités visuelles modernes. Je transforme vos idées en designs qui captivent et convertissent.',
      location: 'Abidjan, Côte d\'Ivoire',
      hourlyRate: 12000,
      skills: [
        { skill: { id: 5, name: 'Figma' } },
        { skill: { id: 6, name: 'Adobe XD' } },
        { skill: { id: 7, name: 'Illustrator' } },
      ],
    },
  },
  {
    id: 3,
    email: 'moussa.traore@gmail.com',
    completedMissions: 20,
    averageRating: 4.9,
    reviewsCount: 18,
    profile: {
      firstName: 'Moussa',
      lastName: 'Traoré',
      title: 'Expert Marketing Digital & SEO',
      bio: 'Spécialiste en référencement, publicité en ligne et stratégies de croissance digitale pour les PME africaines.',
      location: 'Bamako, Mali',
      hourlyRate: 10000,
      skills: [
        { skill: { id: 8, name: 'SEO' } },
        { skill: { id: 9, name: 'Google Ads' } },
        { skill: { id: 10, name: 'Facebook Ads' } },
        { skill: { id: 11, name: 'Analytics' } },
      ],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(profile: Profile | null, email: string): string {
  if (profile?.firstName && profile?.lastName)
    return `${profile.firstName[0]}${profile.lastName[0]}`;
  return email[0].toUpperCase();
}

function getDisplayName(profile: Profile | null, email: string): string {
  if (profile?.firstName && profile?.lastName)
    return `${profile.firstName} ${profile.lastName}`;
  return email.split('@')[0];
}

function getExperienceLevelFromRate(hourlyRate: number | string | null | undefined): string {
  const rate = Number(hourlyRate) || 0;
  if (rate >= 20000) return 'EXPERT';
  return 'JUNIOR';
}

function getLevelLabel(level: string): string {
  const map: Record<string, string> = {
    JUNIOR: 'Junior',
    EXPERT: 'Expert',
  };
  return map[level] || 'Junior';
}

function getLevelClass(level: string): string {
  const map: Record<string, string> = {
    JUNIOR: 'level-junior',
    EXPERT: 'level-expert',
  };
  return map[level] || 'level-junior';
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export const SearchFreelancers: React.FC<SearchFreelancersProps> = ({ userId }) => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerFull | null>(null);
  const [freelancerToInvite, setFreelancerToInvite] = useState<FreelancerFull | null>(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await axios.get('http://192.168.1.18:3000/api/freelance/public');
        setFreelancers(response.data);
      } catch (err) {
        console.warn('Impossible de récupérer les freelances, utilisation de données simulées.');
        setFreelancers(MOCK_FREELANCERS);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = freelancers.filter((f) => {
    const name = getDisplayName(f.profile, f.email).toLowerCase();
    const title = (f.profile?.title || '').toLowerCase();
    const skills = (f.profile?.skills || [])
      .map((s) => s.skill.name.toLowerCase())
      .join(' ');
    const matchSearch =
      searchTerm === '' ||
      name.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase()) ||
      skills.includes(searchTerm.toLowerCase());

    const level = getExperienceLevelFromRate(f.profile?.hourlyRate);
    const matchLevel = levelFilter === 'ALL' || level === levelFilter;

    return matchSearch && matchLevel;
  });

  // ── Handler invitation ────────────────────────────────────────────────────
  const handleInvite = (freelancer: Freelancer) => {
    setFreelancerToInvite(freelancer as FreelancerFull);
  };

  // ── Rendu profil sélectionné ─────────────────────────────────────────────
  if (selectedFreelancer) {
    return (
      <FreelancerProfile
        freelancer={selectedFreelancer}
        onBack={() => setSelectedFreelancer(null)}
      />
    );
  }

  // ── Rendu skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="search-freelancers-page">
        <div className="page-header">
          <h2 className="page-title">Trouver un Freelance</h2>
        </div>
        <div className="freelancers-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="freelancer-card-skeleton">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="skeleton-line" style={{ width: 56, height: 56, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton-line" style={{ height: 16, width: '70%' }} />
                  <div className="skeleton-line" style={{ height: 13, width: '50%' }} />
                </div>
              </div>
              <div className="skeleton-line" style={{ height: 40 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="skeleton-line" style={{ height: 24, width: 60 }} />
                <div className="skeleton-line" style={{ height: 24, width: 80 }} />
                <div className="skeleton-line" style={{ height: 24, width: 55 }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <div className="skeleton-line" style={{ flex: 1, height: 36 }} />
                <div className="skeleton-line" style={{ width: 42, height: 36 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <div className="search-freelancers-page">
      {/* En-tête */}
      <div className="page-header">
        <h2 className="page-title">Trouver un Freelance</h2>
      </div>

      {/* Filtres */}
      <div className="freelancer-filters">
        <div className="freelancer-search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="freelancer-search-input"
            placeholder="Rechercher par nom, titre ou compétence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="freelancer-filter-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="ALL">Tous les niveaux</option>
          <option value="JUNIOR">Junior</option>
          <option value="EXPERT">Expert</option>
        </select>

        <span className="freelancers-count-badge">
          {filtered.length} freelance{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grille de cartes */}
      {filtered.length === 0 ? (
        <div className="empty-freelancers">
          <Users size={56} />
          <p>Aucun freelance trouvé</p>
          <span>Essayez de modifier vos critères de recherche ou de filtre.</span>
        </div>
      ) : (
        <div className="freelancers-grid">
          {filtered.map((freelancer) => {
            const name = getDisplayName(freelancer.profile, freelancer.email);
            const initials = getInitials(freelancer.profile, freelancer.email);
            const level = getExperienceLevelFromRate(freelancer.profile?.hourlyRate);
            const skills = freelancer.profile?.skills || [];
            const visibleSkills = skills.slice(0, 4);
            const extraSkillsCount = skills.length - visibleSkills.length;
            const hourlyRate = freelancer.profile?.hourlyRate
              ? `${Number(freelancer.profile.hourlyRate).toLocaleString('fr-FR')} FCFA/h`
              : 'Non renseigné';

            return (
              <div key={freelancer.id} className="freelancer-card">
                {/* Header */}
                <div className="freelancer-card-header">
                  <div className="freelancer-avatar-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
                    <div className="freelancer-avatar">
                      {freelancer.profile?.avatarUrl ? (
                        <img src={freelancer.profile.avatarUrl} alt={name} />
                      ) : (
                        initials
                      )}
                    </div>
                    {freelancer.profile?.idVerificationStatus === 'APPROVED' && (
                      <span 
                        title="Profil certifié" 
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          zIndex: 10,
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          padding: '1px'
                        }}
                      >
                        <CheckCircle2 size={14} fill="#3b82f6" color="white" />
                      </span>
                    )}
                  </div>
                  <div className="freelancer-card-info">
                    <h3 className="freelancer-name">{name}</h3>
                    <p className="freelancer-title">
                      {freelancer.profile?.title || 'Freelance Professionnel'}
                    </p>
                    {freelancer.profile?.location && (
                      <span className="freelancer-location">
                        <MapPin size={11} />
                        {freelancer.profile.location}
                      </span>
                    )}
                    {freelancer.profile?.phone && (
                      <span className="freelancer-location" style={{ marginTop: 2 }}>
                        <Phone size={11} />
                        {freelancer.profile.phone}
                      </span>
                    )}
                  </div>
                  <span className={`freelancer-level-badge ${getLevelClass(level)}`}>
                    {getLevelLabel(level)}
                  </span>
                </div>


                {/* Compétences */}
                {visibleSkills.length > 0 && (
                  <div className="freelancer-skills">
                    {visibleSkills.map((s) => (
                      <span key={s.skill.id} className="skill-tag">
                        {s.skill.name}
                      </span>
                    ))}
                    {extraSkillsCount > 0 && (
                      <span className="skill-tag-more">+{extraSkillsCount}</span>
                    )}
                  </div>
                )}

                <div className="freelancer-card-divider" />

                {/* Stats */}
                <div className="freelancer-card-stats">
                  <div className="freelancer-stat">
                    <span className="freelancer-stat-value">
                      <Briefcase size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--primary-color)' }} />
                      {freelancer.completedMissions}
                    </span>
                    <span className="freelancer-stat-label">Missions</span>
                  </div>

                  <div className="freelancer-stat">
                    {freelancer.averageRating !== null ? (
                      <>
                        <span className="freelancer-stat-value stat-stars">
                          <Star size={14} fill="#f59e0b" />
                          {freelancer.averageRating.toFixed(1)}
                        </span>
                        <span className="freelancer-stat-label">{freelancer.reviewsCount} avis</span>
                      </>
                    ) : (
                      <>
                        <span className="freelancer-stat-value" style={{ color: 'var(--text-muted)' }}>—</span>
                        <span className="freelancer-stat-label">Pas encore d'avis</span>
                      </>
                    )}
                  </div>

                  <div className="freelancer-stat">
                    <span className="freelancer-stat-value stat-rate" style={{ fontSize: 13 }}>
                      {hourlyRate}
                    </span>
                    <span className="freelancer-stat-label">Tarif horaire</span>
                  </div>
                </div>

                <div className="freelancer-card-divider" />

                {/* Boutons */}
                <div className="freelancer-card-footer">
                  <button
                    className="btn-invite"
                    onClick={() => handleInvite(freelancer)}
                  >
                    <Send size={14} />
                    Inviter à postuler
                  </button>
                  <button
                    className="btn-view-profile"
                    title="Voir le profil complet"
                    onClick={() => setSelectedFreelancer(freelancer)}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {freelancerToInvite && (
        <InviteModal
          userId={userId ?? null}
          freelancer={freelancerToInvite}
          onClose={() => setFreelancerToInvite(null)}
        />
      )}
    </div>
  );
};
