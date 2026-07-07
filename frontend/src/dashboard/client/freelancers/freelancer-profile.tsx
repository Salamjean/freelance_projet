import {
  ArrowLeft,
  MapPin,
  Mail,
  Star,
  Briefcase,
  DollarSign,
  Send,
  Code2,
  ExternalLink,
  Globe,
  Award,
  Phone,
  CheckCircle2,
  FileText,
  FolderOpen,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { InviteModal } from './invite-modal';
import './freelancer-profile.css';

// ─── Types (dupliqués ici pour autonomie du composant) ────────────────────────

interface Skill {
  skill: { id: number; name: string };
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface PortfolioFile {
  id: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string;
  githubLink?: string;
  demoLink?: string;
  files: PortfolioFile[];
}

interface Profile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  cvUrl?: string;
  bio?: string;
  title?: string;
  location?: string;
  hourlyRate?: number | string | null;
  skills?: Skill[];
  githubLink?: string;
  linkedinLink?: string;
  websiteLink?: string;
  phone?: string;
  idVerificationStatus?: string;
  experiences?: Experience[];
  educations?: Education[];
  certificates?: Certificate[];
  portfolios?: Portfolio[];
}

export interface FreelancerFull {
  id: number;
  email: string;
  profile: Profile | null;
  completedMissions: number;
  averageRating: number | null;
  reviewsCount: number;
}

interface FreelancerProfileProps {
  freelancer: FreelancerFull;
  onBack: () => void;
  hideInviteButton?: boolean;
  userId?: number | null;
}

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
  if (rate >= 10000) return 'INTERMEDIATE';
  return 'JUNIOR';
}

function getLevelLabel(level: string): string {
  const map: Record<string, string> = {
    JUNIOR: 'Junior',
    INTERMEDIATE: 'Intermédiaire',
    EXPERT: 'Expert',
  };
  return map[level] || 'Junior';
}

function getLevelClass(level: string): string {
  const map: Record<string, string> = {
    JUNIOR: 'level-junior',
    INTERMEDIATE: 'level-intermediate',
    EXPERT: 'level-expert',
  };
  return map[level] || 'level-junior';
}

