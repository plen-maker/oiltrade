export function TopBar({ title, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "13px 20px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg1)",
      position: "sticky", top: 0, zIndex: 20,
      minHeight: 54,
    }}>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: 15, fontWeight: 700,
        color: "var(--text0)", flex: 1,
        letterSpacing: 0.2,
      }}>{title}</span>
      {children}
    </div>
  );
}

export function Btn({ children, primary, danger, small, onClick, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: small ? "5px 11px" : "7px 14px",
    borderRadius: 8,
    border: primary ? "none" : danger ? "1px solid rgba(224,85,85,0.4)" : "1px solid var(--border2)",
    background: primary ? "var(--accent)" : danger ? "rgba(224,85,85,0.1)" : "var(--bg3)",
    color: primary ? "#000" : danger ? "var(--red)" : "var(--text1)",
    fontSize: small ? 12 : 13, fontWeight: primary ? 700 : 500,
    cursor: "pointer", fontFamily: "var(--font-body)",
    transition: "all 0.14s",
    ...style,
  };
  return (
    <button style={base} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "6px 12px",
      flex: 1, maxWidth: 280,
    }}>
      <span style={{ color: "var(--text3)", fontSize: 15 }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Keresés..."}
        style={{
          background: "none", border: "none", color: "var(--text0)",
          fontSize: 13, width: "100%",
        }} />
    </div>
  );
}

export function Badge({ type }) {
  const map = {
    deal: { label: "Ajánlat", bg: "rgba(46,204,138,0.12)", color: "var(--green)", border: "rgba(46,204,138,0.3)" },
    news: { label: "Hírek", bg: "rgba(74,158,255,0.12)", color: "var(--blue)", border: "rgba(74,158,255,0.3)" },
    warn: { label: "Figyelem", bg: "rgba(224,85,85,0.12)", color: "var(--red)", border: "rgba(224,85,85,0.3)" },
    promo: { label: "Promo", bg: "rgba(240,165,0,0.12)", color: "var(--accent)", border: "rgba(240,165,0,0.3)" },
  };
  const { label, bg, color, border } = map[type] || map.news;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 10,
      fontWeight: 700, background: bg, color, border: `1px solid ${border}`,
      fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px",
    }}>{label}</span>
  );
}

export function OilTag({ sin, oils }) {
  const oil = oils?.find(o => o.sin === sin);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--bg3)", border: "1px solid var(--border2)",
      borderRadius: 6, padding: "3px 9px",
      fontSize: 11, color: "var(--accent2)",
      fontFamily: "var(--font-mono)",
      marginRight: 5, marginBottom: 6,
    }}>
      🛢 {sin}{oil ? ` · ${oil.name}` : ""}
    </span>
  );
}

export function StatusDot({ status }) {
  const colors = { active: "var(--green)", inactive: "var(--text3)", expired: "var(--red)" };
  const labels = { active: "Aktív", inactive: "Inaktív", expired: "Lejárt" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors[status] || "var(--text3)", display: "inline-block" }} />
      <span style={{ fontSize: 11, color: colors[status], fontFamily: "var(--font-mono)" }}>{labels[status] || status}</span>
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="animate-in" style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: "var(--radius-xl)", padding: 24, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text2)", marginBottom: 5, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", background: "var(--bg3)", border: "1px solid var(--border2)",
        borderRadius: 8, padding: "8px 12px", color: "var(--text0)", fontSize: 13,
      }}
      onFocus={e => e.target.style.borderColor = "var(--accent)"}
      onBlur={e => e.target.style.borderColor = "var(--border2)"}
    />
  );
}

export function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", background: "var(--bg3)", border: "1px solid var(--border2)",
        borderRadius: 8, padding: "8px 12px", color: "var(--text0)", fontSize: 13,
      }}>
      {children}
    </select>
  );
}
