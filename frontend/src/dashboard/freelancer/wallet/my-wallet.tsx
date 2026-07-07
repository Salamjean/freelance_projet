import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, History, CreditCard, Banknote } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './my-wallet.css';

interface Transaction {
  id: number;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'COMMISSION';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: string;
}

interface WalletData {
  id: number;
  balance: string;
  transactions: Transaction[];
}

interface MyWalletProps {
  userId: number | null;
}

export const MyWallet: React.FC<MyWalletProps> = ({ userId }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!userId) return;
        const res = await axios.get(`http://localhost:3000/api/freelance/${userId}/wallet`);
        setWallet(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du portefeuille', err);
        Swal.fire('Erreur', 'Impossible de charger votre portefeuille.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [userId]);

  const handleWithdraw = () => {
    Swal.fire({
      icon: 'info',
      title: 'Fonctionnalité à venir',
      text: 'Le système de retrait vers Mobile Money et compte bancaire est en cours de développement.',
      confirmButtonColor: '#2563eb'
    });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  if (!wallet) return <div style={{ padding: '2rem', textAlign: 'center' }}>Portefeuille introuvable.</div>;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'PAYMENT':
      case 'REFUND':
        return <ArrowDownLeft size={24} />;
      case 'WITHDRAWAL':
      case 'COMMISSION':
        return <ArrowUpRight size={24} />;
      default:
        return <Banknote size={24} />;
    }
  };

  const isPositive = (type: string) => {
    return ['DEPOSIT', 'PAYMENT', 'REFUND'].includes(type);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Terminé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      default: return '';
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div>
          <h1 className="wallet-title">Mon Portefeuille</h1>
          <p className="wallet-subtitle">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
        </div>
      </div>

      <div className="wallet-card">
        <div>
          <div className="wallet-balance-label">Solde disponible</div>
          <div className="wallet-balance-amount">
            {Number(wallet.balance).toLocaleString('fr-FR')} <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>XOF</span>
          </div>
        </div>
        <button className="btn-withdraw" onClick={handleWithdraw}>
          <CreditCard size={18} /> Demander un retrait
        </button>
      </div>

      <div className="transactions-section">
        <h2>Historique des transactions</h2>
        
        <div className="transactions-list">
          {wallet.transactions.length === 0 ? (
            <div className="empty-transactions">
              <History size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Aucune transaction pour le moment.</p>
            </div>
          ) : (
            wallet.transactions.map((tx) => {
              const positive = isPositive(tx.type);
              
              return (
                <div key={tx.id} className="transaction-item">
                  <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="tx-info">
                    <div className="tx-title">{tx.description || tx.type}</div>
                    <div className="tx-date">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="tx-amount">
                    <div className={`tx-value ${positive ? 'positive' : 'negative'}`}>
                      {positive ? '+' : '-'}{Number(tx.amount).toLocaleString('fr-FR')} XOF
                    </div>
                    <div className={`tx-status ${getStatusClass(tx.status)}`}>
                      {getStatusLabel(tx.status)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
