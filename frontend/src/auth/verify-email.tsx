import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const type = useMemo(
    () => (searchParams.get("type") || "primary").toLowerCase(),
    [searchParams],
  );
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Lien invalide: token manquant.");
        return;
      }
      try {
        const endpoint =
          type === "secondary"
            ? "http://localhost:3000/api/auth/verify-secondary-email"
            : "http://localhost:3000/api/auth/verify-email";
        const res = await axios.post(endpoint, { token });
        setStatus("success");
        setMessage(res.data?.message || "Adresse e-mail vérifiée avec succès.");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Lien de vérification invalide ou expiré.",
        );
      }
    };

    verify();
  }, [token, type]);

  return (
    <div className="auth-outer-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <Loader2
              size={40}
              style={{
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2>Vérification de l'e-mail</h2>
            <p>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              size={40}
              color="#16a34a"
              style={{ marginBottom: 12 }}
            />
            <h2>
              {type === "secondary"
                ? "Second e-mail confirmé"
                : "Email confirmé"}
            </h2>
            <p>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle
              size={40}
              color="#dc2626"
              style={{ marginBottom: 12 }}
            />
            <h2>Échec de la vérification</h2>
            <p>{message}</p>
          </>
        )}

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 18 }}
          onClick={() => navigate("/login")}
        >
          Aller à la connexion
        </button>
      </div>
    </div>
  );
};
