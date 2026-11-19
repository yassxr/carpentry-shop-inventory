import { useState } from "react";
import api from "../services/api";

export default function LoginPage({ onLogin, showToast }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.login(credentials);
      if (result?.role) {
        sessionStorage.setItem("session", JSON.stringify({
          role: result.role,
          userId: result.userId,
          username: result.username,
          loginAt: Date.now(),
        }));
        onLogin(result.role);
      } else {
        showToast("Identifiants incorrects", "error");
      }
    } catch {
      showToast("Identifiants incorrects", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--navy)"
    }}>
      <div className="card" style={{ width: 320 }}>
        <div style={{ padding: "24px 20px 20px", textAlign: "center" }}>
          <img src="./all.png" alt="Logo" style={{ height: 250, marginBottom: 1 }} />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                value={credentials.username}
                onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Mot de passe</label>
              <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ padding: "10px", justifyContent: "center" }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
