import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export function CatMailApp({ onClose, profile }) {
  const [tab, setTab] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(
      collection(db, "catmail"),
      where("toId", "==", profile.id)
    );
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db - da;
      });
      setEmails(docs);
    });
    return () => unsub();
  }, [profile?.id]);

  const openEmail = async (email) => {
    setSelected(email);
    if (!email.read) {
      try { await updateDoc(doc(db, "catmail", email.id), { read: true }); } catch {}
    }
  };

  const sendEmail = async () => {
    if (!composeTo.trim() || !composeSubject.trim()) { alert("Töltsd ki a mezőket!"); return; }
    setSending(true);
    try {
      await addDoc(collection(db, "catmail"), {
        fromId: profile?.id || "system",
        fromName: profile?.name || "OilTrade User",
        fromEmail: profile?.email || "",
        toId: composeTo.trim(),
        toName: composeTo.trim(),
        subject: composeSubject,
        body: composeBody,
        type: "user",
        read: false,
        createdAt: serverTimestamp(),
      });
      setComposeTo(""); setComposeSubject(""); setComposeBody("");
      setTab("inbox");
      alert("✅ Email elküldve!");
    } catch(e) { alert("❌ " + e.message); }
    setSending(false);
  };

  const unread = emails.filter(e => !e.read).length;
  const filtered = emails.filter(e => 
    tab === "sent" ? e.fromId === profile?.id :
    tab === "inbox" ? e.toId === profile?.id :
    true
  ).filter(e => !search || 
    e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.fromName?.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_ICON = { trade_offer:"💼", payment:"💳", delivery:"📦", invoice:"🧾", system:"⬡", user:"✉️", order:"🛒", shipping:"🚚", arrival:"📬", update:"🔔" };
  const TYPE_COLOR = { trade_offer:"var(--blue)", payment:"var(--green)", delivery:"#f97316", invoice:"var(--accent)", system:"var(--t3)", user:"var(--t2)", order:"var(--green)", shipping:"#f97316", arrival:"var(--green)", update:"var(--blue)" };
  const TYPE_BG = { trade_offer:"rgba(88,166,255,.1)", payment:"rgba(34,197,94,.1)", delivery:"rgba(249,115,22,.1)", invoice:"rgba(245,158,11,.1)", system:"var(--bg3)", user:"var(--bg3)", order:"rgba(34,197,94,.1)", shipping:"rgba(249,115,22,.1)", arrival:"rgba(34,197,94,.1)", update:"rgba(88,166,255,.1)" };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Most";
    if (diff < 3600000) return Math.floor(diff/60000) + " perce";
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
    return d.toLocaleDateString("hu-HU",{month:"short",day:"numeric"});
  };

  // Detail view
  if (selected) return (
    <div className="win" style={{display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div className="hdr" style={{borderBottom:"1px solid var(--b)"}}>
        <button className="bk" onClick={()=>setSelected(null)}>←</button>
        <b style={{fontSize:14}}>📧 CatMail</b>
        <button onClick={()=>{setComposeTo(selected.fromId);setComposeSubject("Re: "+selected.subject);setTab("compose");setSelected(null);}} style={{marginLeft:"auto",background:"var(--bg3)",border:"1px solid var(--b2)",borderRadius:8,color:"var(--t2)",padding:"4px 10px",fontSize:11,cursor:"pointer"}}>↩ Válasz</button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:16}}>
        {/* Type badge */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <div style={{background:TYPE_BG[selected.type]||"var(--bg3)",border:`1px solid ${TYPE_COLOR[selected.type]||"var(--b)"}`,borderRadius:8,padding:"4px 10px",fontSize:12,color:TYPE_COLOR[selected.type]||"var(--t2)",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
            {TYPE_ICON[selected.type]||"✉️"} {selected.type?.replace("_"," ").toUpperCase()}
          </div>
          <span style={{fontSize:11,color:"var(--t3)"}}>{formatTime(selected.createdAt)}</span>
        </div>

        {/* Subject */}
        <div style={{fontSize:20,fontWeight:900,color:"var(--t)",marginBottom:16,lineHeight:1.3}}>{selected.subject}</div>

        {/* From */}
        <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#000",flexShrink:0}}>
            {(selected.fromName||"?")[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>{selected.fromName}</div>
            <div style={{fontSize:11,color:"var(--t3)"}}>→ {selected.toName || "Nekem"}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:16,fontSize:14,color:"var(--t2)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>
          {selected.body || selected.text || "Nincs tartalom."}
        </div>

        {/* Invoice / Order details */}
        {selected.invoiceData && (
          <div style={{background:"var(--bg2)",border:"1px solid var(--accent)",borderRadius:12,padding:16,marginTop:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--accent)",letterSpacing:".08em",marginBottom:10}}>🧾 SZÁMLA RÉSZLETEK</div>
            {Object.entries(selected.invoiceData).map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--b)",fontSize:13}}>
                <span style={{color:"var(--t3)"}}>{k}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
            <button onClick={() => {
              const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#111;padding:20px;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px}
  .logo{font-size:24px;font-weight:900;color:#f59e0b;letter-spacing:.1em}
  .invoice-num{font-family:monospace;font-size:13px;color:#666}
  .title{font-size:28px;font-weight:900;margin-bottom:6px}
  .status{display:inline-block;background:#22c55e20;color:#22c55e;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700}
  .section{background:#f8fafc;border-radius:10px;padding:16px;margin:16px 0}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0}
  .row:last-child{border:none}
  .label{color:#666;font-size:13px}
  .value{font-weight:600;font-size:13px}
  .footer{text-align:center;color:#999;font-size:11px;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px}
</style></head><body>
<div class="header">
  <div class="logo">⬡ OILTRADE SHOP</div>
  <div class="invoice-num">${selected.invoiceData["Tranzakció ID"] || selected.invoiceData["Számlaszám"] || "INV-12345"}</div>
</div>
<div class="title">Digitális Nyugta / Számla</div>
<div class="status">✓ Sikeres Tranzakció</div>
<div class="section">
  ${Object.entries(selected.invoiceData).map(([k,v]) => `<div class="row"><span class="label">${k}</span><span class="value">${v}</span></div>`).join('')}
</div>
<div class="footer">OilTrade WebShop • Automatikusan generált számla • ${new Date().toLocaleDateString("hu-HU")}</div>
</body></html>`;
              const blob = new Blob([html], {type:"text/html"});
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `Szamla-${selected.invoiceData["Tranzakció ID"] || "Nyugta"}.html`;
              a.click(); URL.revokeObjectURL(url);
            }} style={{
              width:"100%",marginTop:12,background:"rgba(245,158,11,.15)",border:"1px solid var(--accent)",
              borderRadius:8,color:"var(--accent)",padding:"10px",fontSize:12,fontWeight:700,cursor:pointer
            }}>
              ⬇ Nyugta Letöltése (Digital PDF Receipt)
            </button>
          </div>
        )}

        {/* Delivery tracking */}
        {selected.deliveryData && (
          <div style={{background:"var(--bg2)",border:"1px solid #f97316",borderRadius:12,padding:16,marginTop:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#f97316",letterSpacing:".08em",marginBottom:10}}>📦 SZÁLLÍTÁS KÖVETÉS</div>
            {Object.entries(selected.deliveryData).map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--b)",fontSize:13}}>
                <span style={{color:"var(--t3)"}}>{k}</span>
                <span style={{fontWeight:600,color:k==="Állapot"?"var(--green)":"var(--t)"}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trade offer action */}
        {selected.type === "trade_offer" && (
          <div style={{marginTop:16,display:"flex",gap:10}}>
            <button style={{flex:1,padding:12,background:"var(--green)",color:"#000",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>✓ Elfogadás</button>
            <button style={{flex:1,padding:12,background:"var(--bg3)",border:"1px solid var(--b2)",color:"var(--t2)",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>✕ Elutasítás</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="win" style={{display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      {/* Header */}
      <div className="hdr" style={{borderBottom:"1px solid var(--b)"}}>
        <button className="bk" onClick={onClose}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15,display:"flex",alignItems:"center",gap:8}}>
            📧 CatMail
            {unread > 0 && <span style={{background:"var(--blue)",color:"#000",borderRadius:20,padding:"2px 7px",fontSize:11,fontWeight:800}}>{unread}</span>}
          </div>
          <div style={{fontSize:10,color:"var(--t3)"}}>OilTrade Belső Postafiók</div>
        </div>
        <button onClick={()=>setTab("compose")} style={{background:"var(--blue)",border:"none",borderRadius:8,color:"#000",padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✏️ Írás</button>
      </div>

      {/* Search */}
      <div style={{padding:"8px 14px",borderBottom:"1px solid var(--b)"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Keresés..."
          style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"7px 12px",color:"var(--t)",fontSize:13}}/>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{borderBottom:"1px solid var(--b)"}}>
        {[["inbox","📥 Beérkező"],["sent","📤 Elküldött"],["compose","✏️ Írás"]].map(([id,l])=>(
          <button key={id} className={"tab"+(tab===id?" on":"")} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto"}}>

        {/* INBOX / SENT */}
        {(tab==="inbox"||tab==="sent") && (
          <div>
            {filtered.length === 0 && (
              <div style={{textAlign:"center",padding:50,color:"var(--t3)"}}>
                <div style={{fontSize:36,marginBottom:10}}>📭</div>
                <div>Nincs levél</div>
              </div>
            )}
            {filtered.map(email=>(
              <div key={email.id} onClick={()=>openEmail(email)} style={{
                padding:"12px 14px",borderBottom:"1px solid var(--b)",cursor:"pointer",
                background:email.read?"transparent":"rgba(88,166,255,.04)",
                display:"flex",gap:12,alignItems:"flex-start"
              }}>
                {/* Icon */}
                <div style={{width:40,height:40,borderRadius:10,background:TYPE_BG[email.type]||"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,border:`1px solid ${TYPE_COLOR[email.type]||"var(--b)"}`}}>
                  {TYPE_ICON[email.type]||"✉️"}
                </div>
                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <div style={{fontSize:13,fontWeight:email.read?500:700,color:"var(--t)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%"}}>
                      {tab==="sent"?email.toName:email.fromName}
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)",flexShrink:0}}>{formatTime(email.createdAt)}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:email.read?400:600,color:email.read?"var(--t2)":"var(--t)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>
                    {email.subject}
                  </div>
                  <div style={{fontSize:12,color:"var(--t3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {email.body||email.text||""}
                  </div>
                </div>
                {!email.read && <div style={{width:8,height:8,borderRadius:"50%",background:"var(--blue)",flexShrink:0,marginTop:6}}/>}
              </div>
            ))}
          </div>
        )}

        {/* COMPOSE */}
        {tab==="compose" && (
          <div style={{padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>✏️ Új levél</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>CÍMZETT (User ID)</div>
              <input value={composeTo} onChange={e=>setComposeTo(e.target.value)} placeholder="Felhasználó ID-je..."
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:13}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>TÁRGY</div>
              <input value={composeSubject} onChange={e=>setComposeSubject(e.target.value)} placeholder="Tárgy..."
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:13}}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>ÜZENET</div>
              <textarea value={composeBody} onChange={e=>setComposeBody(e.target.value)} placeholder="Írd ide az üzenetet..."
                style={{width:"100%",minHeight:160,background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:13,resize:"vertical",fontFamily:"inherit",lineHeight:1.6}}/>
            </div>
            <button onClick={sendEmail} disabled={sending||!composeTo||!composeSubject} style={{
              width:"100%",padding:14,background:"var(--blue)",color:"#000",border:"none",
              borderRadius:10,fontWeight:800,fontSize:14,cursor:"pointer"
            }}>
              {sending?"Küldés...":"📤 Küldés"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
