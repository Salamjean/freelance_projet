import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { SignaturePad } from '../../../components/SignaturePad';
import { apiUrl, getAuthHeaders } from '../../../lib/axios-config';
import './sign-contract.css';

export const SignContractClient: React.FC = () => {
  const { projectId, appId } = useParams<{ projectId: string; appId: string }>();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await axios.get(
          apiUrl(`/client/applications/${appId}`),
          { headers: getAuthHeaders() },
        );
        setApplication(res.data);
      } catch (err: any) {
        console.error('Erreur lors du chargement de la candidature', err);
        const errorMsg = err.response?.data?.message || err.message || 'Erreur inconnue';
        Swal.fire('Erreur', `Impossible de charger le contrat: ${errorMsg}`, 'error');
        navigate(`/client/contracts`);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [appId, projectId, navigate]);

  const handleSign = async () => {
    if (!signature) {
      Swal.fire('Erreur', 'Veuillez signer le contrat.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (application.status === 'PENDING') {
        await axios.put(
          apiUrl(`/client/applications/${appId}/status`),
          {
            status: 'ACCEPTED',
            clientSignature: signature,
          },
          { headers: getAuthHeaders() },
        );
        
        Swal.fire({
          title: 'Félicitations !',
          text: 'Vous avez signé le contrat. La candidature est acceptée et le contrat a été envoyé au freelance.',
          icon: 'success',
        }).then(() => {
          navigate(`/client/projects`);
        });
      } else if (application.status === 'ACCEPTED' && application.contract?.status === 'DRAFT') {
        const userId = application.project.clientId;
        await axios.put(
          apiUrl(`/client/${userId}/contracts/${application.contract.id}/sign`),
          { signature: signature },
          { headers: getAuthHeaders() },
        );

        Swal.fire({
          title: 'Contrat signé !',
          text: 'Vous avez signé le contrat. La mission commence officiellement.',
          icon: 'success',
        }).then(() => {
          navigate(`/client/contracts`);
        });
      }
    } catch (err: any) {
      Swal.fire('Erreur', err.response?.data?.message || 'Une erreur est survenue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir refuser les conditions du freelance et annuler le contrat ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Non, retour',
      confirmButtonColor: '#ef4444',
    }).then(async (result) => {
      if (result.isConfirmed && application.contract) {
        setIsSubmitting(true);
        try {
          const userId = application.project.clientId;
          await axios.put(
            apiUrl(`/client/${userId}/contracts/${application.contract.id}/cancel`),
            {},
            { headers: getAuthHeaders() },
          );
          Swal.fire('Refusé', 'Le contrat a été annulé.', 'success').then(() => {
            navigate(`/client/contracts`);
          });
        } catch (err: any) {
          Swal.fire('Erreur', err.response?.data?.message || 'Une erreur est survenue', 'error');
          setIsSubmitting(false);
        }
      }
    });
  };

  if (loading) {
    return <div className="loading-container">Chargement du contrat...</div>;
  }

  if (!application) {
    return <div className="error-container">Candidature introuvable.</div>;
  }

  return (
    <div className="sign-contract-page">
      <div className="sign-page-header">
        <button className="btn btn-secondary btn-icon-only" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Contrat de Prestation de Services</h1>
          <p className="page-subtitle">Projet : {application.project.title}</p>
        </div>
      </div>

      <div className="contract-container">
        <div className="contract-document paper-style">
          <div className="contract-header">
            <FileText size={48} color="#2563eb" />
            <h2>CONTRAT DE PRESTATION DE SERVICES INDÉPENDANTS</h2>
          </div>

          <div className="contract-body">
            <p className="contract-date">Date de rédaction : {new Date().toLocaleDateString('fr-FR')}</p>
            
            <section className="contract-section">
              <h3>ENTRE LES SOUSSIGNÉS :</h3>
              <p><strong>Le Client</strong> (Vous-même), ci-après désigné "Le Client",</p>
              <p>D'une part,</p>
              <p><strong>ET</strong></p>
              <p><strong>Le Prestataire</strong> : {application.freelancer.profile?.firstName} {application.freelancer.profile?.lastName}, ci-après désigné "Le Prestataire",</p>
              <p>D'autre part.</p>
              <p>Il a été convenu et arrêté ce qui suit :</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 1 : OBJET DU CONTRAT</h3>
              <p>Le Prestataire s'engage à réaliser pour le compte du Client la mission décrite ci-après :</p>
              <div className="contract-quote">
                <strong>Intitulé de la mission :</strong> {application.project.title}<br/>
                <strong>Description :</strong> {application.project.description}
              </div>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 2 : RÉMUNÉRATION</h3>
              <p>En contrepartie de la réalisation des prestations définies à l'Article 1, le Client s'engage à payer au Prestataire la somme forfaitaire de <strong>{Number(application.bidAmount).toLocaleString()} XOF</strong>.</p>
              {application.contract?.advancePercentage > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                  <strong>Acompte exigé au démarrage :</strong> Le Prestataire a défini un acompte de <strong>{application.contract.advancePercentage}%</strong> (soit {(Number(application.bidAmount) * application.contract.advancePercentage / 100).toLocaleString()} XOF) qui devra être validé après signature du présent contrat.
                </div>
              )}
            </section>

            <section className="contract-section">
              <h3>ARTICLE 3 : DÉLAIS D'EXÉCUTION</h3>
              <p>Le Prestataire s'engage à livrer l'intégralité du projet dans un délai de <strong>{application.deliveryDelay} jours</strong> à compter de la date d'entrée en vigueur de ce contrat.</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 4 : OBLIGATIONS ET CONFIDENTIALITÉ</h3>
              <p>Le Prestataire s'engage à exécuter la mission avec soin et professionnalisme. Le Prestataire s'engage à conserver une stricte confidentialité sur les informations concernant le Client auxquelles il aurait pu avoir accès dans le cadre de l'exécution du présent contrat.</p>
            </section>

            <section className="contract-section">
              <h3>ARTICLE 5 : ENTRÉE EN VIGUEUR</h3>
              <p>Le présent contrat est conclu dès qu'il est revêtu de la signature des deux parties. L'acceptation de la candidature par le Client vaut proposition de contrat. Le contrat sera définitivement formé lorsque le Prestataire y aura apposé sa propre signature.</p>
            </section>
          </div>
        </div>

        <div className="signature-panel">
          {application.status === 'PENDING' ? (
            <>
              <h3>Signature du Client</h3>
              <p>Pour valider cette proposition de contrat et accepter la candidature du freelance, veuillez dessiner votre signature ci-dessous :</p>
              
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
                  {isSubmitting ? 'Validation...' : 'Signer et Accepter le Freelance'}
                </button>
              </div>
            </>
          ) : application.status === 'ACCEPTED' && application.contract?.status === 'DRAFT' && application.contract?.freelancerSignature && !application.contract?.clientSignature ? (
            <>
              <h3>Signature Finale du Client</h3>
              <p>Le freelance a signé le contrat. Veuillez le signer à votre tour pour démarrer officiellement la mission :</p>
              
              <div className="client-signature-display" style={{ marginTop: '0', borderColor: '#10b981', backgroundColor: '#ecfdf5', marginBottom: '24px' }}>
                <h4 style={{ color: '#065f46' }}>Signature du Freelance</h4>
                <img src={application.contract.freelancerSignature} alt="Signature du freelance" />
              </div>

              <div className="signature-pad-box">
                <SignaturePad onSignatureChange={(val) => setSignature(val)} />
              </div>

              <div className="signature-action-area" style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={handleSign}
                  disabled={!signature || isSubmitting}
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={20} style={{ marginRight: '8px' }} />
                  {isSubmitting ? 'Signature en cours...' : 'Signer le contrat'}
                </button>
                <button 
                  className="btn btn-secondary btn-large" 
                  onClick={handleReject}
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626', flex: 1 }}
                >
                  Refuser et Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {application.contract?.clientSignature && application.contract?.freelancerSignature ? (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ color: '#10b981' }}>Contrat Signé</h3>
                    <p>Ce contrat a été signé par les deux parties et la mission est en cours.</p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ color: '#f59e0b' }}>En Attente</h3>
                    <p>En attente de la signature du freelance.</p>
                  </>
                )}
              </div>
              
              {application.contract?.clientSignature && (
                <div className="client-signature-display" style={{ marginTop: '0', borderColor: '#2563eb', backgroundColor: '#eff6ff', marginBottom: '16px' }}>
                  <h4 style={{ color: '#1e3a8a' }}>Votre Signature</h4>
                  <img src={application.contract.clientSignature} alt="Votre signature" />
                </div>
              )}

              {application.contract?.freelancerSignature && (
                <div className="client-signature-display" style={{ marginTop: '0', borderColor: '#10b981', backgroundColor: '#ecfdf5' }}>
                  <h4 style={{ color: '#065f46' }}>Signature du Freelance</h4>
                  <img src={application.contract.freelancerSignature} alt="Signature du freelance" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
