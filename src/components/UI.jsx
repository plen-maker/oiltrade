import { CAT_LOGO } from '../data/catLogo';
export function F({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label className="fl">{label}</label>}
      {children}
    </div>
  );
}

export function Modal({ onClose, title, children }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mh" />
        {title && <div style={{ fontSize: 14, fontWeight: 700, color: "var(--blue)", marginBottom: 16 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", gap: 20 }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: "var(--t)", letterSpacing: ".12em" }}>OILTRADE</div>
      <div className="spin" />
    </div>
  );
}
