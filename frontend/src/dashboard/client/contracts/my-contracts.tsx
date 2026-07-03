import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, User, DollarSign, Calendar, CheckCircle, AlertTriangle, Clock, PackageCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './my-contracts.css';

interface Contract {
  id: number;
  projectId: number;
  freelancerId: number;
  amount: string;
  status: string;
  createdAt: string;
  applicationId?: number;
  project: {
    title: string;
    description: string;
  };
  freelancer: {
    profile?: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  advancePercentage?: number;
  advanceStatus?: string;
}

export const MyContracts: React.FC<{ userId: number | null }> = ({ userId }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Modal de notation ──
  const [ratingModal, setRatingModal] = useState<{ open: boolean; contractId: number | null }>({ open: false, contractId: null });
  const [ratings, setRatings] = useState({ ratingQuality: 0, ratingCommunication: 0, ratingDeadline: 0, ratingProfessionalism: 0 });
  const [hovered, setHovered] = useState({ ratingQuality: 0, ratingCommunication: 0, ratingDeadline: 0, ratingProfessionalism: 0 });
  const [comment, setComment] = useState('');

  const StarRow = ({ field, label }: { field: keyof typeof ratings; label: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', minWidth: '160px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings(r => ({ ...r, [field]: star }))}
            onMouseEnter={() => setHovered(h => ({ ...h, [field]: star }))}
            onMouseLeave={() => setHovered(h => ({ ...h, [field]: 0 }))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              fontSize: '24px', lineHeight: 1,
              color: star <= (hovered[field] || ratings[field]) ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.1s, transform 0.1s',
              transform: star <= (hovered[field] || ratings[field]) ? 'scale(1.15)' : 'scale(1)',
            }}
          >★</button>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`http://192.168.1.18:3000/api/client/${userId}/contracts`);
        const activeContracts = res.data.filter((c: Contract) => c.status !== 'VALIDATED' && c.status !== 'COMPLETED');
        setContracts(activeContracts);
      } catch (err) {
        console.error("Erreur lors de la récupération des contrats", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContracts();
    }
  }, [userId]);

  const getFreelancerName = (freelancer: Contract['freelancer']) => {
    if (freelancer.profile?.firstName || freelancer.profile?.lastName) {
      return `${freelancer.profile.firstName || ''} ${freelancer.profile.lastName || ''}`.trim();
    }
    return freelancer.email;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_ADVANCE':
        return <span className="status-badge" style={{ backgroundColor: '#fed7aa', color: '#c2410c' }}><Clock size={12} /> Attente acompte</span>;
      case 'DRAFT':
        return <span className="status-badge status-draft">À signer</span>;
      case 'IN_PROGRESS':
        return <span className="status-badge status-in-progress"><Clock size={12} /> En Cours</span>;
      case 'DELIVERED':
        return <span className="status-badge status-delivered"><PackageCheck size={12} /> Livré — En attente de validation</span>;
      case 'VALIDATED':
      case 'COMPLETED':
        return <span className="status-badge status-completed"><CheckCircle size={12} /> Terminé</span>;
      case 'DISPUTE':
        return <span className="status-badge status-cancelled"><AlertTriangle size={12} /> En Litige</span>;
      case 'CANCELLED':
        return <span className="status-badge status-cancelled">Annulé</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const handleValidate = (contractId: number) => {
    setRatings({ ratingQuality: 0, ratingCommunication: 0, ratingDeadline: 0, ratingProfessionalism: 0 });
    setHovered({ ratingQuality: 0, ratingCommunication: 0, ratingDeadline: 0, ratingProfessionalism: 0 });
    setComment('');
    setRatingModal({ open: true, contractId });
  };

  const submitValidation = async () => {
    if (!ratingModal.contractId) return;
    // Si aucune étoile n'a été sélectionnée, on valide sans notation
    const hasRating = Object.values(ratings).some(v => v > 0);
    const payload = hasRating ? { ...ratings, comment } : {};
    try {
      await axios.put(`http://192.168.1.18:3000/api/client/${userId}/contracts/${ratingModal.contractId}/validate`, payload);
      setContracts(prev => prev.map(c => c.id === ratingModal.contractId ? { ...c, status: 'VALIDATED' } : c));
      setRatingModal({ open: false, contractId: null });
      Swal.fire({ icon: 'success', title: 'Livraison validée !', text: hasRating ? 'Le freelance a été noté et la mission est terminée.' : 'La mission est terminée.', timer: 2500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Une erreur est survenue.', 'error');
    }
  };

  const handleDispute = async (contractId: number) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Contester la livraison',
      input: 'textarea',
      inputLabel: 'Motif du litige',
      inputPlaceholder: 'Décrivez pourquoi vous contestez cette livraison...',
      inputAttributes: { 'aria-label': 'Motif du litige' },
      showCancelButton: true,
      confirmButtonText: 'Contester',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) return 'Veuillez indiquer un motif de contestation.';
      }
    });

    if (!isConfirmed) return;

    try {
      await axios.put(
        `http://192.168.1.18:3000/api/client/${userId}/contracts/${contractId}/dispute`,
        { reason }
      );
      setContracts(prev =>
        prev.map(c => c.id === contractId ? { ...c, status: 'IN_PROGRESS' } : c)
      );
      Swal.fire({
        icon: 'warning',
        title: 'Litige signalé',
        text: 'Le freelance a été notifié. La mission repasse en cours le temps de résoudre le litige.',
        timer: 2500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Une erreur est survenue.', 'error');
    }
  };

  const handleValidateAdvance = async (contractId: number) => {
    const result = await Swal.fire({
      title: 'Valider l\'acompte ?',
      text: 'Le montant de l\'acompte sera crédité sur le portefeuille du freelance.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16a34a',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`http://192.168.1.18:3000/api/client/${userId}/contracts/${contractId}/advance/validate`);
      setContracts(prev =>
        prev.map(c => c.id === contractId ? { ...c, advanceStatus: 'PAID' } : c)
      );
      Swal.fire('Succès', 'Acompte validé et payé au freelance.', 'success');
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Erreur lors de la validation.', 'error');
    }
  };

  const handleCancelContract = async (contractId: number) => {
    const result = await Swal.fire({
      title: 'Annuler le contrat ?',
      text: 'Le contrat sera annulé et le freelance notifié.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Retour',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`http://192.168.1.18:3000/api/client/${userId}/contracts/${contractId}/cancel`);
      setContracts(prev => prev.filter(c => c.id !== contractId));
      Swal.fire('Annulé', 'Le contrat a été annulé avec succès.', 'success');
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Erreur lors de l\'annulation.', 'error');
    }
  };

  const handleMessage = async (freelancerId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        'http://192.168.1.18:3000/api/chat/initiate',
        { targetUserId: freelancerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/client/chat');
    } catch (err: any) {
      console.error('Erreur initiation chat', err);
      const errorMsg = err.response?.data?.message || err.message || 'Impossible de démarrer la conversation';
      Swal.fire('Erreur', errorMsg, 'error');
    }
  };

  if (loading) {
    return <div className="loading-container">Chargement de vos contrats...</div>;
  }

  return (
    <div className="my-contracts-page">

      {/* ── Modal de notation avec étoiles ── */}
      {ratingModal.open && (
        <div className="rating-modal-overlay" onClick={() => setRatingModal({ open: false, contractId: null })}>
          <div className="rating-modal" onClick={e => e.stopPropagation()}>
            <div className="rating-modal-header">
              <h3>⭐ Valider &amp; Noter le freelance</h3>
              <button className="rating-modal-close" onClick={() => setRatingModal({ open: false, contractId: null })}>×</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Votre avis aide la communauté. Donnez une note sur 5 étoiles.</p>

            <div className="rating-modal-body">
              <StarRow field="ratingQuality" label="Qualité du travail" />
              <StarRow field="ratingCommunication" label="Communication" />
              <StarRow field="ratingDeadline" label="Respect des délais" />
              <StarRow field="ratingProfessionalism" label="Professionnalisme" />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Laissez un commentaire sur cette collaboration..."
                style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', minHeight: '80px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="action-btn action-btn-default"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                onClick={() => setRatingModal({ open: false, contractId: null })}
              >
                Annuler
              </button>
              <button
                className="action-btn action-btn-validate"
                style={{ flex: 2, justifyContent: 'center', padding: '10px' }}
                onClick={submitValidation}
              >
                <CheckCircle size={15} /> Valider la livraison
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Mes Contrats</h1>
        <p className="page-subtitle">Gérez vos contrats et le suivi des prestataires</p>
      </div>

      {contracts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} color="#cbd5e1" />
          <h3>Aucun contrat</h3>
          <p>Vous n'avez pas encore de contrats générés.</p>
        </div>
      ) : (
        <div className="contracts-grid">
          {contracts.map(contract => (
            <div className="contract-card" key={contract.id}>
              <div className="contract-card-header">
                <h3>{contract.project.title}</h3>
                {getStatusBadge(contract.status)}
              </div>

              <div className="contract-card-body">
                <div className="contract-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span><strong>Freelance:</strong> {getFreelancerName(contract.freelancer)}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span><strong>Montant:</strong> {Number(contract.amount).toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span><strong>Date:</strong> {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {/* Lien vers le contrat dans le corps de la carte */}
                <button
                  className="contract-view-link"
                  onClick={() => {
                    if (contract.applicationId) {
                      navigate(`/client/projects/${contract.projectId}/applications/${contract.applicationId}/sign`);
                    } else {
                      navigate(`/client/projects`);
                    }
                  }}
                >
                  <FileText size={15} />
                  <span>Voir le contrat</span>
                </button>
              </div>

              <div className="contract-card-footer">
                <div className="contract-icon-actions">
                  {/* Valider livraison */}
                  {contract.status === 'DELIVERED' && (
                    <button
                      className="action-btn action-btn-validate"
                      onClick={() => handleValidate(contract.id)}
                    >
                      <CheckCircle size={14} /> Valider
                    </button>
                  )}

                  {/* Contester livraison */}
                  {contract.status === 'DELIVERED' && (
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => handleDispute(contract.id)}
                    >
                      <AlertTriangle size={14} /> Contester
                    </button>
                  )}

                  {/* Valider acompte */}
                  {contract.advanceStatus === 'CLAIMED' && (
                    <button
                      className="action-btn action-btn-advance"
                      onClick={() => handleValidateAdvance(contract.id)}
                    >
                      <DollarSign size={14} /> Acompte
                    </button>
                  )}

                  {/* Annuler contrat */}
                  {contract.status === 'DRAFT' && (
                    <button
                      className="action-btn action-btn-danger"
                      onClick={() => handleCancelContract(contract.id)}
                    >
                      <AlertTriangle size={14} /> Annuler
                    </button>
                  )}

                  {/* Contacter freelance */}
                  <button
                    className="action-btn action-btn-default"
                    onClick={() => handleMessage(contract.freelancerId)}
                  >
                    <MessageSquare size={14} /> Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
