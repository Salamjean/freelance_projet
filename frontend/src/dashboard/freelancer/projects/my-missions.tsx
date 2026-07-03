import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  DollarSign,
  Clock,
  FileText,
  User,
  AlertTriangle,
  PenTool,
  PackageCheck,
  MessageSquare,
  Eye,
  Search,
  ArrowUpDown,
  Target,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import "./my-missions.css";

interface Project {
  id: number;
  title: string;
  description: string;
  category?: { name: string };
}

interface ClientProfile {
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
}

interface Client {
  email: string;
  profile: ClientProfile | null;
}

interface Mission {
  id: number;
  projectId: number;
  project: Project;
  clientId: number;
  client: Client;
  freelancerId: number;
  amount: number | string;
  status: string;
  clientSignature: string | null;
  freelancerSignature: string | null;
  advancePercentage?: number;
  advanceStatus?: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
}

interface MyMissionsProps {
  userId: number | null;
}

export const MyMissions: React.FC<MyMissionsProps> = ({ userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("recent");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const fetchMissions = async () => {
      try {
        const res = await axios.get(
          `http://192.168.1.18:3000/api/freelance/${userId}/missions`,
        );
        const activeMissions = res.data.filter(
          (m: Mission) => m.status !== "VALIDATED" && m.status !== "COMPLETED",
        );
        setMissions(activeMissions);
      } catch (err) {
        console.error("Erreur lors du chargement des missions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, [userId]);

  const updateStatus = async (
    missionId: number,
    status: "DELIVERED" | "DISPUTE",
  ) => {
    const labels: Record<string, string> = {
      DELIVERED: "Marquer comme livré",
      DISPUTE: "Signaler un litige",
    };
    const confirms: Record<string, string> = {
      DELIVERED: "Confirmez-vous que vous avez livré les livrables au client ?",
      DISPUTE: "Confirmez-vous vouloir signaler un litige sur cette mission ?",
    };
    const icons: any = { DELIVERED: "question", DISPUTE: "warning" };

    const result = await Swal.fire({
      title: labels[status],
      text: confirms[status],
      icon: icons[status],
      showCancelButton: true,
      confirmButtonText: "Confirmer",
      cancelButtonText: "Annuler",
      confirmButtonColor: status === "DELIVERED" ? "#16a34a" : "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `http://192.168.1.18:3000/api/freelance/${userId}/missions/${missionId}/status`,
        { status },
      );
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, status: res.data.status } : m,
        ),
      );
      Swal.fire({
        icon: "success",
        title:
          status === "DELIVERED"
            ? "Mission marquée comme livrée !"
            : "Litige signalé !",
        text:
          status === "DELIVERED"
            ? "Le client a été notifié de votre livraison."
            : "Notre équipe va examiner le litige.",
      });
    } catch (err: any) {
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Impossible de mettre à jour la mission",
        "error",
      );
    }
  };

  const claimAdvance = async (missionId: number) => {
    try {
      const res = await axios.put(
        `http://192.168.1.18:3000/api/freelance/${userId}/missions/${missionId}/advance/claim`,
      );
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? { ...m, advanceStatus: res.data.advanceStatus }
            : m,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Acompte réclamé !",
        text: "Le client a été notifié et doit valider le paiement de votre acompte.",
      });
    } catch (err: any) {
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Impossible de réclamer l'acompte",
        "error",
      );
    }
  };

  const handleMessage = async (clientId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://192.168.1.18:3000/api/chat/initiate",
        { targetUserId: clientId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/freelancer/chat");
    } catch (err: any) {
      console.error("Erreur initiation chat", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Impossible de démarrer la conversation";
      Swal.fire("Erreur", errorMsg, "error");
    }
  };

  const statusLabels: Record<string, string> = {
    ALL: "Tous",
    DRAFT: "A signer",
    WAITING_FOR_ADVANCE: "Attente acompte",
    IN_PROGRESS: "En cours",
    DELIVERED: "Livre",
    DISPUTE: "Litige",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING_FOR_ADVANCE":
        return (
          <span
            className="status-badge"
            style={{ backgroundColor: "#fed7aa", color: "#c2410c" }}
          >
            <Clock size={12} /> Attente acompte
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="status-badge status-in-progress">
            <Clock size={12} /> En cours
          </span>
        );
      case "DELIVERED":
        return (
          <span className="status-badge status-delivered">
            <CheckCircle2 size={12} /> Livré
          </span>
        );
      case "COMPLETED":
      case "VALIDATED":
        return (
          <span className="status-badge status-completed">
            <CheckCircle2 size={12} /> Terminé
          </span>
        );
      case "CANCELLED":
        return <span className="status-badge status-cancelled">Annulé</span>;
      case "DISPUTE":
        return (
          <span className="status-badge status-dispute">
            <AlertTriangle size={12} /> En litige
          </span>
        );
      case "DRAFT":
        return (
          <span
            className="status-badge"
            style={{ backgroundColor: "#fef08a", color: "#854d0e" }}
          >
            <PenTool size={12} /> À signer
          </span>
        );
      default:
        return <span className="status-badge status-draft">Brouillon</span>;
    }
  };

  const getClientName = (client: Client) => {
    if (client.profile?.companyName) return client.profile.companyName;
    if (client.profile?.firstName && client.profile?.lastName) {
      return `${client.profile.firstName} ${client.profile.lastName}`;
    }
    return client.email;
  };

  const getStatusToneClass = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
      case "WAITING_FOR_ADVANCE":
        return "tone-warning";
      case "DELIVERED":
        return "tone-info";
      case "DISPUTE":
        return "tone-danger";
      case "DRAFT":
        return "tone-neutral";
      default:
        return "tone-success";
    }
  };

  const filteredMissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = missions.filter((mission) => {
      const matchesStatus =
        statusFilter === "ALL" || mission.status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;

      const bucket = [
        mission.project.title,
        mission.project.description,
        mission.project.category?.name || "",
        getClientName(mission.client),
        statusLabels[mission.status] || mission.status,
      ]
        .join(" ")
        .toLowerCase();

      return bucket.includes(term);
    });

    return filtered.sort((a, b) => {
      if (sortBy === "amount-desc") {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === "amount-asc") {
        return Number(a.amount) - Number(b.amount);
      }
      if (sortBy === "title") {
        return a.project.title.localeCompare(b.project.title, "fr");
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [missions, searchTerm, sortBy, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredMissions.length,
      inProgress: filteredMissions.filter((m) =>
        ["IN_PROGRESS", "WAITING_FOR_ADVANCE"].includes(m.status),
      ).length,
      delivered: filteredMissions.filter((m) => m.status === "DELIVERED")
        .length,
      totalAmount: filteredMissions.reduce(
        (sum, mission) => sum + Number(mission.amount),
        0,
      ),
    };
  }, [filteredMissions]);

  if (loading) {
    return (
      <div className="missions-loading">
        <div className="spinner"></div>
        <p>Chargement de vos missions...</p>
      </div>
    );
  }

  return (
    <div className="my-missions-page my-missions-redesign">
      <section className="missions-hero">
        <div className="missions-hero-content">
          <p className="missions-eyebrow">
            <Sparkles size={14} /> Tableau freelance
          </p>
          <h1>Mes missions</h1>
          <p className="missions-subtitle">
            Refonte des cartes avec une vue claire, actionnable et searchable de
            vos contrats actifs.
          </p>
        </div>

        <div className="missions-kpis">
          <article className="kpi-card">
            <span className="kpi-label">Missions visibles</span>
            <strong>{stats.total}</strong>
          </article>
          <article className="kpi-card">
            <span className="kpi-label">En execution</span>
            <strong>{stats.inProgress}</strong>
          </article>
          <article className="kpi-card">
            <span className="kpi-label">Livrees</span>
            <strong>{stats.delivered}</strong>
          </article>
          <article className="kpi-card">
            <span className="kpi-label">Montant total</span>
            <strong>{stats.totalAmount.toLocaleString("fr-FR")} XOF</strong>
          </article>
        </div>
      </section>

      {missions.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} className="empty-icon" />
          <h3>Aucune mission pour le moment</h3>
          <p>
            Vous n'avez pas encore de contrat actif. Continuez a postuler pour
            decrocher des projets.
          </p>
        </div>
      ) : (
        <>
          <section className="missions-toolbar">
            <div className="toolbar-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Rechercher: titre, client, categorie, statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="toolbar-controls">
              <div className="toolbar-select-wrap">
                <Target size={15} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="toolbar-select-wrap">
                <ArrowUpDown size={15} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Plus recentes</option>
                  <option value="amount-desc">Montant decroissant</option>
                  <option value="amount-asc">Montant croissant</option>
                  <option value="title">Titre A-Z</option>
                </select>
              </div>
            </div>
          </section>

          {filteredMissions.length === 0 ? (
            <div className="empty-state compact-empty">
              <Search size={42} className="empty-icon" />
              <h3>Aucun resultat</h3>
              <p>
                Aucune mission ne correspond a votre recherche. Essayez un autre
                mot-cle ou filtre.
              </p>
            </div>
          ) : (
            <div className="missions-grid">
              {filteredMissions.map((mission) => (
                <div key={mission.id} className="mission-card modern-card">
                  <div
                    className={`mission-color-strip ${getStatusToneClass(mission.status)}`}
                  />

                  <div className="mission-card-header">
                    <div className="mission-title-area">
                      <h3>{mission.project.title}</h3>
                      {mission.project.category && (
                        <span className="mission-category">
                          {mission.project.category.name}
                        </span>
                      )}
                    </div>

                    <div className="mission-header-actions">
                      {getStatusBadge(mission.status)}
                      {[
                        "IN_PROGRESS",
                        "WAITING_FOR_ADVANCE",
                        "DELIVERED",
                      ].includes(mission.status) && (
                        <button
                          className="action-btn action-btn-danger"
                          onClick={() => updateStatus(mission.id, "DISPUTE")}
                        >
                          <AlertTriangle size={12} /> Litige
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mission-card-body">
                    <div className="mission-details">
                      <div className="detail-item">
                        <User size={16} />
                        <span>
                          <strong>Client:</strong>{" "}
                          {getClientName(mission.client)}
                        </span>
                      </div>

                      <div className="detail-item amount-block">
                        <DollarSign size={16} />
                        <div>
                          <div>
                            <strong>Montant:</strong>{" "}
                            {Number(mission.amount).toLocaleString("fr-FR")} XOF
                          </div>
                          {(mission.advancePercentage || 0) > 0 && (
                            <div
                              className={`advance-line ${mission.advanceStatus === "PAID" ? "advance-paid" : "advance-pending"}`}
                            >
                              Acompte ({mission.advancePercentage}%):{" "}
                              {(
                                (Number(mission.amount) *
                                  mission.advancePercentage!) /
                                100
                              ).toLocaleString("fr-FR")}{" "}
                              XOF
                              {mission.advanceStatus === "PAID"
                                ? " - Paye"
                                : " - En attente"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>
                          <strong>Cree le:</strong>{" "}
                          {new Date(mission.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      className="contract-view-link"
                      onClick={() =>
                        navigate(`/freelancer/missions/${mission.id}/sign`)
                      }
                    >
                      <FileText size={15} />
                      <span>Voir le contrat</span>
                    </button>
                  </div>

                  <div className="mission-card-footer">
                    <div className="contract-icon-actions">
                      {mission.status === "DRAFT" &&
                        !mission.freelancerSignature && (
                          <button
                            className="action-btn action-btn-validate"
                            onClick={() =>
                              navigate(
                                `/freelancer/missions/${mission.id}/sign`,
                              )
                            }
                          >
                            <PenTool size={13} /> Signer
                          </button>
                        )}

                      {["IN_PROGRESS", "WAITING_FOR_ADVANCE"].includes(
                        mission.status,
                      ) &&
                        (mission.advancePercentage || 0) > 0 &&
                        mission.advanceStatus === "PENDING" && (
                          <button
                            className="action-btn action-btn-advance"
                            onClick={() => claimAdvance(mission.id)}
                          >
                            <DollarSign size={13} /> Acompte
                          </button>
                        )}

                      {["IN_PROGRESS", "WAITING_FOR_ADVANCE"].includes(
                        mission.status,
                      ) && (
                        <button
                          className="action-btn action-btn-validate"
                          onClick={() => updateStatus(mission.id, "DELIVERED")}
                        >
                          <PackageCheck size={13} /> Livrer
                        </button>
                      )}

                      <button
                        className="action-btn action-btn-default"
                        onClick={() =>
                          navigate(`/freelancer/projects/${mission.projectId}`)
                        }
                      >
                        <Eye size={13} /> Projet
                      </button>

                      <button
                        className="action-btn action-btn-default"
                        onClick={() => handleMessage(mission.clientId)}
                      >
                        <MessageSquare size={13} /> Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