function renderStars(rating: number | null) {
  const stars = [];
  const filled = Math.round(rating || 0);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= filled
        ? <Star key={i} size={16} className="profile-star-filled" fill="#f59e0b" color="#f59e0b" />
        : <Star key={i} size={16} className="profile-star-empty" color="#d1d5db" />
    );
  }
  return <div className="profile-rating-row">{stars}</div>;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const FreelancerProfile: React.FC<FreelancerProfileProps> = ({ freelancer, onBack, hideInviteButton = false, userId }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const name = getDisplayName(freelancer.profile, freelancer.email);
  const initials = getInitials(freelancer.profile, freelancer.email);
  const level = getExperienceLevelFromRate(freelancer.profile?.hourlyRate);
  const skills = freelancer.profile?.skills || [];
  const hourlyRate = freelancer.profile?.hourlyRate
    ? `${Number(freelancer.profile.hourlyRate).toLocaleString('fr-FR')} FCFA / heure`
    : 'Non renseigné';

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  return (
    <div className="freelancer-profile-page">

      {/* ── Bouton retour ──────────────────────────────────── */}
      <button className="profile-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      {/* ── Hero Card ──────────────────────────────────────── */}
      <div className="profile-hero-card">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
            <div className="profile-avatar-large">
              {freelancer.profile?.avatarUrl
                ? <img src={freelancer.profile.avatarUrl} alt={name} />
                : initials}
            </div>
            {freelancer.profile?.idVerificationStatus === 'APPROVED' && (
              <span 
                title="Profil certifié par l'administration" 
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                  padding: '3px'
                }}
              >
                <CheckCircle2 size={18} fill="#3b82f6" color="white" />
              </span>
            )}
          </div>

          <div className="profile-hero-info">
            <div className="profile-hero-left">
              <h1>{name}</h1>
              <p className="profile-hero-title">
                {freelancer.profile?.title || 'Freelance Professionnel'}
              </p>
              <div className="profile-hero-meta">
                {freelancer.profile?.location && (
                  <span className="profile-meta-item">
                    <MapPin size={14} /> {freelancer.profile.location}
                  </span>
                )}
                <span className="profile-meta-item">
                  <Mail size={14} /> {freelancer.email}
                </span>
                <span className="profile-meta-item">
                  <DollarSign size={14} /> {hourlyRate}
                </span>
              </div>
            </div>

            <div className="profile-hero-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
              <span className={`profile-level-badge ${getLevelClass(level)}`} style={{ alignSelf: 'flex-start' }}>
                {getLevelLabel(level)}
              </span>
              {!hideInviteButton && (
                <button className="profile-btn-invite" onClick={handleInvite}>
                  <Send size={15} />
                  Inviter à postuler
                </button>
              )}
              {freelancer.profile?.cvUrl && (
                <button 
                  className="profile-btn-cv" 
                  onClick={() => {
                    const cv = freelancer.profile?.cvUrl;
                    if (!cv) return;
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.body.style.margin = '0';
                      const iframe = newWindow.document.createElement('iframe');
                      iframe.src = cv;
                      iframe.style.border = '0';
                      iframe.style.position = 'absolute';
                      iframe.style.top = '0px';
                      iframe.style.left = '0px';
                      iframe.style.bottom = '0px';
                      iframe.style.right = '0px';
                      iframe.style.width = '100%';
                      iframe.style.height = '100%';
                      iframe.allowFullscreen = true;
                      newWindow.document.body.appendChild(iframe);
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'white',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FileText size={15} /> Voir le CV (PDF)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-icon">
            <Briefcase size={22} />
          </div>
          <div className="profile-stat-text">
            <span className="profile-stat-value">{freelancer.completedMissions}</span>
            <span className="profile-stat-label">Missions complétées</span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon gold">
            <Star size={22} fill="#b45309" />
          </div>
          <div className="profile-stat-text">
            <span className="profile-stat-value">
              {freelancer.averageRating !== null
                ? `${freelancer.averageRating.toFixed(1)} / 5`
                : '—'}
            </span>
            <span className="profile-stat-label">
              {freelancer.reviewsCount > 0
                ? `${freelancer.reviewsCount} avis clients`
                : 'Pas encore noté'}
            </span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon green">
            <Award size={22} />
          </div>
          <div className="profile-stat-text">
            <span className="profile-stat-value">{getLevelLabel(level)}</span>
            <span className="profile-stat-label">Niveau d'expérience</span>
          </div>
        </div>
      </div>

      {/* ── Corps ──────────────────────────────────────────── */}
      <div className="profile-body-grid">

        {/* Colonne principale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* À propos */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">À propos</h2>
            {freelancer.profile?.bio
              ? <p className="profile-bio-text">{freelancer.profile.bio}</p>
              : <p className="profile-empty-section">Aucune biographie renseignée.</p>}
          </div>

          {/* Compétences */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">Compétences</h2>
            {skills.length > 0
              ? (
                <div className="profile-skills-wrap">
                  {skills.map((s) => (
                    <span key={s.skill.id} className="profile-skill-tag">
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              )
              : <p className="profile-empty-section">Aucune compétence renseignée.</p>}
          </div>

          {/* Portfolio */}
          {freelancer.profile?.portfolios && freelancer.profile.portfolios.length > 0 && (
            <div className="profile-section-card">
              <h2 className="profile-section-title"><FolderOpen size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Portfolio</h2>
              <div className="profile-cv-list">
                {freelancer.profile.portfolios.map(p => (
                  <div key={p.id} className="profile-cv-item">
                    <h4>{p.title}</h4>
                    {p.description && <p>{p.description}</p>}
                    {(p.githubLink || p.demoLink) && (
                      <div className="profile-cv-links">
                        {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer"><Code2 size={12}/> Repo</a>}
                        {p.demoLink && <a href={p.demoLink} target="_blank" rel="noreferrer"><ExternalLink size={12}/> Démo</a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {freelancer.profile?.experiences && freelancer.profile.experiences.length > 0 && (
            <div className="profile-section-card">
              <h2 className="profile-section-title"><Briefcase size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Expérience professionnelle</h2>
              <div className="profile-timeline">
                {freelancer.profile.experiences.map(e => (
                  <div key={e.id} className="profile-timeline-item">
                    <div className="profile-timeline-dot"></div>
                    <div className="profile-timeline-content">
                      <h4>{e.position} chez {e.company}</h4>
                      <span className="profile-cv-dates">{new Date(e.startDate).toLocaleDateString()} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : 'Aujourd\'hui'}</span>
                      {e.description && <p>{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {freelancer.profile?.educations && freelancer.profile.educations.length > 0 && (
            <div className="profile-section-card">
              <h2 className="profile-section-title"><GraduationCap size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Formation</h2>
              <div className="profile-timeline">
                {freelancer.profile.educations.map(e => (
                  <div key={e.id} className="profile-timeline-item">
                    <div className="profile-timeline-dot"></div>
                    <div className="profile-timeline-content">
                      <h4>{e.degree} {e.fieldOfStudy ? `- ${e.fieldOfStudy}` : ''}</h4>
                      <span className="profile-cv-dates">{e.school} | {new Date(e.startDate).toLocaleDateString()} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : 'Aujourd\'hui'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {freelancer.profile?.certificates && freelancer.profile.certificates.length > 0 && (
            <div className="profile-section-card">
              <h2 className="profile-section-title"><Award size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Certifications</h2>
              <div className="profile-cv-list">
                {freelancer.profile.certificates.map(c => (
                  <div key={c.id} className="profile-cv-item">
                    <h4>{c.name}</h4>
                    <span className="profile-cv-dates">{c.issuer} | Émis le {new Date(c.issueDate).toLocaleDateString()}</span>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="profile-cv-cert-link">
                        <ExternalLink size={12}/> Voir le certificat
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note et avis */}
          {freelancer.averageRating !== null && (
            <div className="profile-section-card">
              <h2 className="profile-section-title">Évaluation</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {renderStars(freelancer.averageRating)}
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                  {freelancer.averageRating.toFixed(1)}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  sur 5 — basé sur {freelancer.reviewsCount} avis
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="profile-sidebar-col">

          {/* Informations de contact */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">Informations</h2>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <div className="profile-info-icon"><Mail size={16} /></div>
                <span>{freelancer.email}</span>
              </div>

              {freelancer.profile?.phone && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><Phone size={16} /></div>
                  <span>{freelancer.profile.phone}</span>
                </div>
              )}

              {freelancer.profile?.location && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><MapPin size={16} /></div>
                  <span>{freelancer.profile.location}</span>
                </div>
              )}

              {freelancer.profile?.hourlyRate && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><DollarSign size={16} /></div>
                  <span>{hourlyRate}</span>
                </div>
              )}

              {freelancer.profile?.githubLink && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><Code2 size={16} /></div>
                  <a href={freelancer.profile.githubLink} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </div>
              )}

              {freelancer.profile?.linkedinLink && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><ExternalLink size={16} /></div>
                  <a href={freelancer.profile.linkedinLink} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </div>
              )}

              {freelancer.profile?.websiteLink && (
                <div className="profile-info-row">
                  <div className="profile-info-icon"><Globe size={16} /></div>
                  <a href={freelancer.profile.websiteLink} target="_blank" rel="noreferrer">
                    Site web
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Niveau */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">Niveau</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className={`profile-level-badge ${getLevelClass(level)}`} style={{ alignSelf: 'flex-start' }}>
                {getLevelLabel(level)}
              </span>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {level === 'EXPERT' && 'Tarif ≥ 20 000 FCFA/h — Profil senior, hautement recommandé.'}
                {level === 'INTERMEDIATE' && 'Tarif entre 10 000 et 20 000 FCFA/h — Bonne expérience opérationnelle.'}
                {level === 'JUNIOR' && 'Tarif < 10 000 FCFA/h — Profil en montée en compétences.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {showInviteModal && userId && (
        <InviteModal
          userId={userId}
          freelancer={freelancer}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};
