import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { SignaturePad } from '../../../components/SignaturePad';
import { apiUrl, getAuthHeaders } from '../../../lib/axios-config';
import '../../client/projects/sign-contract.css'; // Reuse CSS from client

export const SignContractFreelance: React.FC<{ userId: number | null }> = ({ userId }) => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [advancePercentage, setAdvancePercentage] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchContract = async () => {
      try {
        const res = await axios.get(
          apiUrl(`/freelance/${userId}/missions/${contractId}`),
          { headers: getAuthHeaders() },
        );
        setContract(res.data);
      } catch (err: unknown) {
        console.error('Erreur lors du chargement du contrat', err);
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Erreur inconnue';
        Swal.fire('Erreur', `Impossible de charger le contrat: ${errorMsg}`, 'error');
        navigate(`/freelancer/missions`);
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [userId, contractId, navigate]);

  const handleSign = async () => {
    if (!signature) {
      Swal.fire('Erreur', 'Veuillez signer le contrat.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        apiUrl(`/freelance/${userId}/missions/${contractId}/sign`),
        {
          signature: signature,
          advancePercentage: advancePercentage,
        },
        { headers: getAuthHeaders() },
      );
      
      Swal.fire({
        title: 'Félicitations !',
        text: 'Vous avez signé le contrat. La mission est maintenant En cours.',
        icon: 'success',
      }).then(() => {
        navigate(`/freelancer/missions`);
      });
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Une erreur est survenue', 'error');
      setIsSubmitting(false);
    }
  };

  const getClientName = (client: any) => {
    if (client.profile?.companyName) return client.profile.companyName;
    if (client.profile?.firstName && client.profile?.lastName) {
      return `${client.profile.firstName} ${client.profile.lastName}`;
    }
    return client.email;
  };

  if (loading) {
    return <div className="loading-container">Chargement du contrat...</div>;
  }

  if (!contract) {
    return <div className="error-container">Contrat introuvable.</div>;
  }

  return (
    <div className="sign-contract-page">
      <div className="sign-page-header">
        <button className="btn btn-secondary btn-icon-only" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Contrat de Prestation de Services</h1>
          <p className="page-subtitle">Projet : {contract.project.title}</p>
        </div>
      </div>

      <div className="contract-container">
        <div className="contract-document paper-style">
          <div className="contract-header">
            <FileText size={48} color="#2563eb" />
            <h2>CONTRAT DE PRESTATION DE SERVICES INDÉPENDANTS</h2>
          </div>

          <div className="contract-body">
            <p className="contract-date">Date de rédaction : {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</p>
            
            <section className="contract-section">
              <h3>ENTRE LES SOUSSIGNÉS :</h3>
              <p><strong>Le Client</strong> : {getClientName(contract.client)}, ci-après désigné "Le Client",</p>
              <p>D'une part,</p>
              <p><strong>ET</strong></p>
              <p><strong>Le Prestataire</strong> (Vous-même), ci-après désigné "Le Prestataire",</p>
              <p>D'autre part.</p>
              <p>Il a été convenu et arrêté ce qui suit :</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 1 : OBJET DU CONTRAT</h3>
              <p>Le Prestataire s'engage à réaliser pour le compte du Client la mission décrite ci-après :</p>
              <div className="contract-quote">
                <strong>Intitulé de la mission :</strong> {contract.project.title}<br/>
                <strong>Description :</strong> {contract.project.description}
              </div>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 2 : RÉMUNÉRATION</h3>
              <p>En contrepartie de la réalisation des prestations définies à l'Article 1, le Client s'engage à payer au Prestataire la somme forfaitaire de <strong>{Number(contract.amount).toLocaleString()} XOF</strong>.</p>
              {contract.advancePercentage > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                  <strong>Acompte exigé au démarrage :</strong> Le Prestataire a défini un acompte de <strong>{contract.advancePercentage}%</strong> (soit {(Number(contract.amount) * contract.advancePercentage / 100).toLocaleString()} XOF) qui devra être validé après signature du présent contrat.
                </div>
              )}
            </section>

            <section className="contract-section">
              <h3>ARTICLE 3 : DÉLAIS D'EXÉCUTION</h3>
              <p>Le Prestataire s'engage à livrer l'intégralité du projet dans un délai de <strong>{contract.applications?.[0]?.deliveryDelay || contract.project.duration || 0} jours</strong> à compter de la date d'entrée en vigueur de ce contrat.</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 4 : OBLIGATIONS ET CONFIDENTIALITÉ</h3>
              <p>Le Prestataire s'engage à exécuter la mission avec soin et professionnalisme. Le Prestataire s'engage à conserver une stricte confidentialité sur les informations concernant le Client auxquelles il aurait pu avoir accès dans le cadre de l'exécution du présent contrat.</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 5 : ENTRÉE EN VIGUEUR</h3>
              <p>Le présent contrat est conclu dès qu'il est revêtu de la signature des deux parties. L'acceptation de la candidature par le Client vaut proposition de contrat. Le contrat sera définitivement formé lorsque le Prestataire y aura apposé sa propre signature.</p>
            </section>

            <div className="client-signature-display">
              <h4>Signature du Client apposée</h4>
              {contract.clientSignature ? (
                <img src={contract.clientSignature} alt="Signature du client" />
              ) : (
                <p>Non disponible</p>
              )}
            </div>
          </div>
        </div>

        <div className="signature-panel">
          {contract.status === 'DRAFT' && !contract.freelancerSignature ? (
            <>
              <h3>Définir vos conditions</h3>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Pourcentage d'acompte au démarrage (%)</label>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  Ce montant vous sera payé au début de la mission. Saisissez 0 si vous ne souhaitez pas d'acompte.
                </p>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={advancePercentage}
                  onChange={(e) => setAdvancePercentage(Number(e.target.value))}
                  className="form-control"
                  style={{ maxWidth: '200px' }}
                />
                {advancePercentage > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
                    Montant de l'acompte : {((Number(contract.amount) * advancePercentage) / 100).toLocaleString('fr-FR')} XOF
                  </div>
                )}
              </div>

              <h3>Signature du Prestataire</h3>
              <p>Pour valider vos conditions et proposer ce contrat au client, veuillez dessiner votre signature ci-dessous :</p>
              
              <div className="signature-pad-box">
                <SignaturePad onSignatureChange={(val) => setSignature(val)} />
              </div>

              <div className="signature-action-area">
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={handleSign}
                  disabled={!signature || isSubmitting}
                >
                  <CheckCircle size={20} style={{ marginRight: '8px' }} />
                  {isSubmitting ? 'Validation...' : 'Signer le contrat'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {contract.status === 'DRAFT' ? (
                  <>
                    <CheckCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ color: '#f59e0b' }}>En attente du Client</h3>
                    <p>Vous avez défini vos conditions et signé ce contrat. En attente de la validation et signature finale du client.</p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ color: '#10b981' }}>Contrat Signé</h3>
                    <p>Ce contrat a été approuvé et signé par les deux parties. La mission est officielle.</p>
                  </>
                )}
              </div>
              
              {contract.clientSignature && (
                <div className="client-signature-display" style={{ marginTop: '0', borderColor: '#2563eb', backgroundColor: '#eff6ff', marginBottom: '16px' }}>
                  <h4 style={{ color: '#1e3a8a' }}>Signature du Client</h4>
                  <img src={contract.clientSignature} alt="Signature du client" />
                </div>
              )}

              <div className="client-signature-display" style={{ marginTop: '0', borderColor: '#10b981', backgroundColor: '#ecfdf5' }}>
                <h4 style={{ color: '#065f46' }}>Votre Signature</h4>
                {contract.freelancerSignature ? (
                  <img src={contract.freelancerSignature} alt="Votre signature" />
                ) : (
                  <p>Signature non disponible</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
