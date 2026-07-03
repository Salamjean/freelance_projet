import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const AdminDisputes: React.FC = () => {
  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Litiges</h1>
          <p className="page-subtitle">Modérez les conflits entre clients et freelances</p>
        </div>
      </div>
      <div className="card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
        <AlertTriangle size={48} color="#9ca3af" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '8px' }}>Page en construction</h2>
        <p style={{ color: '#6b7280' }}>Cette fonctionnalité sera bientôt disponible.</p>
      </div>
    </div>
  );
};
