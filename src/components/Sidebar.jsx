const navItems = [
  { section: "Közösség" },
  { id: "feed", label: "Hírek & Feed", icon: "📰" },
  { id: "market", label: "Piac", icon: "📈" },
  { id: "members", label: "Tagok", icon: "👥" },
  { section: "Admin" },
  { id: "admin", label: "Admin panel", icon: "⚙️" },
  { section: "Oldal" },
  { id: "editor", label: "Web editor", icon: "🎨" },
  { section: "Developer" },
  { id: "devupdate", label: "Update panel", icon: "🛠" },
];

const s = {
  sidebar: {
    width: 220, minWidth: 220,
    background: "var(--bg1)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column",
    fontFamily: "var(--font-body)",
  },
  logoWrap: {
    padding: "18px 16px 14px",
    borderBottom: "1px solid var(--border)",
  },
  logoBadge: {
    display: "flex", alignItems: "center", gap: 10,
  },
  logoIcon: {
    width: 36, height: 36,
    background: "var(--accent)",
    borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  logoName: {
    fontFamily: "var(--font-display)",
    fontSize: 16, fontWeight: 700,
    color: "var(--text0)", letterSpacing: 0.3,
  },
  logoVer: {
    fontSize: 10,
    background: "var(--accent3)",
    color: "var(--accent)",
    border: "1px solid rgba(240,165,0,0.25)",
    padding: "1px 7px", borderRadius: 5,
    display: "inline-block", marginTop: 2,
    fontFamily: "var(--font-mono)",
  },
  nav: { flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 },
  section: {
    fontSize: 10, color: "var(--text3)",
    textTransform: "uppercase", letterSpacing: "0.9px",
    padding: "12px 8px 4px",
    fontFamily: "var(--font-mono)",
  },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 9,
    padding: "8px 10px", borderRadius: 8,
    border: "none",
    background: active ? "var(--accent3)" : "transparent",
    color: active ? "var(--accent)" : "var(--text2)",
    fontSize: 13, fontWeight: active ? 500 : 400,
    cursor: "pointer", width: "100%", textAlign: "left",
    transition: "all 0.14s",
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
  }),
  userBar: {
    padding: "12px 14px",
    borderTop: "1px solid var(--border)",
    display: "flex", alignItems: "center", gap: 10,
  },
  avatar: (bg) => ({
    width: 32, height: 32, borderRadius: "50%",
    background: bg || "var(--accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700,
    color: bg ? "#fff" : "#000",
    flexShrink: 0, fontFamily: "var(--font-mono)",
  }),
  userName: { fontSize: 13, fontWeight: 500, color: "var(--text0)" },
  userRole: { fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" },
};

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <div style={s.sidebar}>
      <div style={s.logoWrap}>
        <div style={s.logoBadge}>
          <div style={s.logoIcon}>🛢</div>
          <div>
            <div style={s.logoName}>OilTrade</div>
            <span style={s.logoVer}>v3.0 beta</span>
          </div>
        </div>
      </div>
      <nav style={s.nav}>
        {navItems.map((item, i) => item.section
          ? <div key={i} style={s.section}>{item.section}</div>
          : (
            <button
              key={item.id}
              style={s.navItem(page === item.id)}
              onClick={() => setPage(item.id)}
              onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text1)"; }}}
              onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </nav>
      <div style={s.userBar}>
        <div style={s.avatar()}>{user.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={s.userName}>{user.name}</div>
          <div style={s.userRole}>{user.role}</div>
        </div>
        <span onClick={onLogout} title="Kijelentkezés" style={{ fontSize: 16, cursor: "pointer", color: "var(--text3)" }}>⏻</span>
      </div>
    </div>
  );
}
