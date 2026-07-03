import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  DollarSign,
  FileText,
  Code2,
  Globe,
  ExternalLink,
  Phone,
  Save,
  Plus,
  X,
  Loader,
  AlertTriangle,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Award,
  FolderOpen,
  Calendar,
  Trash2,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import "./freelancer-profile-edit.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  skillId: number;
  name: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface PortfolioFile {
  id: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string;
  githubLink?: string;
  demoLink?: string;
  files: PortfolioFile[];
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  bio: string;
  location: string;
  phone: string;
  hourlyRate: string;
  githubLink: string;
  linkedinLink: string;
  websiteLink: string;
  skills: Skill[];
  idVerificationStatus: string;
  idType: string | null;
  idRectoUrl: string | null;
  idVersoUrl: string | null;
  idRejectionReason: string | null;
  avatarUrl: string;
  cvUrl: string;
  isSubscribed: boolean;
  experiences: Experience[];
  educations: Education[];
  certificates: Certificate[];
  portfolios: Portfolio[];
}

interface FreelancerProfileEditProps {
  userId: number | null;
  userName: string;
}

// ─── Helper : validation d'URL ──────────────────────────────────────────────

const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
};

// ─── Helper : calcul de complétude ───────────────────────────────────────────

function calcCompletion(data: ProfileData): number {
  const fields = [
    data.firstName,
    data.lastName,
    data.title,
    data.bio,
    data.location,
    data.hourlyRate,
    data.phone,
  ];
  const filledFields = fields.filter((f) => f && f.trim().length > 0).length;
  const hasSkills = data.skills && data.skills.length > 0 ? 1 : 0;
  const hasLinks =
    data.githubLink || data.linkedinLink || data.websiteLink ? 1 : 0;
  const hasAvatar = data.avatarUrl && data.avatarUrl.trim().length > 0 ? 1 : 0;
  const hasExp = data.experiences && data.experiences.length > 0 ? 1 : 0;
  const hasEdu = data.educations && data.educations.length > 0 ? 1 : 0;
  const hasCert = data.certificates && data.certificates.length > 0 ? 1 : 0;
  const hasPort = data.portfolios && data.portfolios.length > 0 ? 1 : 0;

  const total = fields.length + 7;
  return Math.round(
    ((filledFields +
      hasSkills +
      hasLinks +
      hasAvatar +
      hasExp +
      hasEdu +
      hasCert +
      hasPort) /
      total) *
      100,
  );
}

