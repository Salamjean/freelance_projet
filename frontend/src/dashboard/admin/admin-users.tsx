import React, { useEffect, useState } from 'react';
import { Users, Search, MoreVertical, Ban, CheckCircle, Mail, Eye, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  isSuspended: boolean;
  suspendedUntil?: string | null;
  profile?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    phone?: string | null;
  };
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchString = `${user.email} ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewProfile = (user: User) => {
    Swal.fire({
      title: 'Profil Utilisateur',
      html: `
        <div style="text-align: left;">
          <p><strong>Nom :</strong> ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}</p>
          <p><strong>Email :</strong> ${user.email}</p>
          <p><strong>Téléphone :</strong> ${user.profile?.phone || 'Non renseigné'}</p>
          <p><strong>Rôle :</strong> ${user.role}</p>
          <p><strong>Inscrit le :</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      `,
      icon: 'info'
    });
    setActiveDropdown(null);
  };

  const handleSendMessage = (user: User) => {
    Swal.fire({
      title: `Envoyer un message`,
      text: `À: ${user.profile?.firstName || user.email}`,
      input: 'textarea',
      inputPlaceholder: 'Tapez votre message ici...',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2563eb'
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const adminId = parseInt(localStorage.getItem('userId') || '0', 10);
          await axios.post(`http://localhost:3000/api/admin/users/${user.id}/message`, {
            adminId,
            content: result.value
          });
          Swal.fire('Envoyé', 'Le message a été envoyé avec succès.', 'success');
        } catch (err) {
          Swal.fire('Erreur', "Impossible d'envoyer le message.", 'error');
        }
      }
    });
    setActiveDropdown(null);
  };

  const handleSuspend = (user: User) => {
    setActiveDropdown(null);
    if (user.isSuspended) {
      Swal.fire({
        title: 'Lever la suspension ?',
        text: "L'utilisateur pourra à nouveau se connecter.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Oui, débloquer',
        cancelButtonText: 'Annuler'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.post(`http://localhost:3000/api/admin/users/${user.id}/unsuspend`);
            Swal.fire('Débloqué', "L'utilisateur a été débloqué avec succès.", 'success');
            fetchUsers();
          } catch (err) {
            Swal.fire('Erreur', 'Impossible de lever la suspension.', 'error');
          }
        }
      });
    } else {
      Swal.fire({
        title: "Suspendre l'utilisateur",
        html: `
          <div style="text-align: left; margin-top: 10px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Durée de suspension</label>
            <select id="suspension-duration" class="swal2-select" style="display: flex; width: 100%; margin: 0; padding: 10px;">
              <option value="1">1 jour</option>
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="permanent">Définitive (Permanent)</option>
            </select>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Suspendre',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const select = document.getElementById('suspension-duration') as HTMLSelectElement;
          return select.value;
        }
      }).then(async (result) => {
        if (result.isConfirmed && result.value) {
          const duration = result.value === 'permanent' ? null : parseInt(result.value, 10);
          try {
            await axios.post(`http://localhost:3000/api/admin/users/${user.id}/suspend`, {
              durationInDays: duration
            });
            Swal.fire('Suspendu', "L'utilisateur a été suspendu avec succès.", 'success');
            fetchUsers();
          } catch (err) {
            Swal.fire('Erreur', "Impossible de suspendre l'utilisateur.", 'error');
          }
        }
      });
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="page-subtitle">Consultez et gérez les comptes inscrits sur la plateforme</p>
        </div>
      </div>

      <div className="card list-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-section-title" style={{ margin: 0 }}>Tous les Utilisateurs ({filteredUsers.length})</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#f9fafb'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Chargement des utilisateurs...</div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Utilisateur</th>
                  <th style={{ textAlign: 'center' }}>Email</th>
                  <th style={{ textAlign: 'center' }}>Rôle</th>
                  <th style={{ textAlign: 'center' }}>Date d'inscription</th>
                  <th style={{ textAlign: 'center' }}>Statut</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {user.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={20} color="#9ca3af" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#4b5563' }}>
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${user.role === 'FREELANCER' ? 'status-success' : user.role === 'ADMIN' ? 'status-pending' : ''}`} style={{ 
                        background: user.role === 'CLIENT' ? '#eff6ff' : undefined, 
                        color: user.role === 'CLIENT' ? '#2563eb' : undefined 
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {user.isSuspended ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span className="status-badge" style={{ background: '#fee2e2', color: '#ef4444' }}>Suspendu</span>
                          <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                            {user.suspendedUntil ? `Jusqu'au ${new Date(user.suspendedUntil).toLocaleDateString()}` : '(Définitif)'}
                          </span>
                        </div>
                      ) : (
                        <span className="status-badge status-success">Actif</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleSuspend(user)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Suspendre"
                        >
                          <Ban size={16} />
                        </button>
                        <div style={{ position: 'relative' }}>
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                            style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Plus d'options"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === user.id && (
                            <div style={{
                              position: 'absolute', right: '0', top: '100%', marginTop: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10, minWidth: '180px', overflow: 'hidden'
                            }}>
                              <button 
                                onClick={() => handleViewProfile(user)}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', color: '#374151', fontSize: '0.9rem', borderBottom: '1px solid #f3f4f6' }}
                              >
                                <Eye size={16} />
                                Voir le profil
                              </button>
                              <button 
                                onClick={() => handleSendMessage(user)}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', color: '#374151', fontSize: '0.9rem' }}
                              >
                                <MessageSquare size={16} />
                                Envoyer un message
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
