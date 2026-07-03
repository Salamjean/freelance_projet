import React, { useState } from 'react';
import { Send, Users, User, Briefcase } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

export const AdminMailing: React.FC = () => {
  const [targetRole, setTargetRole] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      Swal.fire('Erreur', 'Veuillez remplir le sujet et le message.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirmer l'envoi ?",
      text: "L'e-mail sera envoyé aux destinataires sélectionnés.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Oui, envoyer',
      cancelButtonText: 'Annuler',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.18:3000/api/admin/send-mail', {
        targetRole,
        subject,
        message
      });

      if (response.data.success) {
        Swal.fire('Envoyé !', `L'e-mail a été envoyé avec succès à ${response.data.count} utilisateurs.`, 'success');
        setSubject('');
        setMessage('');
      } else {
        Swal.fire('Info', response.data.message || "Aucun utilisateur n'a reçu l'e-mail.", 'info');
      }
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      Swal.fire('Erreur', "Impossible d'envoyer l'e-mail. Vérifiez la configuration SMTP.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Mailing</h1>
          <p className="page-subtitle">Envoyez des communications par e-mail aux utilisateurs de la plateforme</p>
        </div>
      </div>

      <div className="card list-card" style={{ padding: '32px' }}>
        <form onSubmit={handleSendMail}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Destinataires
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              
              <div 
                onClick={() => setTargetRole('ALL')}
                style={{ 
                  border: `2px solid ${targetRole === 'ALL' ? '#2563eb' : '#e5e7eb'}`,
                  background: targetRole === 'ALL' ? '#eff6ff' : '#fff',
                  borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' 
                }}
              >
                <Users size={24} color={targetRole === 'ALL' ? '#2563eb' : '#6b7280'} />
                <span style={{ fontWeight: 600, color: targetRole === 'ALL' ? '#1d4ed8' : '#4b5563' }}>Tous</span>
              </div>

              <div 
                onClick={() => setTargetRole('CLIENT')}
                style={{ 
                  border: `2px solid ${targetRole === 'CLIENT' ? '#2563eb' : '#e5e7eb'}`,
                  background: targetRole === 'CLIENT' ? '#eff6ff' : '#fff',
                  borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' 
                }}
              >
                <Briefcase size={24} color={targetRole === 'CLIENT' ? '#2563eb' : '#6b7280'} />
                <span style={{ fontWeight: 600, color: targetRole === 'CLIENT' ? '#1d4ed8' : '#4b5563' }}>Clients Uniquement</span>
              </div>

              <div 
                onClick={() => setTargetRole('FREELANCER')}
                style={{ 
                  border: `2px solid ${targetRole === 'FREELANCER' ? '#2563eb' : '#e5e7eb'}`,
                  background: targetRole === 'FREELANCER' ? '#eff6ff' : '#fff',
                  borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' 
                }}
              >
                <User size={24} color={targetRole === 'FREELANCER' ? '#2563eb' : '#6b7280'} />
                <span style={{ fontWeight: 600, color: targetRole === 'FREELANCER' ? '#1d4ed8' : '#4b5563' }}>Freelances Uniquement</span>
              </div>

            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="subject" style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Sujet de l'e-mail
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Saisissez le sujet..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem', background: '#f9fafb'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="message" style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Rédigez votre e-mail ici..."
              style={{
                width: '100%', minHeight: '200px', padding: '16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit', background: '#f9fafb'
              }}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Send size={18} />
              {loading ? 'Envoi en cours...' : "Envoyer l'e-mail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
