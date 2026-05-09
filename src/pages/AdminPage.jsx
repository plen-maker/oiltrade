import { useState } from "react";
import { TopBar, Btn, Badge, StatusDot, Modal, Field, Input, Select } from "../components/UI";

const TYPE_LABELS = { synthetic: "Szintetikus", semi: "Félszintetikus", mineral: "Ásványi" };
const TYPE_COLORS = {
  synthetic: { bg: "rgba(74,158,255,0.12)", color: "var(--blue)" },
  semi: { bg: "rgba(46,204,138,0.12)", color: "var(--green)" },
  mineral: { bg: "rgba(240,165,0,0.12)", color: "var(--accent)" },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "14px 16px",
    }}>
      <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 7, fontFamily: "var(--font-mono)" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text0)", fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent ? "var(--green)" : "var(--text3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>{sub}</div>}
    </div>
  );
}

function Panel({ title, icon, action, children }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>{title}
        </span>
        {action}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function OilRow({ oil, onRemove }) {
  const tc = TYPE_COLORS[oil.type] || TYPE_COLORS.mineral;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 9px", borderRadius: 8, background: "var(--bg3)",
      marginBottom: 5,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", minWidth: 75 }}>{oil.sin}</span>
      <span style={{ fontSize: 12, color: "var(--text1)", flex: 1 }}>{oil.name}</span>
      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: tc.bg, color: tc.color, fontFamily: "var(--font-mono)" }}>
        {TYPE_LABELS[oil.type]}
      </span>
      <span style={{ fontSize: 12, color: "var(--accent2)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>{oil.price.toLocaleString("hu")} Ft</span>
      <button onClick={() => onRemove(oil.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 14, padding: "2px 4px" }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
      >🗑</button>
    </div>
  );
}

function CardRow({ card, onToggle, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 8, background: "var(--bg3)", marginBottom: 5,
    }}>
      <div style={{
        width: 36, height: 22, borderRadius: 4,
        background: card.status === "active" ? "var(--bg5)" : "var(--bg4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, color: "var(--text3)", fontFamily: "var(--font-mono)",
        border: "1px solid var(--border2)", flexShrink: 0,
      }}>VISA</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text0)", letterSpacing: "1px" }}>•••• {card.last4}</div>
        <div style={{ fontSize: 10, color: "var(--text3)" }}>{card.bank} · {card.expires}</div>
      </div>
      <StatusDot status={card.status} />
      <button onClick={() => onToggle(card.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13 }}>⇄</button>
      <button onClick={() => onRemove(card.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 14 }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
      >🗑</button>
    </div>
  );
}

