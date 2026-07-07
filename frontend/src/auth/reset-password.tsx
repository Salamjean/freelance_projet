import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const resetEmail = sessionStorage.getItem("resetPasswordEmail") || "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetEmail) {
      setError("Session expirée. Recommencez depuis Mot de passe oublié.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Veuillez saisir un code OTP valide à 6 chiffres.");
      return;
    }
    if (password.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email: resetEmail,
        otp: otp.trim(),
        newPassword: password,
      });

      await Swal.fire({
        icon: "success",
        title: "Mot de passe mis à jour",
        text: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        confirmButtonText: "Aller à la connexion",
        heightAuto: false,
      });

      sessionStorage.removeItem("resetPasswordEmail");
      navigate("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Le code OTP est invalide ou expiré.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-card">
        <button
          className="back-btn"
          onClick={() => {
            sessionStorage.removeItem("resetPasswordEmail");
            navigate("/login");
          }}
        >
          <ArrowLeft size={16} /> Retour connexion
        </button>

        <div className="auth-header">
          <h2>Réinitialiser le mot de passe</h2>
          <p>
            Saisissez le code OTP reçu par email puis choisissez un nouveau mot
            de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Code OTP</label>
            <div className="input-with-icon">
              <ShieldCheck className="input-icon" size={18} />
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 123456"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <div className="password-input-wrapper input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <div className="password-input-wrapper input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                placeholder="Confirmez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};
