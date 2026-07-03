import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, Eye, Loader } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './admin-verifications.css';

interface PendingVerification {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  idType: string;
  idRectoUrl: string;
  idVersoUrl: string;
  user: {
    email: string;
  };
}

export const AdminVerifications: React.FC = () => {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      const res = await axios.get('http://192.168.1.18:3000/api/admin/verifications');
      setVerifications(res.data);
    } catch {
      // Données de secours si le serveur ne répond pas
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (profileId: number, name: string) => {
    const confirm = await Swal.fire({
      title: 'Approuver l\'identité ?',
      text: `Voulez-vous certifier le profil de ${name} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb',
      heightAuto: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.post(`http://192.168.1.18:3000/api/admin/verifications/${profileId}/approve`);
      Swal.fire({
        title: 'Certifié !',
        text: 'Le profil du freelance a été certifié avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        heightAuto: false,
      });
      fetchVerifications();
    } catch {
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'approbation.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
    }
  };

  const handleReject = async (profileId: number, name: string) => {
    const { value: reason } = await Swal.fire({
      title: `Rejeter la demande de ${name} ?`,
      input: 'text',
      inputLabel: 'Raison du rejet',
      inputPlaceholder: 'Ex: Document non lisible, verso manquant...',
      showCancelButton: true,
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      heightAuto: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez saisir un motif de rejet !';
        }
        return null;
      }
    });

    if (!reason) return;

    try {
      await axios.post(`http://192.168.1.18:3000/api/admin/verifications/${profileId}/reject`, {
        rejectionReason: reason,
      });
      Swal.fire({
        title: 'Demande rejetée',
        text: 'La demande a été rejetée et le motif a été transmis.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        heightAuto: false,
      });
      fetchVerifications();
    } catch {
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors du rejet.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        heightAuto: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Chargement des demandes de certification...</span>
      </div>
    );
  }

  return (
    <div className="admin-verifications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Modérations des Certifications</h1>
          <p className="page-subtitle">Examinez les pièces d'identité soumises par les freelanceurs</p>
        </div>
      </div>

      {verifications.length === 0 ? (
        <div className="card no-verifications">
          <ShieldCheck size={48} className="no-verifications-icon" />
          <h3>Aucune demande en attente</h3>
          <p className="text-muted">Tous les dossiers d'identité ont été traités par nos modérateurs.</p>
        </div>
      ) : (
        <div className="verifications-grid">
          {verifications.map((item) => {
            const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.user.email;
            return (
              <div key={item.id} className="card verification-item-card">
                <div className="verification-item-header">
                  <div className="freelancer-meta-info">
                    <h4>{name}</h4>
                    <span className="email-text">{item.user.email}</span>
                    {item.title && <span className="title-text">{item.title}</span>}
                  </div>
                  <span className="doc-type-badge">{item.idType}</span>
                </div>

                <div className="verification-images-container">
                  <div className="image-preview-wrapper" onClick={() => setActiveImage(item.idRectoUrl)}>
                    <span className="image-side-label">Recto (Devant)</span>
                    <img src={item.idRectoUrl} alt="Recto" className="verification-thumb" />
                    <div className="thumb-overlay">
                      <Eye size={18} />
                    </div>
                  </div>

                  <div className="image-preview-wrapper" onClick={() => setActiveImage(item.idVersoUrl)}>
                    <span className="image-side-label">Verso (Derrière)</span>
                    <img src={item.idVersoUrl} alt="Verso" className="verification-thumb" />
                    <div className="thumb-overlay">
                      <Eye size={18} />
                    </div>
                  </div>
                </div>

                <div className="verification-actions">
                  <button 
                    className="btn-approve" 
                    onClick={() => handleApprove(item.id, name)}
                  >
                    <Check size={16} /> Approuver la pièce
                  </button>
                  <button 
                    className="btn-reject" 
                    onClick={() => handleReject(item.id, name)}
                  >
                    <X size={16} /> Rejeter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Lightbox pour afficher les images d'identité en grand */}
      {activeImage && (
        <div className="image-lightbox-overlay" onClick={() => setActiveImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setActiveImage(null)}>
              <X size={24} />
            </button>
            <img src={activeImage} alt="Pièce d'identité grand format" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};
