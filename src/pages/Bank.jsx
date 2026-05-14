
function InvoiceList({ userId }) {
  const invoices = useInvoices(userId);
  if (invoices.length === 0) return (
    <div style={{ textAlign:"center",paddingTop:40 }}>
      <div style={{ fontSize:40,marginBottom:12 }}>🧾</div>
      <div style={{ color:"var(--t3)",fontSize:13 }}>Nincs számlád még.</div>
    </div>
  );
  return (
    <div>
      {invoices.map(inv => {
        const isBuyer = inv.buyerId === userId;
        return (
          <div key={inv.id} style={{ background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:14,padding:14,marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div>
                <div style={{ fontSize:10,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:3 }}>{inv.invoiceNumber}</div>
                <div style={{ fontSize:13,fontWeight:700 }}>{inv.product}</div>
                {inv.oilType&&<div style={{ fontSize:11,color:"var(--t3)" }}>{inv.oilType}</div>}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:22,fontWeight:900,color:isBuyer?"var(--red)":"var(--green)",fontFamily:"'JetBrains Mono',monospace" }}>
                  {isBuyer?"-":"+"}${inv.amount}
                </div>
                <span className={`bdg ${isBuyer?"red":"green"}`}>{isBuyer?"Vásárló":"Eladó"}</span>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,background:"var(--bg)",borderRadius:9,padding:"9px 12px" }}>
              <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>PARTNER</div><div style={{ fontSize:12 }}>{isBuyer?inv.sellerName:inv.buyerName}</div></div>
              <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>FIZETÉS</div><div style={{ fontSize:12 }}>{inv.payMethod}</div></div>
              <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>DÁTUM</div><div style={{ fontSize:11,fontFamily:"'JetBrains Mono',monospace" }}>{inv.createdAt?.slice(0,10)}</div></div>
              <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>STÁTUSZ</div><span className="bdg green">Fizetve</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { useInvoices } from "../hooks/useFirestore";

export function BankApp({ profile, cards, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("home");
  const [flipped, setFlipped] = useState({});

  const tryPin = (p) => {
    if (p === (profile?.bankPin||"1234")) { setUnlocked(true); setErr(""); }
    else { setErr("Hibás PIN"); setPin(""); }
  };

  const add = (d) => {
    if (pin.length>=4) return;
    const np = pin+d;
    setPin(np);
    if (np.length===4) setTimeout(()=>tryPin(np),150);
  };

  if (!unlocked) return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>💳 TradeBank</b></div>
      <div className="sc" style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingTop:50 }}>
        <div style={{ fontSize:44,marginBottom:18 }}>🔒</div>
        <div style={{ fontSize:17,fontWeight:700,marginBottom:5 }}>PIN kód</div>
        <div style={{ fontSize:12,color:"var(--t3)",marginBottom:28 }}>Add meg a 4 jegyű PIN kódodat</div>
        <div style={{ display:"flex",gap:14,marginBottom:36 }}>
          {[1,2,3,4].map(i=><div key={i} className={`pin-dot${pin.length>=i?" on":""}`} />)}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,width:230 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
            <button key={i} className="pkey" style={{ visibility:k===""?"hidden":"visible" }}
              onClick={()=>{if(k==="⌫")setPin(p=>p.slice(0,-1));else if(k!=="")add(String(k));}}>
              {k}
            </button>
          ))}
        </div>
        {err&&<div className="fi" style={{ color:"var(--red)",fontSize:12,marginTop:14 }}>{err}</div>}
        <div style={{ marginTop:16,fontSize:11,color:"var(--t3)" }}>Default PIN: 1234</div>
      </div>
    </div>
  );

  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}><b>💳 TradeBank</b></div>
        <button onClick={()=>setUnlocked(false)} style={{ background:"none",border:"none",color:"var(--t3)",fontSize:12,cursor:"pointer" }}>🔒 Zár</button>
      </div>
      <div className="tabs">
        {[["home","🏠"],["cards","💳"],["invoices","🧾"],["info","ℹ️"]].map(([id,e])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{e} {id==="home"?"Főoldal":id==="cards"?"Kártyák":id==="invoices"?"Számlák":"Info"}</button>
        ))}
      </div>
      <div style={{ overflow:"auto",height:"calc(100% - 118px)",padding:14 }}>
        {tab==="home"&&(
          <>
            {/* Balance */}
            <div style={{ background:"linear-gradient(135deg,#0a1826,#060d16)",border:"1px solid #4a9eff22",borderRadius:18,padding:22,marginBottom:14,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle,#4a9eff08,transparent)" }} />
              <div style={{ fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".12em",marginBottom:7 }}>Egyenleg</div>
              <div style={{ fontSize:42,fontWeight:900,color:"var(--blue)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1 }}>${(profile?.balance||0).toLocaleString()}</div>
              <div style={{ color:"var(--t2)",marginTop:12,fontSize:13 }}>{profile?.name}</div>
              <div style={{ fontSize:11,color:"var(--t3)",marginTop:2 }}>{profile?.email}</div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14 }}>
              <div className="card" style={{ margin:0 }}><div style={{ fontSize:10,color:"var(--t3)",marginBottom:5,textTransform:"uppercase" }}>Kártyák</div><div style={{ fontSize:22,fontWeight:800 }}>{cards.length}</div></div>
              <div className="card" style={{ margin:0 }}><div style={{ fontSize:10,color:"var(--t3)",marginBottom:5,textTransform:"uppercase" }}>Státusz</div><div style={{ fontSize:12,fontWeight:700,color:"var(--green)" }}>● Aktív</div></div>
            </div>
            {cards.slice(0,1).map(c=><MiniCard key={c.id} card={c} />)}
          </>
        )}
        {tab==="cards"&&(
          cards.length===0?(
            <div style={{ textAlign:"center",paddingTop:40 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>💳</div>
              <div style={{ color:"var(--t3)",fontSize:13 }}>Nincs kártyád.<br/>Az admin ad ki egyet.</div>
            </div>
          ):cards.map(c=>(
            <div key={c.id} style={{ marginBottom:20 }}>
              <BankCard card={c} flipped={!!flipped[c.id]} onFlip={()=>setFlipped(f=>({...f,[c.id]:!f[c.id]}))} />
            </div>
          ))
        )}
        {tab==="invoices"&&(
          <InvoiceList userId={profile?.id} />
        )}
        {tab==="info"&&(
          <div className="card">
            <div style={{ fontSize:13,fontWeight:600,marginBottom:12 }}>Fiók adatok</div>
            <div style={{ fontSize:12,color:"var(--t3)",lineHeight:2 }}>
              <div>👤 {profile?.name}</div>
              <div>📧 {profile?.email}</div>
              <div>📍 {profile?.location}</div>
              <div>🏦 TradeBank V3</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ card }) {
  return (
    <div className="card" style={{ display:"flex",alignItems:"center",gap:10,margin:0 }}>
      <div style={{ width:38,height:24,borderRadius:4,background:`linear-gradient(135deg,${card.color1||"#4a9eff"},${card.color2||"#060d16"})`,flexShrink:0 }} />
      <div><div style={{ fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono',monospace" }}>•••• {card.last4}</div><div style={{ fontSize:10,color:"var(--t3)" }}>{card.bank}</div></div>
      <div style={{ marginLeft:"auto",fontSize:11,color:"var(--t3)" }}>{card.expiry}</div>
    </div>
  );
}

function BankCard({ card, flipped, onFlip }) {
  const c1 = card.color1||"#0a1a3a";
  const c2 = card.color2||"#060d1e";
  if (!flipped) return (
    <div onClick={onFlip} style={{ background:`linear-gradient(135deg,${c1},${c2})`,border:`1px solid ${c1}66`,borderRadius:18,padding:22,position:"relative",overflow:"hidden",cursor:"pointer" }}>
      <div style={{ position:"absolute",top:-25,right:-25,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${c1}20,transparent)` }} />
      <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:22,letterSpacing:".12em",textTransform:"uppercase" }}>TradeBank</div>
      <div style={{ fontSize:17,fontFamily:"'JetBrains Mono',monospace",color:"#fff",letterSpacing:3,marginBottom:18 }}>•••• •••• •••• {card.last4}</div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div><div style={{ fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:2,letterSpacing:".08em" }}>KÁRTYABIRTOKOS</div><div style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{card.holderName}</div></div>
        <div style={{ textAlign:"right" }}><div style={{ fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:2,letterSpacing:".08em" }}>LEJÁRAT</div><div style={{ fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#fff" }}>{card.expiry}</div></div>
      </div>
      <div style={{ fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:10,textAlign:"right" }}>Koppints a CVV-ért</div>
    </div>
  );
  return (
    <div onClick={onFlip} style={{ background:`linear-gradient(135deg,${c1},${c2})`,border:`1px solid ${c1}66`,borderRadius:18,padding:22,cursor:"pointer" }}>
      <div style={{ height:32,background:"rgba(0,0,0,0.55)",borderRadius:4,marginBottom:18 }} />
      <div style={{ display:"flex",justifyContent:"flex-end",alignItems:"center",gap:14 }}>
        <div style={{ height:28,flex:1,background:"rgba(255,255,255,0.07)",borderRadius:3 }} />
        <div style={{ background:"rgba(255,255,255,0.13)",borderRadius:6,padding:"5px 12px" }}>
          <div style={{ fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:1 }}>CVV</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",color:"#fff",fontSize:16,fontWeight:700 }}>{card.cvv}</div>
        </div>
      </div>
      <div style={{ fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:14,textAlign:"right" }}>Koppints a kártya előlapjáért</div>
    </div>
  );
}