export default function AdminPage({ oils, tags, cards, posts, onAddOil, onRemoveOil, onAddTag, onRemoveTag, onToggleCard, onRemoveCard }) {
  const [oilModal, setOilModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [newOil, setNewOil] = useState({ sin: "", name: "", type: "synthetic", brand: "", price: "" });
  const [newTag, setNewTag] = useState("");
  const [newCard, setNewCard] = useState({ last4: "", bank: "", holder: "", expires: "" });
  const [search, setSearch] = useState("");

  const filteredOils = oils.filter(o =>
    o.sin.toLowerCase().includes(search.toLowerCase()) ||
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const submitOil = () => {
    if (!newOil.sin || !newOil.name) return;
    onAddOil({ ...newOil, price: Number(newOil.price) || 0, stock: 0 });
    setNewOil({ sin: "", name: "", type: "synthetic", brand: "", price: "" });
    setOilModal(false);
  };

  const submitCard = () => {
    if (!newCard.last4 || !newCard.bank) return;
    onAddTag && onRemoveTag; // unused but keeps lint happy
    const cardData = { ...newCard, status: "active" };
    // In real app this would go to cards
    setNewCard({ last4: "", bank: "", holder: "", expires: "" });
    setCardModal(false);
  };

  const activeCards = cards.filter(c => c.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar title="Admin panel">
        <Btn primary onClick={() => setOilModal(true)}>+ Új bejegyzés</Btn>
      </TopBar>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
          <StatCard label="Tagok" value="247" sub="↑ +12 e héten" accent />
          <StatCard label="SIN kódok" value={oils.length} sub="aktív kódok" />
          <StatCard label="Posztok" value={posts.length} sub={`${posts.filter(p => p.badge === "deal").length} ajánlat`} />
          <StatCard label="Bankkártyák" value={cards.length} sub={`${activeCards} aktív`} accent />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Panel title="Olaj típusok & SIN kódok" icon="🛢" action={
            <div style={{ display: "flex", gap: 7 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szűrés..."
                style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 9px", color: "var(--text0)", fontSize: 11, width: 120 }} />
              <Btn small onClick={() => setOilModal(true)}>+ Új</Btn>
            </div>
          }>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filteredOils.map(oil => <OilRow key={oil.id} oil={oil} onRemove={onRemoveOil} />)}
              {filteredOils.length === 0 && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: 20 }}>Nincs találat</div>}
            </div>
          </Panel>

          <Panel title="Bankkártyák" icon="💳" action={<Btn small onClick={() => setCardModal(true)}>+ Új</Btn>}>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {cards.map(card => <CardRow key={card.id} card={card} onToggle={onToggleCard} onRemove={onRemoveCard} />)}
            </div>
          </Panel>
        </div>

        <Panel title="Cimkék kezelése" icon="🏷️" action={null}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {tags.map(tag => (
              <div key={tag.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg3)", border: "1px solid var(--border2)",
                borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "var(--text1)",
                cursor: "default",
              }}>
                #{tag.name}
                <button onClick={() => onRemoveTag(tag.id)} style={{
                  background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0,
                }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newTag} onChange={e => setNewTag(e.target.value)}
              placeholder="Új cimke neve..."
              onKeyDown={e => { if (e.key === "Enter" && newTag.trim()) { onAddTag({ name: newTag.trim(), icon: "tag", color: "blue" }); setNewTag(""); }}}
              style={{
                flex: 1, background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "7px 11px", color: "var(--text0)", fontSize: 12,
              }} />
            <Btn small primary onClick={() => { if (newTag.trim()) { onAddTag({ name: newTag.trim(), icon: "tag", color: "blue" }); setNewTag(""); }}}>Hozzáad</Btn>
          </div>
        </Panel>
      </div>

      <Modal open={oilModal} onClose={() => setOilModal(false)} title="Új olaj típus">
        <Field label="SIN kód"><Input value={newOil.sin} onChange={v => setNewOil(p => ({ ...p, sin: v }))} placeholder="pl. SIN-1234" /></Field>
        <Field label="Olaj neve"><Input value={newOil.name} onChange={v => setNewOil(p => ({ ...p, name: v }))} placeholder="pl. 5W-30 Full Synthetic" /></Field>
        <Field label="Márka"><Input value={newOil.brand} onChange={v => setNewOil(p => ({ ...p, brand: v }))} placeholder="pl. Castrol Edge" /></Field>
        <Field label="Típus">
          <Select value={newOil.type} onChange={v => setNewOil(p => ({ ...p, type: v }))}>
            <option value="synthetic">Szintetikus</option>
            <option value="semi">Félszintetikus</option>
            <option value="mineral">Ásványi</option>
          </Select>
        </Field>
        <Field label="Ár (Ft/l)"><Input type="number" value={newOil.price} onChange={v => setNewOil(p => ({ ...p, price: v }))} placeholder="pl. 3450" /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn onClick={() => setOilModal(false)}>Mégse</Btn>
          <Btn primary onClick={submitOil}>Mentés</Btn>
        </div>
      </Modal>

      <Modal open={cardModal} onClose={() => setCardModal(false)} title="Új bankkártya">
        <Field label="Utolsó 4 szám"><Input value={newCard.last4} onChange={v => setNewCard(p => ({ ...p, last4: v }))} placeholder="pl. 1234" /></Field>
        <Field label="Bank neve"><Input value={newCard.bank} onChange={v => setNewCard(p => ({ ...p, bank: v }))} placeholder="pl. OTP Bank" /></Field>
        <Field label="Kártyabirtokos"><Input value={newCard.holder} onChange={v => setNewCard(p => ({ ...p, holder: v }))} placeholder="Teljes név" /></Field>
        <Field label="Lejárat"><Input value={newCard.expires} onChange={v => setNewCard(p => ({ ...p, expires: v }))} placeholder="MM/YY" /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn onClick={() => setCardModal(false)}>Mégse</Btn>
          <Btn primary onClick={submitCard}>Mentés</Btn>
        </div>
      </Modal>
    </div>
  );
}
