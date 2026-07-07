import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onBackToLogin,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email,
      });

      await Swal.fire({
        icon: "success",
        title: "Code OTP envoyé",
        text: "Si un compte existe avec cet e-mail, un code OTP de réinitialisation a été envoyé.",
        confirmButtonText: "Saisir le code",
        heightAuto: false,
      });

      sessionStorage.setItem("resetPasswordEmail", email.trim().toLowerCase());
      navigate("/reset-password");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Impossible d'envoyer le code OTP.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-card">
        <button className="back-btn" onClick={onBackToLogin}>
          <ArrowLeft size={16} /> Retour connexion
        </button>

        <div className="auth-header">
          <h2>Mot de passe oublié</h2>
          <p>Recevez un code OTP pour définir un nouveau mot de passe.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Adresse E-mail</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-control"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Envoyer le code OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};
