import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Download, CheckCircle2, XCircle, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { FreelancerProfile } from '../freelancers/freelancer-profile';
import type { FreelancerFull } from '../freelancers/freelancer-profile';
import './project-applications.css';

interface Application {
  id: number;
  bidAmount: number;
  deliveryDelay: number;
  coverLetter: string;
  status: string;
  createdAt: string;
  freelancer: FreelancerFull;
}

interface ProjectApplicationsProps {
  project: any;
  onBack: () => void;
}

export const ProjectApplications: React.FC<ProjectApplicationsProps> = ({ project, onBack }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerFull | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/client/projects/${project.id}/applications`);
        setApplications(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [project.id]);

  const handleUpdateStatus = async (appId: number, status: 'ACCEPTED' | 'REJECTED') => {
    if (status === 'ACCEPTED') {
      Swal.fire({
        title: 'Confirmation',
        text: 'Voulez-vous accepter cette candidature ? Le freelance devra d\'abord signer le contrat et définir ses conditions.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, accepter',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#16a34a',
        heightAuto: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.put(`http://localhost:3000/api/client/applications/${appId}/status`, { status });
            
            setApplications(prev => prev.map(app => 
              app.id === appId ? { ...app, status } : app
            ));

            Swal.fire({
              title: 'Candidature acceptée !',
              text: 'Le contrat a été créé. Le freelance doit d\'abord définir le pourcentage d\'acompte et le signer.',
              icon: 'success',
              timer: 3500,
              showConfirmButton: false,
              heightAuto: false,
            });
          } catch (error) {
            Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
          }
        }
      });
      return;
    }

    // Handle REJECTED logic directly
    Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir refuser cette candidature ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      heightAuto: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:3000/api/client/applications/${appId}/status`, { status });
          
          setApplications(prev => prev.map(app => 
            app.id === appId ? { ...app, status } : app
          ));

          Swal.fire({
            title: 'Succès',
            text: 'La candidature a été refusée.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            heightAuto: false,
          });
        } catch (error) {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue.',
            icon: 'error',
            heightAuto: false,
          });
        }
      }
    });
  };

  if (selectedFreelancer) {
    return (
      <FreelancerProfile 
        freelancer={selectedFreelancer} 
        onBack={() => setSelectedFreelancer(null)} 
        hideInviteButton={true}
      />
    );
  }

  if (loading) {
    return <div className="loading-container">Chargement des candidatures...</div>;
  }

  return (
    <div className="project-applications-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon-only" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Candidatures : {project.title}</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>{applications.length} candidat(s) ont postulé pour ce projet.</p>
        </div>
      </div>

      <div className="process-guide card" style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: '#3b82f6' }} />
          Le processus en 4 étapes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Accepter un profil</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Examinez les candidatures et cliquez sur "Accepter" pour le freelance de votre choix.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Signature du freelance</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Le freelance reçoit une notification, définit son acompte et signe le contrat.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Votre validation</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Vous êtes invité à signer le contrat à votre tour depuis l'onglet "Contrats".</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Démarrage</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Le projet passe "En cours", l'acompte est versé et le freelance commence sa mission.</p>
            </div>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Aucune candidature reçue pour le moment.
        </div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Évaluation</th>
                <th>Proposition</th>
                <th>Motivation & CV</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="table-applicant-info">
                      {app.freelancer.profile?.avatarUrl ? (
                        <img src={app.freelancer.profile.avatarUrl} alt="Avatar" className="table-applicant-avatar" />
                      ) : (
                        <div className="table-applicant-avatar-placeholder">
                          {app.freelancer.profile?.firstName?.[0]?.toUpperCase() || 'F'}
                        </div>
                      )}
                      <div className="table-applicant-details">
                        <h3>
                          {app.freelancer.profile?.firstName} {app.freelancer.profile?.lastName}
                          {app.freelancer.profile?.idVerificationStatus === 'APPROVED' && (
                            <span title="Profil certifié" style={{ display: 'flex' }}>
                              <CheckCircle2 size={14} color="#3b82f6" />
                            </span>
                          )}
                        </h3>
                        <p>{app.freelancer.profile?.title || 'Freelance'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="stat-badge" style={{ display: 'inline-block', width: 'max-content' }}>
                        ⭐ {app.freelancer.averageRating ? app.freelancer.averageRating.toFixed(1) : 'N/A'} ({app.freelancer.reviewsCount})
                      </span>
                      <span className="stat-badge" style={{ display: 'inline-block', width: 'max-content' }}>
                        💼 {app.freelancer.completedMissions} missions
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="table-offer-value">{Number(app.bidAmount).toLocaleString()} XOF</span>
                    <span className="table-offer-delay">{app.deliveryDelay} jours</span>
                  </td>
                  <td>
                    <p className="table-cover-letter" title={app.coverLetter}>{app.coverLetter}</p>
                    <div style={{ marginTop: '8px' }}>
                      {app.freelancer.profile?.cvUrl ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => {
                            if (app.freelancer.profile?.cvUrl) {
                              window.open(app.freelancer.profile.cvUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <Download size={12} style={{ marginRight: '4px' }} />
                          Voir CV
                        </button>
                      ) : (
                        <span className="no-cv-text">Aucun CV</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="applications-table-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedFreelancer(app.freelancer)}
                      >
                        <User size={14} style={{ marginRight: '6px' }} />
                        Profil
                      </button>
                      
                      {app.status === 'PENDING' ? (
                        <>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                          >
                            <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                            Accepter
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          >
                            <XCircle size={14} style={{ marginRight: '6px' }} />
                            Refuser
                          </button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <span className={`status-badge ${app.status === 'ACCEPTED' ? 'status-completed' : 'status-cancelled'}`}>
                            {app.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                          </span>
                          {app.status === 'ACCEPTED' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/client/projects/${project.id}/applications/${app.id}/sign`)}
                              style={{ width: '100%' }}
                            >
                              <FileText size={14} style={{ marginRight: '6px' }} />
                              Voir le contrat
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
