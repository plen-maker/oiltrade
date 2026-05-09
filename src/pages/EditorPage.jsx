import { useState } from "react";
import { TopBar, Btn } from "../components/UI";

const COMPONENTS = [
  { section: "Tartalom" },
  { id: "heading", label: "Főcím", icon: "H", desc: "Nagy cím blokk" },
  { id: "text", label: "Szöveg", icon: "¶", desc: "Bekezdés szöveg" },
  { id: "image", label: "Kép", icon: "🖼", desc: "Képblokk" },
  { section: "Kártyák" },
  { id: "oil-card", label: "Olaj kártya", icon: "🛢", desc: "SIN + ár kártya" },
  { id: "news-block", label: "Hír blokk", icon: "📰", desc: "Hír kártya" },
  { id: "price-list", label: "Ár lista", icon: "💰", desc: "Olaj árak rácsban" },
  { id: "promo", label: "Akció banner", icon: "⭐", desc: "Kiemelő sáv" },
  { section: "Layout" },
  { id: "hero", label: "Hero szekció", icon: "▬", desc: "Nagy nyitó blokk" },
  { id: "two-col", label: "2 oszlop", icon: "⊟", desc: "Kétoszlopos layout" },
  { id: "divider", label: "Elválasztó", icon: "—", desc: "Vízszintes vonal" },
  { section: "Interaktív" },
  { id: "feed-widget", label: "Feed widget", icon: "📋", desc: "Legújabb posztok" },
  { id: "form", label: "Kapcsolat űrlap", icon: "📝", desc: "Kitölthető űrlap" },
  { id: "cta-btn", label: "CTA gomb", icon: "▷", desc: "Cselekvés gomb" },
];

const DEFAULT_BLOCKS = [
  {
    id: 1, type: "hero",
    props: { title: "A legjobb olaj árak – egyetlen helyen", subtitle: "Csatlakozz a közösséghez, kövesd az árakat és oszd meg az ajánlataidat!", align: "center", bg: "#1c2330" },
  },
  {
    id: 2, type: "price-list",
    props: { items: ["5W-30: 3 450 Ft/l", "10W-40: 2 890 Ft/l", "0W-20: 4 120 Ft/l"] },
  },
  {
    id: 3, type: "promo",
    props: { text: "Hétvégi akció! 5W-30 Full Synthetic 15% kedvezménnyel — csak 2025.01.19-ig.", btnLabel: "Megnézem" },
  },
];

function renderBlock(block, selected, onSelect) {
  const isSelected = selected === block.id;
  const p = block.props;

  let content;
  if (block.type === "hero") {
    content = (
      <div style={{ background: p.bg || "var(--bg3)", borderRadius: 9, padding: "22px 18px", textAlign: p.align || "center" }}>
        <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8, fontFamily: "var(--font-mono)" }}>🛢 OilTrade Közösség</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text0)", marginBottom: 8 }}>{p.title}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{p.subtitle}</div>
      </div>
    );
  } else if (block.type === "price-list") {
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {(p.items || []).map((item, i) => {
          const [label, val] = item.split(": ");
          return (
            <div key={i} style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{val}</div>
            </div>
          );
        })}
      </div>
    );
  } else if (block.type === "promo") {
    content = (
      <div style={{ background: "rgba(240,165,0,0.08)", border: "1px solid rgba(240,165,0,0.2)", borderRadius: 8, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>⭐</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Akció!</div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>{p.text}</div>
        </div>
        <button style={{ background: "var(--accent)", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#000", cursor: "pointer" }}>{p.btnLabel}</button>
      </div>
    );
  } else if (block.type === "heading") {
    content = <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text0)", padding: "6px 0" }}>{p.text || "Cím szövege"}</div>;
  } else if (block.type === "text") {
    content = <div style={{ fontSize: 13, color: "var(--text1)", lineHeight: 1.7 }}>{p.text || "A bekezdés szövege ide kerül. Kattints a blokra a szerkesztéshez."}</div>;
  } else if (block.type === "divider") {
    content = <hr style={{ border: "none", borderTop: "1px solid var(--border2)", margin: "4px 0" }} />;
  } else if (block.type === "feed-widget") {
    content = (
      <div style={{ background: "var(--bg3)", borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Feed widget – legújabb posztok</div>
        {["Nagy Péter · Friss készlet érkezett...", "Szabó Zsolt · Új EU szabályozás 2025-től...", "Molnár Ádám · Vigyázat: hamis termékek..."].map((t, i) => (
          <div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none", fontSize: 12, color: "var(--text2)" }}>📰 {t}</div>
        ))}
      </div>
    );
  } else {
    content = (
      <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "14px", textAlign: "center", fontSize: 12, color: "var(--text3)" }}>
        {block.type} blokk
      </div>
    );
  }

  return (
    <div key={block.id} onClick={() => onSelect(block.id)} style={{
      border: isSelected ? "1.5px solid var(--accent)" : "1.5px dashed transparent",
      borderRadius: 9, padding: 6, marginBottom: 8, position: "relative", cursor: "pointer",
      transition: "border-color 0.14s",
    }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "var(--border2)"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "transparent"; }}
    >
      {isSelected && (
        <div style={{ position: "absolute", top: -1, right: 6, background: "var(--accent)", borderRadius: "0 0 6px 6px", padding: "1px 8px", display: "flex", gap: 4, zIndex: 2 }}>
          <span style={{ fontSize: 11, color: "#000", cursor: "pointer" }}>⇅</span>
          <span style={{ fontSize: 11, color: "#000", cursor: "pointer" }}>⧉</span>
          <span style={{ fontSize: 11, color: "#000", cursor: "pointer" }}>✕</span>
        </div>
      )}
      {content}
    </div>
  );
}

function PropPanel({ block, onChange }) {
  if (!block) return (
    <div style={{ padding: 16, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🖱️</div>
      Kattints egy blokkra a szerkesztéshez
    </div>
  );

  const p = block.props;
  const update = (key, val) => onChange({ ...block, props: { ...p, [key]: val } });

  return (
    <div style={{ padding: "14px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>
        {block.type}
      </div>

      {block.type === "hero" && <>
        <PropField label="Főcím">
          <textarea value={p.title} onChange={e => update("title", e.target.value)} rows={2}
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12, resize: "none" }} />
        </PropField>
        <PropField label="Alcím">
          <textarea value={p.subtitle} onChange={e => update("subtitle", e.target.value)} rows={2}
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12, resize: "none" }} />
        </PropField>
        <PropField label="Igazítás">
          <div style={{ display: "flex", gap: 5 }}>
            {["left", "center", "right"].map(a => (
              <button key={a} onClick={() => update("align", a)} style={{
                flex: 1, padding: "5px", borderRadius: 6, fontSize: 11,
                border: p.align === a ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: p.align === a ? "var(--accent3)" : "var(--bg3)",
                color: p.align === a ? "var(--accent)" : "var(--text2)", cursor: "pointer",
              }}>{a === "left" ? "⬤◯◯" : a === "center" ? "◯⬤◯" : "◯◯⬤"}</button>
            ))}
          </div>
        </PropField>
      </>}

      {block.type === "promo" && <>
        <PropField label="Szöveg">
          <textarea value={p.text} onChange={e => update("text", e.target.value)} rows={3}
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12, resize: "none" }} />
        </PropField>
        <PropField label="Gomb felirat">
          <input value={p.btnLabel} onChange={e => update("btnLabel", e.target.value)}
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12 }} />
        </PropField>
      </>}

      {(block.type === "heading" || block.type === "text") && (
        <PropField label="Szöveg tartalom">
          <textarea value={p.text || ""} onChange={e => update("text", e.target.value)} rows={4}
            style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12, resize: "none" }} />
        </PropField>
      )}

      <PropField label="Láthatóság">
        <select value={p.visibility || "all"} onChange={e => update("visibility", e.target.value)}
          style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px", color: "var(--text0)", fontSize: 12 }}>
          <option value="all">Mindenki</option>
          <option value="members">Csak tagok</option>
          <option value="admin">Csak admin</option>
        </select>
      </PropField>

      <button style={{
        width: "100%", marginTop: 8, padding: "7px", borderRadius: 8,
        border: "1px solid rgba(224,85,85,0.3)", background: "rgba(224,85,85,0.08)",
        color: "var(--red)", fontSize: 12, cursor: "pointer",
      }}>🗑 Blokk törlése</button>
    </div>
  );
}

