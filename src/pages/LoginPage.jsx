import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError("Bejelentkezés sikertelen. Próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg0)", fontFamily: "var(--font-body)",
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: "var(--radius-xl)", padding: "40px 36px",
        width: "100%", maxWidth: 360, textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, background: "var(--accent)",
          borderRadius: 14, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26, margin: "0 auto 20px",
        }}>🛢</div>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text0)", marginBottom: 6 }}>
          OilTrade
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 32, lineHeight: 1.6 }}>
          Közösségi platform olaj kereskedőknek.<br />Jelentkezz be a folytatáshoz.
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "11px 16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          background: loading ? "var(--bg3)" : "#fff",
          border: "1px solid var(--border2)", borderRadius: 10,
          fontSize: 14, fontWeight: 600, color: "#1a1a1a",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}>
          {loading ? (
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Bejelentkezés...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Bejelentkezés Google-lel
            </>
          )}
        </button>

        {error && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--red)", background: "rgba(224,85,85,0.1)", borderRadius: 7, padding: "7px 12px" }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 24, fontSize: 11, color: "var(--text3)", lineHeight: 1.6 }}>
          Bejelentkezéssel elfogadod a közösség szabályait.<br />
          Csak meghívott tagok csatlakozhatnak.
        </p>
      </div>
    </div>
  );
}
