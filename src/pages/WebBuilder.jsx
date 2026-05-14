import { useState, useEffect } from "react";
import { NFCPayment } from "../components/NFCPayment";
import { processPayment } from "../hooks/useFirestore";
import { Modal } from "../components/UI";

// ─── STORE DATA ───────────────────────────────────────────────────────────────
function useStores() {
  const [stores, setStores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oiltrade_stores") || "[]"); } catch { return []; }
  });
  const save = (s) => { setStores(s); localStorage.setItem("oiltrade_stores", JSON.stringify(s)); };
  const updateStore = (updated) => save(stores.map(s => s.id === updated.id ? updated : s));
  const deleteStore = (id) => save(stores.filter(s => s.id !== id));
  const addStore = (s) => { const ns = [...stores, s]; save(ns); };
  return { stores, addStore, updateStore, deleteStore };
}

// ─── BLOCK TYPES ──────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { id: "hero",     icon: "🎯", label: "Hero banner" },
  { id: "text",     icon: "📝", label: "Szöveg" },
  { id: "products", icon: "🛍", label: "Termék rácsok" },
  { id: "prices",   icon: "💰", label: "Ár lista" },
  { id: "contact",  icon: "📞", label: "Kapcsolat" },
  { id: "divider",  icon: "➖", label: "Elválasztó" },
];

const DEFAULT_BLOCK = {
  hero:     { title: "Üdvözlünk!", subtitle: "Prémium olaj termékek", btnText: "Vásárlás", align: "center" },
  text:     { heading: "Rólunk", content: "Prémium minőségű olaj termékek kereskedése." },
  products: { heading: "Termékeink", cols: 2 },
  prices:   { heading: "Aktuális árak", items: [{ name: "Nyersolaj", price: "$84" }, { name: "Kerozin", price: "$91" }] },
  contact:  { email: "info@oiltrade.net", phone: "+36 1 234 5678", address: "" },
  divider:  {},
};