function PropField({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: "var(--text3)", marginBottom: 5, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

export default function EditorPage({ oils }) {
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [selected, setSelected] = useState(1);
  const [device, setDevice] = useState("desktop");
  const [saved, setSaved] = useState(false);

  const selectedBlock = blocks.find(b => b.id === selected);
  const updateBlock = (updated) => setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));

  const addBlock = (type) => {
    const newBlock = { id: Date.now(), type, props: { text: "", title: "Új blokk", subtitle: "", align: "left", bg: "#1c2330" } };
    setBlocks(prev => [...prev, newBlock]);
    setSelected(newBlock.id);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canvasWidth = device === "desktop" ? "100%" : device === "tablet" ? 600 : 375;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar title="Web editor">
        <div style={{ display: "flex", gap: 3, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 3 }}>
          {[["desktop", "🖥"], ["tablet", "📱"], ["mobile", "📲"]].map(([d, icon]) => (
            <button key={d} onClick={() => setDevice(d)} style={{
              padding: "4px 10px", borderRadius: 6, border: "none",
              background: device === d ? "var(--bg5)" : "transparent",
              color: device === d ? "var(--text0)" : "var(--text3)",
              cursor: "pointer", fontSize: 13,
            }}>{icon}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn>👁 Előnézet</Btn>
        <Btn primary onClick={handleSave}>{saved ? "✓ Mentve!" : "💾 Mentés"}</Btn>
      </TopBar>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Component palette */}
        <div style={{ width: 190, minWidth: 190, background: "var(--bg1)", borderRight: "1px solid var(--border)", overflowY: "auto", padding: 10 }}>
          {COMPONENTS.map((item, i) => item.section
            ? <div key={i} style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.9px", padding: "10px 6px 4px", fontFamily: "var(--font-mono)" }}>{item.section}</div>
            : (
              <div key={item.id} onClick={() => addBlock(item.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 8px", borderRadius: 7, cursor: "pointer",
                background: "var(--bg3)", border: "1px solid var(--border)",
                marginBottom: 5, transition: "border-color 0.14s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent3)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
              >
                <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: "var(--bg4)", borderRadius: 6 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text1)" }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>{item.desc}</div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg0)", padding: 20 }}>
          <div style={{ maxWidth: canvasWidth, margin: "0 auto", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, minHeight: 400 }}>
            {blocks.map(block => renderBlock(block, selected, setSelected))}
            <div onClick={() => {}} style={{
              border: "1.5px dashed var(--border2)", borderRadius: 9, padding: 20,
              textAlign: "center", color: "var(--text3)", fontSize: 12, cursor: "pointer",
              marginTop: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
            >
              ＋ Húzz ide egy blokkot a palettáról
            </div>
          </div>
        </div>

        {/* Property panel */}
        <div style={{ width: 200, minWidth: 200, background: "var(--bg1)", borderLeft: "1px solid var(--border)", overflowY: "auto" }}>
          <PropPanel block={selectedBlock} onChange={updateBlock} />
        </div>
      </div>
    </div>
  );
}