function getInitials(
  firstName: string,
  lastName: string,
  email: string,
): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
  return email[0]?.toUpperCase() || "F";
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const FreelancerProfileEdit: React.FC<FreelancerProfileEditProps> = ({
  userId,
  userName,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState<
    "general" | "cv" | "portfolio" | "verification"
  >("general");

  // États pour les formulaires de CV
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  });

  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialUrl: "",
  });

  const [showPortForm, setShowPortForm] = useState(false);
  const [portForm, setPortForm] = useState({
    title: "",
    description: "",
    githubLink: "",
    demoLink: "",
  });

  // Handlers pour les ajouts
  const handleAddExperience = async () => {
    if (!userId || !expForm.company || !expForm.position || !expForm.startDate)
      return;
    try {
      const res = await axios.post(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/experience`,
        expForm,
      );
      setProfile((p) => ({ ...p, experiences: [res.data, ...p.experiences] }));
      setShowExpForm(false);
      setExpForm({
        company: "",
        position: "",
        description: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      });
    } catch {
      Swal.fire("Erreur", "Impossible d'ajouter l'expérience", "error");
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/experience/${id}`,
      );
      setProfile((p) => ({
        ...p,
        experiences: p.experiences.filter((e) => e.id !== id),
      }));
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer", "error");
    }
  };

  const handleAddEducation = async () => {
    if (!userId || !eduForm.school || !eduForm.degree || !eduForm.startDate)
      return;
    try {
      const res = await axios.post(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/education`,
        eduForm,
      );
      setProfile((p) => ({ ...p, educations: [res.data, ...p.educations] }));
      setShowEduForm(false);
      setEduForm({
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
      });
    } catch {
      Swal.fire("Erreur", "Impossible d'ajouter la formation", "error");
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/education/${id}`,
      );
      setProfile((p) => ({
        ...p,
        educations: p.educations.filter((e) => e.id !== id),
      }));
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer", "error");
    }
  };

  const handleAddCertificate = async () => {
    if (!userId || !certForm.name || !certForm.issuer || !certForm.issueDate)
      return;
    try {
      const res = await axios.post(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/certificate`,
        certForm,
      );
      setProfile((p) => ({
        ...p,
        certificates: [res.data, ...p.certificates],
      }));
      setShowCertForm(false);
      setCertForm({
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialUrl: "",
      });
    } catch {
      Swal.fire("Erreur", "Impossible d'ajouter le certificat", "error");
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/certificate/${id}`,
      );
      setProfile((p) => ({
        ...p,
        certificates: p.certificates.filter((c) => c.id !== id),
      }));
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer", "error");
    }
  };

  const handleAddPortfolio = async () => {
    if (!userId || !portForm.title) return;
    try {
      const res = await axios.post(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/portfolio`,
        portForm,
      );
      setProfile((p) => ({ ...p, portfolios: [res.data, ...p.portfolios] }));
      setShowPortForm(false);
      setPortForm({ title: "", description: "", githubLink: "", demoLink: "" });
    } catch {
      Swal.fire("Erreur", "Impossible d'ajouter le projet", "error");
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/portfolio/${id}`,
      );
      setProfile((p) => ({
        ...p,
        portfolios: p.portfolios.filter((pItem) => pItem.id !== id),
      }));
    } catch {
      Swal.fire("Erreur", "Impossible de supprimer", "error");
    }
  };

  // États pour le formulaire de vérification d'identité
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [idType, setIdType] = useState<"CNI" | "PASSPORT" | "PERMIS">("CNI");
  const [idRecto, setIdRecto] = useState("");
  const [idVerso, setIdVerso] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "recto" | "verso",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de taille (max 5 Mo pour éviter les surcharges de base64)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "Fichier trop lourd",
        text: "La taille de l'image ne doit pas dépasser 5 Mo.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "recto") {
        setIdRecto(reader.result as string);
      } else {
        setIdVerso(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!userId || !idRecto || !idVerso) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://192.168.1.18:3000/api/auth/profile/${userId}/verify-identity`,
        {
          idType,
          idRectoUrl: idRecto,
          idVersoUrl: idVerso,
        },
      );

      Swal.fire({
        title: "Demande soumise !",
        text: "Vos documents ont bien été transmis à l'administration pour validation.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });

      setProfile((prev) => ({
        ...prev,
        idVerificationStatus: "PENDING",
        idType,
        idRectoUrl: idRecto,
        idVersoUrl: idVerso,
      }));
      setShowVerificationForm(false);
      setIdRecto("");
      setIdVerso("");
    } catch {
      Swal.fire({
        title: "Erreur",
        text: "Impossible de soumettre votre demande. Veuillez réessayer.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    bio: "",
    location: "",
    phone: "",
    hourlyRate: "",
    githubLink: "",
    linkedinLink: "",
    websiteLink: "",
    skills: [],
    idVerificationStatus: "NOT_SUBMITTED",
    idType: null,
    idRectoUrl: null,
    idVersoUrl: null,
    idRejectionReason: null,
    avatarUrl: "",
    cvUrl: "",
    isSubscribed: true,
    experiences: [],
    educations: [],
    certificates: [],
    portfolios: [],
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "Fichier trop volumineux",
        text: "La taille maximale autorisée est de 5 Mo.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({
        title: "Format invalide",
        text: "Veuillez téléverser un fichier au format PDF.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: "Fichier trop volumineux",
        text: "La taille maximale autorisée pour le CV est de 10 Mo.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile((prev) => ({
          ...prev,
          cvUrl: event.target!.result as string,
        }));
        Swal.fire({
          title: "CV chargé",
          text: "Votre CV a été chargé localement. N'oubliez pas de sauvegarder votre profil au bas de la page.",
          icon: "success",
          confirmButtonColor: "#2563eb",
          heightAuto: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleViewCv = () => {
    if (!profile.cvUrl) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${profile.cvUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
      );
    }
  };

  // ── Chargement du profil ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://192.168.1.18:3000/api/auth/profile/${userId}`,
        );
        const data = res.data;
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          title: data.title || "",
          bio: data.bio || "",
          location: data.location || "",
          phone: data.phone || "",
          hourlyRate: data.hourlyRate ? String(data.hourlyRate) : "",
          githubLink: data.githubLink || "",
          linkedinLink: data.linkedinLink || "",
          websiteLink: data.websiteLink || "",
          skills: (data.skills || []).map((s: any) => ({
            skillId: s.skillId || s.skill?.id || 0,
            name: s.skill?.name || s.name || "",
          })),
          idVerificationStatus: data.idVerificationStatus || "NOT_SUBMITTED",
          idType: data.idType || null,
          idRectoUrl: data.idRectoUrl || null,
          idVersoUrl: data.idVersoUrl || null,
          idRejectionReason: data.idRejectionReason || null,
          avatarUrl: data.avatarUrl || "",
          cvUrl: data.cvUrl || "",
          isSubscribed: data.isSubscribed ?? true,
          experiences: data.experiences || [],
          educations: data.educations || [],
          certificates: data.certificates || [],
          portfolios: data.portfolios || [],
        });
      } catch {
        // Profil vide, l'utilisateur va le remplir
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // ── Gestion du formulaire ─────────────────────────────────────────────────
  const handleChange =
    (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    const alreadyExists = profile.skills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) {
      setNewSkill("");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { skillId: Date.now(), name: trimmed }],
    }));
    setNewSkill("");
  };

  const handleRemoveSkill = (name: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== name),
    }));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userId) return;

    // Validation des URLs pour GitHub, LinkedIn, Site Web
    if (profile.githubLink && !isValidUrl(profile.githubLink)) {
      Swal.fire({
        title: "Lien GitHub invalide",
        text: "Le lien GitHub doit être une URL valide (commençant par http:// ou https://). Le texte simple n'est pas autorisé.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }
    if (profile.linkedinLink && !isValidUrl(profile.linkedinLink)) {
      Swal.fire({
        title: "Lien LinkedIn invalide",
        text: "Le lien LinkedIn doit être une URL valide (commençant par http:// ou https://). Le texte simple n'est pas autorisé.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }
    if (profile.websiteLink && !isValidUrl(profile.websiteLink)) {
      Swal.fire({
        title: "Lien Site Web/Portfolio invalide",
        text: "Le lien doit être une URL valide (commençant par http:// ou https://). Le texte simple n'est pas autorisé.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
      return;
    }

    setSaving(true);
    try {
      // Nettoyer d'éventuels espaces dans le tarif horaire
      const rawRate = profile.hourlyRate
        ? String(profile.hourlyRate).trim().replace(/\s/g, "")
        : "";
      const parsedRate = rawRate ? parseFloat(rawRate) : null;

      await axios.patch(`http://192.168.1.18:3000/api/auth/profile/${userId}`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        hourlyRate: parsedRate,
        githubLink: profile.githubLink || null,
        linkedinLink: profile.linkedinLink || null,
        websiteLink: profile.websiteLink || null,
        skillNames: profile.skills.map((s) => s.name),
        avatarUrl: profile.avatarUrl || null,
        cvUrl: profile.cvUrl || null,
      });
      Swal.fire({
        title: "Profil mis à jour !",
        text: "Vos informations professionnelles ont été sauvegardées avec succès.",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        heightAuto: false,
      });
    } catch {
      Swal.fire({
        title: "Erreur",
        text: "Impossible de sauvegarder votre profil. Veuillez réessayer.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        heightAuto: false,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Chargement ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={28} style={{ animation: "spin 1s linear infinite" }} />
        <span>Chargement de votre profil...</span>
      </div>
    );
  }

  const completion = calcCompletion(profile);
  const initials = getInitials(profile.firstName, profile.lastName, userName);

  if (showVerificationForm) {
    return (
      <div className="verification-form-container">
        <div className="verification-form-header">
          <h2>Vérification d'identité</h2>
          <p>
            Fournissez une pièce d'identité officielle pour faire certifier
            votre profil.
          </p>
        </div>

        <div className="profile-form-grid">
          <div className="form-field full-width">
            <label>Type de document d'identité</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value as any)}
            >
              <option value="CNI">Carte Nationale d'Identité (CNI)</option>
              <option value="PASSPORT">Passeport</option>
              <option value="PERMIS">Permis de conduire</option>
            </select>
          </div>

          <div className="form-field">
            <label>Image Recto (Face avant)</label>
            <div
              className="id-upload-box"
              onClick={() =>
                document.getElementById("recto-file-input")?.click()
              }
            >
              {idRecto ? (
                <>
                  <img
                    src={idRecto}
                    className="id-upload-preview"
                    alt="Recto"
                  />
                  <button
                    className="id-upload-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdRecto("");
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="id-upload-icon" />
                  <span className="id-upload-label">
                    Cliquez pour ajouter le Recto
                  </span>
                  <span className="id-upload-hint">
                    Format PNG, JPG ou JPEG (max 5 Mo)
                  </span>
                </>
              )}
              <input
                id="recto-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "recto")}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Image Verso (Face arrière)</label>
            <div
              className="id-upload-box"
              onClick={() =>
                document.getElementById("verso-file-input")?.click()
              }
            >
              {idVerso ? (
                <>
                  <img
                    src={idVerso}
                    className="id-upload-preview"
                    alt="Verso"
                  />
                  <button
                    className="id-upload-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdVerso("");
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="id-upload-icon" />
                  <span className="id-upload-label">
                    Cliquez pour ajouter le Verso
                  </span>
                  <span className="id-upload-hint">
                    Format PNG, JPG ou JPEG (max 5 Mo)
                  </span>
                </>
              )}
              <input
                id="verso-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "verso")}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <div
          className="profile-save-bar"
          style={{ marginTop: 24, padding: "20px 0", border: "none" }}
        >
          <button
            className="btn-cancel-profile"
            onClick={() => {
              setShowVerificationForm(false);
              setIdRecto("");
              setIdVerso("");
            }}
          >
            Annuler
          </button>
          <button
            className="btn-save-profile"
            onClick={handleSubmitVerification}
            disabled={submitting || !idRecto || !idVerso}
          >
            {submitting ? "Envoi..." : "Soumettre pour validation"}
          </button>
        </div>
      </div>
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="freelancer-profile-edit-page">
      {/* ── Hero ────────────────────────────────────────── */}
      <div className="profile-edit-hero">
        <div className="profile-edit-banner" />
        <div className="profile-edit-hero-body">
          <div
            className="profile-edit-avatar-wrap"
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() =>
              document.getElementById("avatar-upload-input")?.click()
            }
            title="Cliquez pour changer votre photo de profil"
          >
            <div
              className="profile-edit-avatar"
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <input
              type="file"
              id="avatar-upload-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              onClick={(e) => e.stopPropagation()}
            />
            {profile.idVerificationStatus === "APPROVED" && (
              <span
                title="Profil certifié par l'administration"
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  zIndex: 10,
                  backgroundColor: "white",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  padding: "2px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <CheckCircle2 size={16} fill="#3b82f6" color="white" />
              </span>
            )}
          </div>
          <div className="profile-edit-hero-info">
            <h2>
              {profile.firstName || profile.lastName
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : userName}
            </h2>
            <p>
              {profile.title || "Ajoutez votre titre professionnel ci-dessous"}
            </p>
          </div>
          <div
            className="profile-edit-hero-cv-section"
            style={{ alignSelf: "center", marginLeft: "auto" }}
          >
            <input
              type="file"
              id="cv-upload-input"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleCvChange}
              onClick={(e) => e.stopPropagation()}
            />
            {profile.cvUrl ? (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="btn-view-cv"
                  onClick={handleViewCv}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Voir mon CV
                </button>
                <button
                  type="button"
                  className="btn-upload-cv"
                  onClick={() =>
                    document.getElementById("cv-upload-input")?.click()
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "white",
                    color: "#4b5563",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Modifier
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-upload-cv-primary"
                onClick={() =>
                  document.getElementById("cv-upload-input")?.click()
                }
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                }}
              >
                Ajouter mon CV (PDF)
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: "0 32px 24px" }}>
          <div className="profile-completion-bar-wrap">
            <div className="profile-completion-label">
              <span>Complétude du profil</span>
              <strong>{completion}%</strong>
            </div>
            <div className="profile-completion-bar">
              <div
                className="profile-completion-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          {completion < 80 && (
            <div
              className="profile-warning-banner"
              style={{
                backgroundColor: "#fffbeb",
                border: "1.5px solid #fef3c7",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#b45309",
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                <strong>Profil invisible pour les clients :</strong> Votre
                profil est complété à {completion}%. Il doit être complété à au
                moins <strong>80%</strong> pour apparaître dans les résultats de
                recherche des recruteurs.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grille ──────────────────────────────────────── */}
      <div className="profile-tabs-nav">
        <button
          className={`profile-tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          Infos Générales
        </button>
        <button
          className={`profile-tab-btn ${activeTab === "cv" ? "active" : ""}`}
          onClick={() => setActiveTab("cv")}
        >
          Parcours Pro
        </button>
        <button
          className={`profile-tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio & Liens
        </button>
        <button
          className={`profile-tab-btn ${activeTab === "verification" ? "active" : ""}`}
          onClick={() => setActiveTab("verification")}
        >
          Vérification
        </button>
      </div>
      <div className="profile-edit-grid">
        {/* Colonne principale */}
        <div className="profile-edit-main">
          {activeTab === "general" && (
            <>
              {/* Informations personnelles */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <User size={18} />
                  </div>
                  <h3>Informations personnelles</h3>
                </div>
                <div className="profile-form-grid">
                  <div className="form-field">
                    <label>Prénom</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={handleChange("firstName")}
                      placeholder="Ex : Alpha"
                    />
                  </div>
                  <div className="form-field">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={handleChange("lastName")}
                      placeholder="Ex : Diallo"
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>Adresse E-mail (Non modifiable)</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        cursor: "not-allowed",
                        color: "#6b7280",
                      }}
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>Titre professionnel</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={handleChange("title")}
                      placeholder="Ex : Développeur Fullstack React / Node.js"
                    />
                    <span className="input-hint">
                      Ce titre apparaît sur votre profil public
                    </span>
                  </div>
                  <div className="form-field">
                    <label>
                      <MapPin
                        size={13}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={handleChange("location")}
                      placeholder="Ex : Abidjan, Côte d'Ivoire"
                    />
                  </div>
                  <div className="form-field">
                    <label>
                      <Phone
                        size={13}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={handleChange("phone")}
                      placeholder="Ex : +225 01 01 01 01 01"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "portfolio" && (
            <>
              {/* Portfolio */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <FolderOpen size={18} />
                  </div>
                  <h3>Portfolio</h3>
                </div>
                <div className="cv-list">
                  {profile.portfolios?.map((p) => (
                    <div key={p.id} className="cv-item">
                      <div className="cv-item-content">
                        <h4>{p.title}</h4>
                        <p>{p.description}</p>
                        {(p.githubLink || p.demoLink) && (
                          <div className="cv-links">
                            {p.githubLink && (
                              <a
                                href={p.githubLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Code2 size={12} /> Repo
                              </a>
                            )}
                            {p.demoLink && (
                              <a
                                href={p.demoLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink size={12} /> Démo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePortfolio(p.id)}
                        className="btn-delete-cv"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {showPortForm ? (
                  <div className="cv-form">
                    <input
                      type="text"
                      placeholder="Titre du projet (Requis)"
                      value={portForm.title}
                      onChange={(e) =>
                        setPortForm({ ...portForm, title: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Description"
                      value={portForm.description}
                      onChange={(e) =>
                        setPortForm({
                          ...portForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <input
                      type="url"
                      placeholder="Lien GitHub"
                      value={portForm.githubLink}
                      onChange={(e) =>
                        setPortForm({ ...portForm, githubLink: e.target.value })
                      }
                    />
                    <input
                      type="url"
                      placeholder="Lien de la Démo (En ligne)"
                      value={portForm.demoLink}
                      onChange={(e) =>
                        setPortForm({ ...portForm, demoLink: e.target.value })
                      }
                    />
                    <div className="cv-form-actions">
                      <button
                        className="btn-save-cv"
                        onClick={handleAddPortfolio}
                        disabled={!portForm.title}
                      >
                        Enregistrer
                      </button>
                      <button
                        className="btn-cancel-cv"
                        onClick={() => setShowPortForm(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-add-cv"
                    onClick={() => setShowPortForm(true)}
                  >
                    <Plus size={15} /> Ajouter un projet
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "verification" && (
            <>
              {/* Vérification d'identité */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <h3>Certification & Vérification d'identité</h3>
                </div>

                <div style={{ padding: "0 24px 24px 24px" }}>
                  <div
                    className="verification-status-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          color: "#1e293b",
                          fontSize: "15px",
                        }}
                      >
                        Statut de votre compte
                      </h4>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        La vérification vous donne plus de visibilité.
                      </span>
                    </div>
                    <span
                      className={`verification-status-badge ${profile.idVerificationStatus.toLowerCase()}`}
                      style={{ fontSize: "14px", padding: "6px 12px" }}
                    >
                      {profile.idVerificationStatus === "APPROVED" &&
                        "✔ Vérifié"}
                      {profile.idVerificationStatus === "PENDING" &&
                        "En attente"}
                      {profile.idVerificationStatus === "REJECTED" &&
                        "✖ Rejeté"}
                      {profile.idVerificationStatus === "NOT_SUBMITTED" &&
                        "Non soumis"}
                    </span>
                  </div>

                  {profile.idVerificationStatus === "NOT_SUBMITTED" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <p
                        className="verification-text"
                        style={{
                          fontSize: "14px",
                          color: "#475569",
                          lineHeight: "1.6",
                        }}
                      >
                        Faites certifier votre profil en transmettant une pièce
                        d'identité officielle (CNI, Passeport ou Permis). Un
                        profil vérifié attire{" "}
                        <strong>jusqu'à 3x plus de clients</strong> sur
                        FreeLink.
                      </p>
                      <button
                        onClick={() => setShowVerificationForm(true)}
                        style={{
                          alignSelf: "flex-start",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1d4ed8")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#2563eb")
                        }
                      >
                        <ShieldCheck size={18} /> Démarrer la vérification
                      </button>
                    </div>
                  )}

                  {profile.idVerificationStatus === "PENDING" && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#fffbeb",
                        border: "1px solid #fef3c7",
                        borderRadius: "8px",
                        color: "#b45309",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <AlertTriangle size={18} /> Pièces en cours d'analyse
                      </h4>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        Vos documents ({profile.idType}) ont bien été reçus. Ils
                        sont en cours de validation par nos administrateurs. Ce
                        processus prend généralement moins de 24h.
                      </p>
                    </div>
                  )}

                  {profile.idVerificationStatus === "APPROVED" && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        color: "#166534",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <ShieldCheck size={18} /> Identité validée
                      </h4>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        Votre compte est certifié. Le badge de vérification est
                        désormais visible sur votre profil public pour rassurer
                        les clients.
                      </p>
                    </div>
                  )}

                  {profile.idVerificationStatus === "REJECTED" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          color: "#991b1b",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 8px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <AlertTriangle size={18} /> Vérification refusée
                        </h4>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          Motif :{" "}
                          <strong>
                            {profile.idRejectionReason ||
                              "Document non lisible ou non valide."}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => setShowVerificationForm(true)}
                        style={{
                          alignSelf: "flex-start",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#b91c1c")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                      >
                        Soumettre de nouveaux documents
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="profile-edit-sidebar">
          {activeTab === "general" && (
            <>
              {/* Tarif horaire */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <DollarSign size={18} />
                  </div>
                  <h3>Tarif horaire</h3>
                </div>
                <div className="form-field">
                  <label>Tarif en FCFA par heure</label>
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={handleChange("hourlyRate")}
                    placeholder="Ex : 15000"
                    min="0"
                  />
                  <span className="input-hint">
                    Junior &lt; 10 000 · Intermédiaire 10 000–20 000 · Expert ≥
                    20 000
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === "portfolio" && (
            <>
              {/* Liens professionnels */}
              <div className="profile-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <Globe size={18} />
                  </div>
                  <h3>Liens professionnels</h3>
                </div>
                <div className="profile-form-grid single">
                  <div className="form-field">
                    <label>
                      <Code2
                        size={13}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      GitHub
                    </label>
                    <div className="link-field-wrap">
                      <Code2 size={14} className="link-prefix-icon" />
                      <input
                        type="url"
                        value={profile.githubLink}
                        onChange={handleChange("githubLink")}
                        placeholder="https://github.com/votre-profil"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>
                      <ExternalLink
                        size={13}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      LinkedIn
                    </label>
                    <div className="link-field-wrap">
                      <ExternalLink size={14} className="link-prefix-icon" />
                      <input
                        type="url"
                        value={profile.linkedinLink}
                        onChange={handleChange("linkedinLink")}
                        placeholder="https://linkedin.com/in/votre-profil"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>
                      <Globe
                        size={13}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      Site web / Portfolio
                    </label>
                    <div className="link-field-wrap">
                      <Globe size={14} className="link-prefix-icon" />
                      <input
                        type="url"
                        value={profile.websiteLink}
                        onChange={handleChange("websiteLink")}
                        placeholder="https://monportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "general" && (
            <>
              {/* Conseils */}
              <div
                className="profile-section-card"
                style={{
                  background: "linear-gradient(135deg, #eff6ff, #e0e7ff)",
                  border: "1px solid #bfdbfe",
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e40af",
                    marginBottom: 12,
                  }}
                >
                  💡 Conseils pour un bon profil
                </h3>
                <ul
                  style={{
                    fontSize: 13,
                    color: "#1e40af",
                    margin: 0,
                    paddingLeft: 16,
                    lineHeight: 1.8,
                  }}
                >
                  <li>Ajoutez une photo professionnelle</li>
                  <li>Rédigez une bio de 150+ mots</li>
                  <li>Listez au minimum 5 compétences</li>
                  <li>Renseignez votre tarif horaire</li>
                  <li>Ajoutez vos liens GitHub / LinkedIn</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full width rows for specific tabs */}
      {activeTab === "general" && (
        <div className="profile-row-desktop" style={{ marginTop: "24px" }}>
          {/* Présentation */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="section-card-icon">
                <FileText size={18} />
              </div>
              <h3>Présentation / Bio</h3>
            </div>
            <div className="profile-form-grid single">
              <div className="form-field">
                <label>À propos de vous</label>
                <textarea
                  value={profile.bio}
                  onChange={handleChange("bio")}
                  placeholder="Décrivez votre expérience, vos spécialités et ce qui vous rend unique. Les clients lisent attentivement cette section !"
                  style={{ minHeight: 140 }}
                />
                <span className="input-hint">
                  {profile.bio.length} / 1000 caractères recommandés
                </span>
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="section-card-icon">
                <Code2 size={18} />
              </div>
              <h3>Compétences</h3>
            </div>

            <div className="skills-container">
              {profile.skills.length === 0 && (
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Aucune compétence ajoutée. Tapez une compétence ci-dessous.
                </span>
              )}
              {profile.skills.map((skill) => (
                <span key={skill.skillId} className="skill-chip">
                  {skill.name}
                  <button
                    onClick={() => handleRemoveSkill(skill.name)}
                    title="Supprimer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="skill-add-row">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Ajouter une compétence (Ex : React, Figma, SEO...)"
              />
              <button className="btn-add-skill" onClick={handleAddSkill}>
                <Plus size={15} /> Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cv" && (
        <div className="profile-row-desktop-3" style={{ marginTop: "24px" }}>
          {/* Experience */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="section-card-icon">
                <Briefcase size={18} />
              </div>
              <h3>Expérience professionnelle</h3>
            </div>
            <div className="cv-list">
              {profile.experiences?.map((e) => (
                <div key={e.id} className="cv-item">
                  <div className="cv-item-content">
                    <h4>
                      {e.position} chez {e.company}
                    </h4>
                    <span className="cv-dates">
                      {new Date(e.startDate).toLocaleDateString()} -{" "}
                      {e.endDate
                        ? new Date(e.endDate).toLocaleDateString()
                        : "Aujourd'hui"}
                    </span>
                    <p>{e.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteExperience(e.id)}
                    className="btn-delete-cv"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {showExpForm ? (
              <div className="cv-form">
                <input
                  type="text"
                  placeholder="Poste occupé (Ex: Développeur Frontend)"
                  value={expForm.position}
                  onChange={(e) =>
                    setExpForm({ ...expForm, position: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Entreprise"
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                />
                <div className="cv-form-row">
                  <div className="cv-form-col">
                    <label>Date de début</label>
                    <input
                      type="date"
                      value={expForm.startDate}
                      onChange={(e) =>
                        setExpForm({ ...expForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="cv-form-col">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      value={expForm.endDate}
                      onChange={(e) =>
                        setExpForm({ ...expForm, endDate: e.target.value })
                      }
                      disabled={expForm.isCurrent}
                    />
                  </div>
                </div>
                <label className="cv-checkbox">
                  <input
                    type="checkbox"
                    checked={expForm.isCurrent}
                    onChange={(e) =>
                      setExpForm({ ...expForm, isCurrent: e.target.checked })
                    }
                  />
                  J'y travaille actuellement
                </label>
                <textarea
                  placeholder="Description des tâches"
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm({ ...expForm, description: e.target.value })
                  }
                />
                <div className="cv-form-actions">
                  <button
                    className="btn-save-cv"
                    onClick={handleAddExperience}
                    disabled={
                      !expForm.position ||
                      !expForm.company ||
                      !expForm.startDate
                    }
                  >
                    Enregistrer
                  </button>
                  <button
                    className="btn-cancel-cv"
                    onClick={() => setShowExpForm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn-add-cv"
                onClick={() => setShowExpForm(true)}
              >
                <Plus size={15} /> Ajouter une expérience
              </button>
            )}
          </div>

          {/* Education */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="section-card-icon">
                <GraduationCap size={18} />
              </div>
              <h3>Formation / Études</h3>
            </div>
            <div className="cv-list">
              {profile.educations?.map((e) => (
                <div key={e.id} className="cv-item">
                  <div className="cv-item-content">
                    <h4>
                      {e.degree} {e.fieldOfStudy ? `- ${e.fieldOfStudy}` : ""}
                    </h4>
                    <span className="cv-dates">
                      {e.school} | {new Date(e.startDate).toLocaleDateString()}{" "}
                      -{" "}
                      {e.endDate
                        ? new Date(e.endDate).toLocaleDateString()
                        : "Aujourd'hui"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(e.id)}
                    className="btn-delete-cv"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {showEduForm ? (
              <div className="cv-form">
                <input
                  type="text"
                  placeholder="École ou Université"
                  value={eduForm.school}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, school: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Diplôme (Ex: Master, Licence)"
                  value={eduForm.degree}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, degree: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Domaine d'études (Ex: Informatique)"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, fieldOfStudy: e.target.value })
                  }
                />
                <div className="cv-form-row">
                  <div className="cv-form-col">
                    <label>Date de début</label>
                    <input
                      type="date"
                      value={eduForm.startDate}
                      onChange={(e) =>
                        setEduForm({ ...eduForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="cv-form-col">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      value={eduForm.endDate}
                      onChange={(e) =>
                        setEduForm({ ...eduForm, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="cv-form-actions">
                  <button
                    className="btn-save-cv"
                    onClick={handleAddEducation}
                    disabled={
                      !eduForm.school || !eduForm.degree || !eduForm.startDate
                    }
                  >
                    Enregistrer
                  </button>
                  <button
                    className="btn-cancel-cv"
                    onClick={() => setShowEduForm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn-add-cv"
                onClick={() => setShowEduForm(true)}
              >
                <Plus size={15} /> Ajouter une formation
              </button>
            )}
          </div>

          {/* Certificates */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="section-card-icon">
                <Award size={18} />
              </div>
              <h3>Certifications</h3>
            </div>
            <div className="cv-list">
              {profile.certificates?.map((c) => (
                <div key={c.id} className="cv-item">
                  <div className="cv-item-content">
                    <h4>{c.name}</h4>
                    <span className="cv-dates">
                      {c.issuer} | Émis le{" "}
                      {new Date(c.issueDate).toLocaleDateString()}
                    </span>
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cv-cert-link"
                      >
                        <ExternalLink size={12} /> Voir le certificat
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCertificate(c.id)}
                    className="btn-delete-cv"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {showCertForm ? (
              <div className="cv-form">
                <input
                  type="text"
                  placeholder="Nom de la certification"
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm({ ...certForm, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Organisme émetteur (Ex: AWS, Google)"
                  value={certForm.issuer}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issuer: e.target.value })
                  }
                />
                <div className="cv-form-row">
                  <div className="cv-form-col">
                    <label>Date d'obtention</label>
                    <input
                      type="date"
                      value={certForm.issueDate}
                      onChange={(e) =>
                        setCertForm({ ...certForm, issueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="cv-form-col">
                    <label>Date d'expiration (optionnel)</label>
                    <input
                      type="date"
                      value={certForm.expiryDate}
                      onChange={(e) =>
                        setCertForm({ ...certForm, expiryDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="URL du certificat"
                  value={certForm.credentialUrl}
                  onChange={(e) =>
                    setCertForm({ ...certForm, credentialUrl: e.target.value })
                  }
                />
                <div className="cv-form-actions">
                  <button
                    className="btn-save-cv"
                    onClick={handleAddCertificate}
                    disabled={
                      !certForm.name || !certForm.issuer || !certForm.issueDate
                    }
                  >
                    Enregistrer
                  </button>
                  <button
                    className="btn-cancel-cv"
                    onClick={() => setShowCertForm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn-add-cv"
                onClick={() => setShowCertForm(true)}
              >
                <Plus size={15} /> Ajouter une certification
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Barre de sauvegarde ──────────────────────────── */}
      <div className="profile-save-bar">
        <button
          className="btn-cancel-profile"
          onClick={() => {
            setProfile((prev) => ({ ...prev })); // reset visuel
          }}
        >
          Annuler les modifications
        </button>
        <button
          className="btn-save-profile"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={15} /> Sauvegarder le profil
            </>
          )}
        </button>
      </div>
    </div>
  );
};
