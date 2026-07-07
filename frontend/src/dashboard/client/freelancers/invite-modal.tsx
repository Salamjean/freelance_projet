import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import './invite-modal.css';

interface InviteModalProps {
  userId: number | null;
  freelancer: any;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ userId, freelancer, onClose }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/client/${userId}/dashboard`);
        // Garder uniquement les projets OPEN
        const openProjects = (res.data.projects || []).filter((p: any) => p.status === 'OPEN');
        setProjects(openProjects);
      } catch (err) {
        console.error("Erreur lors de la récupération des projets", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const freelancerName = freelancer.profile?.firstName
    ? `${freelancer.profile.firstName} ${freelancer.profile.lastName || ''}`.trim()
    : freelancer.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Veuillez sélectionner un projet.' });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:3000/api/client/${userId}/projects/${selectedProjectId}/invite/${freelancer.id}`, {
        message
      });
      Swal.fire({
        title: 'Invitation envoyée !',
        text: `${freelancerName} a bien reçu votre invitation.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de l\'invitation.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal-container" onClick={e => e.stopPropagation()}>
        <div className="invite-modal-header">
          <h2>Inviter {freelancerName}</h2>
          <button className="btn-close-modal" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="invite-modal-body">
          {loading ? (
            <p>Chargement de vos projets...</p>
          ) : projects.length === 0 ? (
            <div className="no-projects-warning">
              <p>Vous n'avez aucun projet ouvert. Vous devez créer un projet avant de pouvoir envoyer une invitation.</p>
              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>Fermer</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Projet concerné</label>
                <select 
                  className="form-control" 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez un projet...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Message d'invitation (Optionnel)</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  placeholder="Bonjour, votre profil m'intéresse beaucoup pour mon projet..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="invite-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedProjectId}>
                  {submitting ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
