import { useState } from "react";
import { TopBar, Btn, SearchBar, Badge, OilTag } from "../components/UI";

const BADGE_OPTS = [
  { id: "deal", label: "Ajánlat" },
  { id: "news", label: "Hírek" },
  { id: "warn", label: "Figyelem" },
  { id: "promo", label: "Promo" },
];

function PriceCard({ label, val, change }) {
  const up = change > 0;
  return (
    <div style={{
      flex: 1, minWidth: 110,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg3)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "9px 12px",
    }}>
      <div>
        <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{val.toLocaleString("hu")} Ft</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: up ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)" }}>
        {up ? "↑" : "↓"} {Math.abs(change)}%
      </span>
    </div>
  );
}

function PostCard({ post, oils, onToggleLike }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  return (
    <div className="animate-in" style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 12,
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: post.avatarColor, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff",
          flexShrink: 0, fontFamily: "var(--font-mono)",
        }}>{post.initials}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, marginRight: 8 }}>{post.author}</span>
          <Badge type={post.badge} />
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1, fontFamily: "var(--font-mono)" }}>
            {post.time}{post.location ? ` · ${post.location}` : ""}
          </div>
        </div>
        <span style={{ fontSize: 16, color: "var(--text3)", cursor: "pointer" }}>⋯</span>
      </div>

      {post.oils.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          {post.oils.map(sin => <OilTag key={sin} sin={sin} oils={oils} />)}
        </div>
      )}

      <p style={{ fontSize: 13, color: "var(--text1)", lineHeight: 1.65, marginBottom: post.prices.length ? 10 : 0 }}>
        {post.content}
      </p>

      {post.prices.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {post.prices.map((p, i) => <PriceCard key={i} {...p} />)}
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        paddingTop: 10, marginTop: 10,
        borderTop: "1px solid var(--border)",
      }}>
        <ActionBtn icon={post.liked ? "❤️" : "🤍"} label={post.likes} active={post.liked} onClick={() => onToggleLike(post.id)} />
        <ActionBtn icon="💬" label={post.comments} onClick={() => setShowComment(!showComment)} />
        <ActionBtn icon="↗" label="Megosztás" />
        <div style={{ flex: 1 }} />
        <ActionBtn icon="🔖" label="" />
      </div>

      {showComment && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Komment..."
            style={{
              flex: 1, background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 7, padding: "6px 10px", color: "var(--text0)", fontSize: 12,
            }} />
          <Btn small primary onClick={() => setComment("")}>Küld</Btn>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 7,
      border: "none", background: "none",
      color: active ? "var(--red)" : "var(--text3)",
      fontSize: 12, cursor: "pointer", transition: "all 0.14s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text1)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = active ? "var(--red)" : "var(--text3)"; }}
    >
      <span>{icon}</span>
      {label !== "" && <span>{label}</span>}
    </button>
  );
}

function Composer({ oils, tags, user, onAddPost }) {
  const [text, setText] = useState("");
  const [badge, setBadge] = useState("news");
  const [selectedOils, setSelectedOils] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const toggleOil = (sin) => setSelectedOils(prev => prev.includes(sin) ? prev.filter(s => s !== sin) : [...prev, sin]);

  const submit = () => {
    if (!text.trim()) return;
    onAddPost({
      author: user.name, initials: user.initials,
      avatarColor: "#4a9eff", badge, oils: selectedOils,
      content: text, prices: [],
    });
    setText(""); setSelectedOils([]); setExpanded(false);
  };

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: 16, marginBottom: 16,
    }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--accent)", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#000",
          flexShrink: 0, fontFamily: "var(--font-mono)",
        }}>{user.initials}</div>
        <textarea value={text} onChange={e => { setText(e.target.value); if (!expanded) setExpanded(true); }}
          onFocus={e => { setExpanded(true); e.target.style.borderColor = "var(--accent)"; }}
          placeholder="Oszd meg az újdonságokat a közösséggel..."
          rows={expanded ? 3 : 2}
          style={{
            flex: 1, background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 9, padding: "9px 12px", color: "var(--text0)",
            fontSize: 13, resize: "none", lineHeight: 1.55,
            transition: "border-color 0.15s",
          }}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 7, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Típus</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {BADGE_OPTS.map(b => (
              <button key={b.id} onClick={() => setBadge(b.id)} style={{
                padding: "4px 12px", borderRadius: 8,
                border: badge === b.id ? "1px solid var(--accent)" : "1px solid var(--border2)",
                background: badge === b.id ? "var(--accent3)" : "var(--bg3)",
                color: badge === b.id ? "var(--accent)" : "var(--text2)",
                fontSize: 12, cursor: "pointer", fontFamily: "var(--font-mono)",
              }}>{b.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 7, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Olaj típusok</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {oils.slice(0, 5).map(o => (
              <button key={o.sin} onClick={() => toggleOil(o.sin)} style={{
                padding: "3px 10px", borderRadius: 7, fontSize: 11,
                border: selectedOils.includes(o.sin) ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: selectedOils.includes(o.sin) ? "var(--accent3)" : "var(--bg3)",
                color: selectedOils.includes(o.sin) ? "var(--accent2)" : "var(--text3)",
                cursor: "pointer", fontFamily: "var(--font-mono)",
              }}>{o.sin}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn onClick={() => setExpanded(false)}>Mégse</Btn>
            <Btn primary onClick={submit}>Közzétesz</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedPage({ posts, oils, tags, user, onAddPost, onToggleLike }) {
  const [search, setSearch] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");

  const filtered = posts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchBadge = filterBadge === "all" || p.badge === filterBadge;
    return matchSearch && matchBadge;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar title="Közösségi feed">
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ display: "flex", gap: 5 }}>
          {["all", "deal", "news", "warn"].map(f => (
            <button key={f} onClick={() => setFilterBadge(f)} style={{
              padding: "5px 11px", borderRadius: 7, fontSize: 11,
              border: filterBadge === f ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: filterBadge === f ? "var(--accent3)" : "var(--bg3)",
              color: filterBadge === f ? "var(--accent)" : "var(--text2)",
              cursor: "pointer", fontFamily: "var(--font-mono)",
            }}>
              {f === "all" ? "Mind" : f === "deal" ? "Ajánlat" : f === "news" ? "Hírek" : "Figyelem"}
            </button>
          ))}
        </div>
      </TopBar>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", maxWidth: 720, width: "100%" }}>
        <Composer oils={oils} tags={tags} user={user} onAddPost={onAddPost} />
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text3)", padding: "40px 0", fontSize: 13 }}>
            Nincs találat a keresési feltételekre.
          </div>
        )}
        {filtered.map(post => (
          <PostCard key={post.id} post={post} oils={oils} onToggleLike={onToggleLike} />
        ))}
      </div>
    </div>
  );
}