// ─── PRODUCT EDITOR ───────────────────────────────────────────────────────────
function ProductEditor({ store, onUpdate, onBack }) {
  const [editProd, setEditProd] = useState(null);
  const [newProd, setNewProd] = useState({ name: "", price: "", stock: "", unit: "db", desc: "", available: true });

  const products = store.products || [];

  const saveProduct = () => {
    if (!newProd.name || !newProd.price) return;
    const p = { ...newProd, id: Date.now().toString(), price: Number(newProd.price), stock: Number(newProd.stock) || 0 };
    onUpdate({ ...store, products: [...products, p] });
    setNewProd({ name: "", price: "", stock: "", unit: "db", desc: "", available: true });
  };

  const updateProd = (id, changes) => {
    onUpdate({ ...store, products: products.map(p => p.id === id ? { ...p, ...changes } : p) });
  };

  const deleteProd = (id) => onUpdate({ ...store, products: products.filter(p => p.id !== id) });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button className="bk" onClick={onBack}>←</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>🛍 Termékek</div>
          <div style={{ fontSize: 11, color: "var(--t3)" }}>{store.name}</div>
        </div>
      </div>

      {/* Add new product */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", marginBottom: 10 }}>+ Új termék</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div><label className="fl">Termék neve</label><input className="inp" value={newProd.name} onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} placeholder="pl. Kerozin 500L" /></div>
          <div><label className="fl">Ár ($)</label><input className="inp" type="number" value={newProd.price} onChange={e => setNewProd(p => ({ ...p, price: e.target.value }))} placeholder="0" /></div>
          <div><label className="fl">Készlet</label><input className="inp" type="number" value={newProd.stock} onChange={e => setNewProd(p => ({ ...p, stock: e.target.value }))} placeholder="0" /></div>
          <div><label className="fl">Egység</label>
            <select className="inp" value={newProd.unit} onChange={e => setNewProd(p => ({ ...p, unit: e.target.value }))}>
              <option>db</option><option>liter</option><option>barrel</option><option>kg</option><option>tonna</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}><label className="fl">Leírás</label><textarea className="inp" rows={2} value={newProd.desc} onChange={e => setNewProd(p => ({ ...p, desc: e.target.value }))} placeholder="Rövid leírás..." style={{ resize: "none" }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <input type="checkbox" checked={newProd.available} onChange={e => setNewProd(p => ({ ...p, available: e.target.checked }))} id="avail" />
          <label htmlFor="avail" style={{ fontSize: 13, color: "var(--t2)" }}>Elérhető (vásárolható)</label>
        </div>
        <button className="btn full" onClick={saveProduct} disabled={!newProd.name || !newProd.price}>Termék hozzáadása</button>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--t3)", fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          Még nincs termék. Add hozzá az első terméket!
        </div>
      ) : products.map(p => (
        <div key={p.id} className="card" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
              <span className={`bdg ${p.available ? "green" : "dim"}`}>{p.available ? "Elérhető" : "Nem elérhető"}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, marginBottom: 3 }}>${p.price} / {p.unit}</div>
            {p.desc && <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>{p.desc}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: p.stock > 0 ? "var(--green)" : "var(--red)" }}>
                📦 Készlet: {p.stock} {p.unit}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn ghost sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => updateProd(p.id, { stock: Math.max(0, p.stock - 1) })}>−</button>
                <button className="btn sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => updateProd(p.id, { stock: p.stock + 1 })}>+</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <button className="btn ghost sm" style={{ padding: "4px 8px" }} onClick={() => updateProd(p.id, { available: !p.available })}>
              {p.available ? "🔒" : "✅"}
            </button>
            <button className="btn danger sm" style={{ padding: "4px 8px" }} onClick={() => deleteProd(p.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BLOCK CANVAS PREVIEW ─────────────────────────────────────────────────────
function BlockPreview({ block, store, selected, onSelect, onDelete, onMove, onUpdate }) {
  const pc = store?.primaryColor || "#4a9eff";
  const bg = store?.bgColor || "#040b14";

  return (
    <div onClick={() => onSelect(block.id)} style={{
      border: `1.5px ${selected ? "solid var(--blue)" : "dashed var(--b2)"}`,
      borderRadius: 10, padding: 8, marginBottom: 8, cursor: "pointer", position: "relative",
      background: selected ? "var(--blue-d)" : "transparent",
      transition: "all .15s",
    }}>
      {selected && (
        <div style={{ position: "absolute", top: -1, right: 6, background: "var(--blue)", borderRadius: "0 0 8px 8px", padding: "2px 8px", display: "flex", gap: 6, zIndex: 2 }}>
          <button onClick={e => { e.stopPropagation(); onMove(block.id, -1); }} style={{ background: "none", border: "none", color: "#000", cursor: "pointer", fontSize: 12 }}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMove(block.id, 1); }} style={{ background: "none", border: "none", color: "#000", cursor: "pointer", fontSize: 12 }}>↓</button>
          <button onClick={e => { e.stopPropagation(); onDelete(block.id); }} style={{ background: "none", border: "none", color: "#000", cursor: "pointer", fontSize: 12 }}>✕</button>
        </div>
      )}

      {block.type === "hero" && (
        <div style={{ background: `${pc}14`, borderRadius: 8, padding: "16px 14px", textAlign: block.align || "center" }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 5, color: "var(--t)" }}>{block.title}</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 10 }}>{block.subtitle}</div>
          {block.btnText && <div style={{ display: "inline-block", background: pc, color: "#000", padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{block.btnText}</div>}
        </div>
      )}

      {block.type === "text" && (
        <div style={{ padding: "4px 2px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: "var(--t)" }}>{block.heading}</div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{block.content}</div>
        </div>
      )}

      {block.type === "products" && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--t)" }}>{block.heading}</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${block.cols || 2}, 1fr)`, gap: 7 }}>
            {(store?.products || []).filter(p => p.available).slice(0, 4).map(p => (
              <div key={p.id} style={{ background: "var(--bg3)", borderRadius: 9, padding: "9px 10px", border: "1px solid var(--b)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: "var(--t)" }}>{p.name}</div>
                <div style={{ fontSize: 13, color: pc, fontWeight: 800 }}>${p.price}</div>
                <div style={{ fontSize: 10, color: p.stock > 0 ? "var(--green)" : "var(--red)", marginTop: 2 }}>
                  {p.stock > 0 ? `✓ ${p.stock} ${p.unit}` : "✗ Nincs"}
                </div>
              </div>
            ))}
            {(store?.products || []).filter(p => p.available).length === 0 && (
              <div style={{ fontSize: 11, color: "var(--t3)", gridColumn: "1/-1", textAlign: "center", padding: 12 }}>
                Még nincs termék — add hozzá a Termékek oldalon!
              </div>
            )}
          </div>
        </div>
      )}

      {block.type === "prices" && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--t)" }}>{block.heading}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(block.items || []).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg3)", borderRadius: 8, padding: "7px 10px" }}>
                <span style={{ fontSize: 12, color: "var(--t2)" }}>{item.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pc }}>{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {block.type === "contact" && (
        <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 2 }}>
          {block.email && <div>📧 {block.email}</div>}
          {block.phone && <div>📞 {block.phone}</div>}
          {block.address && <div>📍 {block.address}</div>}
        </div>
      )}

      {block.type === "divider" && <hr style={{ border: "none", borderTop: "1px solid var(--b2)" }} />}
    </div>
  );
}

// ─── PROPERTY PANEL ───────────────────────────────────────────────────────────
function PropPanel({ block, store, onUpdate, onBack }) {
  if (!block) return (
    <div style={{ padding: "16px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🖱</div>
      <div style={{ fontSize: 11, color: "var(--t3)" }}>Kattints egy blokkra a szerkesztéshez</div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Blokkok hozzáadása</div>
        {BLOCK_TYPES.map(bt => (
          <div key={bt.id} onClick={() => onBack(bt.id)} style={{
            background: "var(--bg3)", border: "1px solid var(--b2)", borderRadius: 8,
            padding: "7px 9px", cursor: "pointer", marginBottom: 5,
            display: "flex", alignItems: "center", gap: 7, fontSize: 11,
            transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b2)"; e.currentTarget.style.color = "var(--t)"; }}
          >
            <span>{bt.icon}</span><span>{bt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const u = (changes) => onUpdate({ ...block, ...changes });

  return (
    <div style={{ padding: "12px 10px", overflowY: "auto" }}>
      <div style={{ fontSize: 10, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12, fontWeight: 700 }}>
        {BLOCK_TYPES.find(b => b.id === block.type)?.icon} {BLOCK_TYPES.find(b => b.id === block.type)?.label}
      </div>

      {block.type === "hero" && (
        <>
          <div style={{ marginBottom: 8 }}><label className="fl">Főcím</label><input className="inp" value={block.title || ""} onChange={e => u({ title: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Alcím</label><input className="inp" value={block.subtitle || ""} onChange={e => u({ subtitle: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Gomb szöveg</label><input className="inp" value={block.btnText || ""} onChange={e => u({ btnText: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Igazítás</label>
            <div style={{ display: "flex", gap: 5 }}>
              {["left","center","right"].map(a => (
                <button key={a} onClick={() => u({ align: a })} className={`btn sm ${block.align === a ? "" : "ghost"}`} style={{ flex: 1, fontSize: 10 }}>
                  {a === "left" ? "⬤◯◯" : a === "center" ? "◯⬤◯" : "◯◯⬤"}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "text" && (
        <>
          <div style={{ marginBottom: 8 }}><label className="fl">Fejléc</label><input className="inp" value={block.heading || ""} onChange={e => u({ heading: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Szöveg</label><textarea className="inp" rows={4} value={block.content || ""} onChange={e => u({ content: e.target.value })} style={{ resize: "none", fontSize: 11 }} /></div>
        </>
      )}

      {block.type === "products" && (
        <>
          <div style={{ marginBottom: 8 }}><label className="fl">Fejléc</label><input className="inp" value={block.heading || ""} onChange={e => u({ heading: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Oszlopok</label>
            <div style={{ display: "flex", gap: 5 }}>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => u({ cols: n })} className={`btn sm ${block.cols === n ? "" : "ghost"}`} style={{ flex: 1, fontSize: 11 }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", background: "var(--bg3)", borderRadius: 8, padding: "8px 10px" }}>
            Termékeket a "🛍 Termékek" gombbal kezeld.
          </div>
        </>
      )}

      {block.type === "prices" && (
        <>
          <div style={{ marginBottom: 8 }}><label className="fl">Fejléc</label><input className="inp" value={block.heading || ""} onChange={e => u({ heading: e.target.value })} style={{ fontSize: 11 }} /></div>
          {(block.items || []).map((item, i) => (
            <div key={i} style={{ background: "var(--bg)", borderRadius: 8, padding: 8, marginBottom: 6 }}>
              <div style={{ marginBottom: 5 }}><label className="fl">Termék neve</label><input className="inp" value={item.name} onChange={e => { const it = [...block.items]; it[i] = { ...it[i], name: e.target.value }; u({ items: it }); }} style={{ fontSize: 11 }} /></div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1 }}><label className="fl">Ár</label><input className="inp" value={item.price} onChange={e => { const it = [...block.items]; it[i] = { ...it[i], price: e.target.value }; u({ items: it }); }} style={{ fontSize: 11 }} /></div>
                <button onClick={() => { const it = block.items.filter((_, j) => j !== i); u({ items: it }); }} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14, alignSelf: "flex-end", paddingBottom: 2 }}>✕</button>
              </div>
            </div>
          ))}
          <button className="btn ghost sm" style={{ width: "100%", fontSize: 11 }} onClick={() => u({ items: [...(block.items || []), { name: "Új termék", price: "$0" }] })}>+ Sor hozzáadása</button>
        </>
      )}

      {block.type === "contact" && (
        <>
          <div style={{ marginBottom: 8 }}><label className="fl">Email</label><input className="inp" value={block.email || ""} onChange={e => u({ email: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Telefon</label><input className="inp" value={block.phone || ""} onChange={e => u({ phone: e.target.value })} style={{ fontSize: 11 }} /></div>
          <div style={{ marginBottom: 8 }}><label className="fl">Cím</label><input className="inp" value={block.address || ""} onChange={e => u({ address: e.target.value })} style={{ fontSize: 11 }} /></div>
        </>
      )}
    </div>
  );
}

// ─── STORE CHECKOUT (buyer view) ───────────────────────────────────────────────
function StoreCheckout({ store, profile, onClose }) {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("shop"); // shop | cart | pay | done
  const [payMethod, setPayMethod] = useState(null);
  const [nfcDone, setNfcDone] = useState(false);

  const products = (store.products || []).filter(p => p.available && p.stock > 0);
  const total = cart.reduce((s, item) => s + item.price * item.qty, 0);

  const addToCart = (prod) => {
    setCart(c => {
      const ex = c.find(x => x.id === prod.id);
      if (ex) return c.map(x => x.id === prod.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...prod, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(c => c.filter(x => x.id !== id));
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  if (step === "done") return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Rendelés sikeres!</div>
      <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 6 }}>Összeg: <strong style={{ color: "var(--blue)" }}>${total}</strong></div>
      <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 24 }}>A rendelés megerősítést küldtünk.</div>
      <button className="btn" onClick={onClose}>Vissza a bolthoz</button>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--b)", display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)" }}>
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{store.name}</div>
          <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'JetBrains Mono',monospace" }}>{store.domain}</div>
        </div>
        {cartCount > 0 && (
          <button className="btn sm" onClick={() => setStep("cart")} style={{ position: "relative" }}>
            🛒 {cartCount}
            <div style={{ position: "absolute", top: -6, right: -6, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</div>
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 14 }}>
        {step === "shop" && (
          <>
            {/* Render store blocks */}
            {(store.blocks || []).map(block => (
              <div key={block.id} style={{ marginBottom: 14 }}>
                {block.type === "hero" && (
                  <div style={{ background: `${store.primaryColor || "#4a9eff"}14`, borderRadius: 12, padding: "20px 16px", textAlign: block.align || "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{block.title}</div>
                    <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 12 }}>{block.subtitle}</div>
                    {block.btnText && <div style={{ display: "inline-block", background: store.primaryColor || "var(--blue)", color: "#000", padding: "7px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>{block.btnText}</div>}
                  </div>
                )}
                {block.type === "text" && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{block.heading}</div>
                    <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>{block.content}</div>
                  </div>
                )}
                {block.type === "products" && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{block.heading}</div>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${block.cols || 2},1fr)`, gap: 10 }}>
                      {products.map(p => {
                        const inCart = cart.find(x => x.id === p.id);
                        return (
                          <div key={p.id} className="card" style={{ margin: 0, padding: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{p.name}</div>
                            {p.desc && <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 5, lineHeight: 1.5 }}>{p.desc}</div>}
                            <div style={{ fontSize: 15, fontWeight: 800, color: store.primaryColor || "var(--blue)", marginBottom: 4 }}>${p.price}<span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 400 }}>/{p.unit}</span></div>
                            <div style={{ fontSize: 10, color: p.stock > 0 ? "var(--green)" : "var(--red)", marginBottom: 8 }}>
                              📦 {p.stock} {p.unit} raktáron
                            </div>
                            {inCart ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button className="btn ghost sm" style={{ padding: "3px 10px" }} onClick={() => inCart.qty <= 1 ? removeFromCart(p.id) : setCart(c => c.map(x => x.id === p.id ? { ...x, qty: x.qty - 1 } : x))}>−</button>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13 }}>{inCart.qty}</span>
                                <button className="btn sm" style={{ padding: "3px 10px" }} onClick={() => inCart.qty < p.stock && addToCart(p)}>+</button>
                              </div>
                            ) : (
                              <button className="btn full sm" onClick={() => addToCart(p)}>Kosárba</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {block.type === "prices" && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{block.heading}</div>
                    {(block.items || []).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "var(--bg2)", borderRadius: 8, padding: "8px 12px", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: "var(--t2)" }}>{item.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: store.primaryColor || "var(--blue)" }}>{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === "contact" && (
                  <div className="card">
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Kapcsolat</div>
                    {block.email && <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}>📧 {block.email}</div>}
                    {block.phone && <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 5 }}>📞 {block.phone}</div>}
                    {block.address && <div style={{ fontSize: 12, color: "var(--t3)" }}>📍 {block.address}</div>}
                  </div>
                )}
                {block.type === "divider" && <hr style={{ border: "none", borderTop: "1px solid var(--b2)" }} />}
              </div>
            ))}
            {cartCount > 0 && (
              <button className="btn full" style={{ marginTop: 8 }} onClick={() => setStep("cart")}>
                🛒 Kosár megtekintése ({cartCount} termék — ${total})
              </button>
            )}
          </>
        )}

        {step === "cart" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🛒 Kosár</div>
            {cart.map(item => (
              <div key={item.id} className="card" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>${item.price} × {item.qty} = ${item.price * item.qty}</div>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "12px 16px", marginTop: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Összesen</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "var(--blue)", fontFamily: "'JetBrains Mono',monospace" }}>${total}</span>
            </div>
            <button className="btn full" onClick={() => setStep("pay")}>Fizetés →</button>
            <button className="btn ghost full" style={{ marginTop: 8 }} onClick={() => setStep("shop")}>← Vissza</button>
          </div>
        )}

        {step === "pay" && !payMethod && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Fizetési mód</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ id: "nfc", e: "📱", l: "NFC fizetés" }, { id: "card", e: "💳", l: "Bankkártya" }].map(m => (
                <div key={m.id} className="card" style={{ textAlign: "center", padding: 20, cursor: "pointer" }} onClick={() => setPayMethod(m.id)}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{m.e}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.l}</div>
                </div>
              ))}
            </div>
            <button className="btn ghost full" style={{ marginTop: 12 }} onClick={() => setStep("cart")}>← Vissza</button>
          </div>
        )}

        {step === "pay" && payMethod === "nfc" && (
          <NFCPayment
            offer={{ id: `store-${store.id}`, price: total, fromName: store.name, productName: `${cartCount} termék` }}
            profile={profile}
            onSuccess={async (method) => {
              if (store.ownerId && profile?.id) {
                await processPayment({
                  offerId: `store-${store.id}-${Date.now()}`,
                  fromId: profile.id, fromName: profile.name,
                  toId: store.ownerId, toName: store.ownerName || store.name,
                  amount: total, payMethod: method,
                  product: cart.map(i=>i.name).join(", "),
                });
              }
              setStep("done");
            }}
            onCancel={() => setPayMethod(null)}
          />
        )}

        {step === "pay" && payMethod === "card" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>💳 Kártya adatok</div>
            <CardForm total={total} onSuccess={() => setStep("done")} onCancel={() => setPayMethod(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

function CardForm({ total, onSuccess, onCancel }) {
  const [card, setCard] = useState({ num: "", cvv: "", exp: "" });
  return (
    <div>
      <div style={{ marginBottom: 10 }}><label className="fl">Kártyaszám</label><input className="inp" value={card.num} onChange={e => setCard(c => ({ ...c, num: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div><label className="fl">CVV</label><input className="inp" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} placeholder="123" maxLength={3} /></div>
        <div><label className="fl">Lejárat</label><input className="inp" value={card.exp} onChange={e => setCard(c => ({ ...c, exp: e.target.value }))} placeholder="MM/YY" maxLength={5} /></div>
      </div>
      <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--t3)" }}>Összeg</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "var(--blue)", fontFamily: "'JetBrains Mono',monospace" }}>${total}</span>
      </div>
      <button className="btn full" onClick={onSuccess} disabled={!card.num || !card.cvv || !card.exp}>
          Fizetés — ${total} →
        </button>
      <button className="btn ghost full" style={{ marginTop: 8 }} onClick={onCancel}>Vissza</button>
    </div>
  );
}

// ─── MAIN WEBBUILDER APP ───────────────────────────────────────────────────────
export function WebBuilderApp({ profile, onClose }) {
  const { stores, addStore, updateStore, deleteStore } = useStores();
  const [view, setView] = useState("list"); // list | edit | products | preview | shop
  const [current, setCurrent] = useState(null);
  const [selBlock, setSelBlock] = useState(null);

  const newStore = () => {
    const s = {
      id: Date.now().toString(),
      ownerId: profile?.id || "",
      ownerName: profile?.name || "",
      name: "Új bolt",
      domain: "uj-bolt.oiltrade",
      primaryColor: "#4a9eff",
      bgColor: "#040b14",
      blocks: [
        { id: "b1", type: "hero", title: "Üdvözlünk!", subtitle: "Prémium olaj termékek", btnText: "Vásárlás →", align: "center" },
        { id: "b2", type: "products", heading: "Termékeink", cols: 2 },
      ],
      products: [],
    };
    addStore(s);
    setCurrent(s);
    setView("edit");
  };

  const update = (updated) => { updateStore(updated); setCurrent(updated); };

  const addBlock = (typeId) => {
    const b = { id: Date.now().toString(), type: typeId, ...DEFAULT_BLOCK[typeId] };
    const s = { ...current, blocks: [...(current.blocks || []), b] };
    update(s);
    setSelBlock(b.id);
  };

  const updateBlock = (updated) => {
    const s = { ...current, blocks: current.blocks.map(b => b.id === updated.id ? updated : b) };
    update(s);
  };

  const deleteBlock = (id) => {
    const s = { ...current, blocks: current.blocks.filter(b => b.id !== id) };
    update(s);
    if (selBlock === id) setSelBlock(null);
  };

  const moveBlock = (id, dir) => {
    const idx = current.blocks.findIndex(b => b.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === current.blocks.length - 1)) return;
    const bs = [...current.blocks];
    [bs[idx], bs[idx + dir]] = [bs[idx + dir], bs[idx]];
    update({ ...current, blocks: bs });
  };

  const selB = current?.blocks?.find(b => b.id === selBlock);

  // LIST
  if (view === "list") return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}><b>🛠 WebBuilder</b></div>
        <button className="btn sm" onClick={newStore}>+ Új bolt</button>
      </div>
      <div className="sc">
        {stores.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🛠</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Nincs még boltod</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>Hozz létre egy mini online boltot termékekkel és fizetéssel!</div>
            <button className="btn" onClick={newStore}>Első bolt létrehozása →</button>
          </div>
        ) : stores.map((s, i) => (
          <div key={s.id} className={`card fu s${Math.min(i + 1, 5)}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.primaryColor}18`, border: `1px solid ${s.primaryColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🛍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'JetBrains Mono',monospace" }}>{s.domain}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>{(s.products || []).length} termék · {(s.blocks || []).length} blokk</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button className="btn sm" onClick={() => { setCurrent(s); setView("edit"); }}>Szerk.</button>
              <button className="btn ghost sm" onClick={() => { setCurrent(s); setView("shop"); }}>🛍 Bolt</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // SHOP VIEW (buyer)
  if (view === "shop") return (
    <div className="win">
      <StoreCheckout store={current} profile={profile} onClose={() => setView("list")} />
    </div>
  );

  // PRODUCTS EDITOR
  if (view === "products") return (
    <div className="win">
      <div className="hdr" style={{ paddingBottom: 0 }}></div>
      <div className="sc">
        <ProductEditor store={current} onUpdate={update} onBack={() => setView("edit")} />
      </div>
    </div>
  );

  // EDITOR
  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={() => { setView("list"); setSelBlock(null); }}>←</button>
        <div style={{ flex: 1 }}>
          <input value={current?.name || ""} onChange={e => update({ ...current, name: e.target.value })}
            style={{ background: "none", border: "none", color: "var(--t)", fontWeight: 700, fontSize: 14, width: "100%" }} />
          <input value={current?.domain || ""} onChange={e => update({ ...current, domain: e.target.value })}
            style={{ background: "none", border: "none", color: "var(--t3)", fontSize: 10, width: "100%", fontFamily: "'JetBrains Mono',monospace" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="color" value={current?.primaryColor || "#4a9eff"} onChange={e => update({ ...current, primaryColor: e.target.value })} style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer" }} />
          <button className="btn ghost sm" onClick={() => setView("products")}>🛍</button>
          <button className="btn ghost sm" onClick={() => setView("shop")}>👁</button>
          <button className="btn danger sm" onClick={() => { deleteStore(current.id); setView("list"); }}>🗑</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100% - 70px)" }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {(current?.blocks || []).map(block => (
            <BlockPreview
              key={block.id}
              block={block}
              store={current}
              selected={selBlock === block.id}
              onSelect={setSelBlock}
              onDelete={deleteBlock}
              onMove={moveBlock}
              onUpdate={updateBlock}
            />
          ))}
          <div style={{ border: "1.5px dashed var(--b2)", borderRadius: 10, padding: 16, textAlign: "center", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}
            onClick={() => setSelBlock(null)}>
            ← Adj hozzá blokkokat jobb oldalon
          </div>
        </div>

        {/* Property panel */}
        <div style={{ width: 140, overflowY: "auto", borderLeft: "1px solid var(--b)", background: "var(--bg2)" }}>
          <PropPanel
            block={selB}
            store={current}
            onUpdate={updateBlock}
            onBack={addBlock}
          />
        </div>
      </div>
    </div>
  );
}
