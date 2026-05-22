import { useState, useEffect, useRef } from "react";
import { LOCATIONS, OIL_TYPES, FLIGHT_DURATION } from "../data/constants";
import { createOffer, updateUser } from "../hooks/useFirestore";
import { F, Modal } from "../components/UI";

// ─── FLIGHT ───────────────────────────────────────────────────────────────────
export function FlightApp({ profile, onClose, onLocationChange }) {
  const [to, setTo] = useState("");
  const [flying, setFlying] = useState(false);
  const [left, setLeft] = useState(FLIGHT_DURATION);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  const start = () => {
    if (!to) return;
    setFlying(true);
    setLeft(FLIGHT_DURATION);
    timer.current = setInterval(() => {
      setLeft(t => {
        if (t <= 1) {
          clearInterval(timer.current);
          updateUser(profile.id, { location: to });
          onLocationChange(to);
          setFlying(false);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const prog = ((FLIGHT_DURATION - left) / FLIGHT_DURATION) * 100;
  const available = LOCATIONS.filter(l => l !== profile?.location);

  if (done) return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>✈️ Megérkeztél!</b></div>
      <div className="sc" style={{ textAlign:"center",paddingTop:60 }}>
        <div style={{ fontSize:56,marginBottom:16,animation:"float 2s ease-in-out infinite" }}>✈️</div>
        <div style={{ fontSize:20,fontWeight:800,marginBottom:8 }}>Jó utat!</div>
        <div style={{ color:"var(--blue)",fontSize:15,marginBottom:20 }}>{profile?.location} → {to}</div>
        <button className="btn" onClick={onClose}>Főoldalra</button>
      </div>
    </div>
  );

  if (flying) return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>✈️ Repülés folyamatban</b></div>
      <div className="sc" style={{ textAlign:"center",paddingTop:32 }}>
        {/* Plane animation strip */}
        <div style={{ position:"relative",height:70,marginBottom:24,background:"var(--bg2)",borderRadius:12,overflow:"hidden",border:"1px solid var(--b)" }}>
          <div style={{ position:"absolute",top:"50%",left:0,right:0,height:1,background:"var(--b2)",transform:"translateY(-50%)" }}/>
          <div style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",fontSize:28,
            animation:`planefly ${FLIGHT_DURATION}s linear forwards` }}>✈️</div>
          <div style={{ position:"absolute",bottom:4,left:10,fontSize:10,color:"var(--t3)" }}>{profile?.location}</div>
          <div style={{ position:"absolute",bottom:4,right:10,fontSize:10,color:"var(--t3)" }}>{to}</div>
        </div>

        <div style={{ fontSize:56,fontWeight:900,color:"var(--blue)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1,marginBottom:6 }}>
          {Math.floor(left/60)>0?`${Math.floor(left/60)}:${(left%60).toString().padStart(2,"0")}`:left}
        </div>
        <div style={{ fontSize:13,color:"var(--t3)",marginBottom:24 }}>másodperc hátra</div>

        <div className="card">
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:12 }}>
            <span style={{ color:"var(--blue)",fontWeight:600 }}>{profile?.location}</span>
            <span style={{ color:"var(--t3)" }}>{Math.round(prog)}%</span>
            <span style={{ color:"var(--blue2)",fontWeight:600 }}>{to}</span>
          </div>
          <div className="pt" style={{ height:8,borderRadius:6 }}>
            <div className="pf" style={{ width:`${prog}%`,height:"100%",borderRadius:6,transition:"width 1s linear" }} />
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10,color:"var(--t3)" }}>
            <span>🛫 Felszállt</span><span>🛬 Leszállás</span>
          </div>
        </div>
        <div style={{ fontSize:11,color:"var(--t3)",marginTop:8 }}>Bezárható, a repülés folytatódik...</div>
      </div>
    </div>
  );

  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div><div style={{ fontWeight:700,fontSize:15 }}>✈️ Repülő</div><div style={{ fontSize:11,color:"var(--t3)" }}>Jelenlegi: {profile?.location}</div></div>
      </div>
      <div className="sc">
        <div style={{ background:"linear-gradient(135deg,#0a1a3a,#060d1e)",border:"1px solid var(--b2)",borderRadius:16,padding:20,marginBottom:20,textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:10 }}>🗺</div>
          <div style={{ fontSize:12,color:"var(--t3)",marginBottom:4 }}>Jelenlegi helyszín</div>
          <div style={{ fontSize:18,fontWeight:800,color:"var(--blue)" }}>{profile?.location}</div>
        </div>

        <F label="Célállomás">
          <select className="inp" value={to} onChange={e=>setTo(e.target.value)}>
            <option value="">— Válassz célállomást —</option>
            {available.map(l=><option key={l}>{l}</option>)}
          </select>
        </F>

        {to && (
          <div className="fi card" style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
            <span style={{ color:"var(--blue)",fontWeight:700,fontSize:12 }}>{profile?.location}</span>
            <div style={{ flex:1,height:1,background:"linear-gradient(90deg,var(--blue),var(--b2))",position:"relative" }}>
              <span style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"float 2s ease-in-out infinite" }}>✈</span>
            </div>
            <span style={{ color:"var(--blue2)",fontWeight:700,fontSize:12 }}>{to}</span>
          </div>
        )}

        {to && <div style={{ fontSize:11,color:"var(--t3)",marginBottom:14,textAlign:"center" }}>⏱ Repülési idő: ~{FLIGHT_DURATION} mp</div>}

        <button className="btn full" onClick={start} disabled={!to}>Repülő foglalása ✈</button>

        <div style={{ marginTop:18 }}>
          <div style={{ fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>Helyszínek</div>
          {LOCATIONS.map(l=>(
            <div key={l} onClick={()=>l!==profile?.location&&setTo(l)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,marginBottom:5,
              background:to===l?"var(--blue-d)":l===profile?.location?"var(--bg3)":"var(--bg2)",
              border:`1px solid ${to===l?"var(--blue)":l===profile?.location?"var(--b2)":"var(--b)"}`,
              cursor:l===profile?.location?"default":"pointer",
            }}>
              <span style={{ fontSize:14 }}>{l===profile?.location?"📍":to===l?"🎯":"○"}</span>
              <span style={{ fontSize:13,fontWeight:l===profile?.location?600:400,color:l===profile?.location?"var(--t3)":"var(--t)" }}>{l}</span>
              {l===profile?.location&&<span className="bdg dim" style={{ marginLeft:"auto" }}>Jelenlegi</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TRADE ────────────────────────────────────────────────────────────────────
export function TradeApp({ profile, users, serials, onClose }) {
  const [step, setStep] = useState("main");
  const [toId, setToId] = useState("");
  const [form, setForm] = useState({ name:"",type:"",other:"",serial:"",price:"" });
  const [sv, setSv] = useState(null); // serial valid
  const [sPhoto, setSPhoto] = useState(null);
  const [pPhoto, setPPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sRef = useRef(); const pRef = useRef();

  const others = users.filter(u=>u.id!==profile?.id);
  const codes = serials.map(s=>s.code);

  const checkSerial = v => {
    setForm(f=>({...f,serial:v}));
    setSv(v.length>2 ? codes.includes(v) : null);
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const canSend = toId && form.name && form.type && form.price;

  const send = async () => {
    if (!canSend) return;
    setBusy(true); setErr("");
    try {
      const toUser = users.find(u=>u.id===toId);
      await createOffer({
        fromId:profile.id, fromName:profile.name, fromLocation:profile.location,
        toId, toName:toUser?.name,
        productName:form.name, oilType:form.type, otherOil:form.other,
        serialNumber:form.serial, serialValid:sv===true,
        price:Number(form.price),
      });
      setStep("sent");
    } catch(e) {
      console.error(e);
      setErr("Hiba a küldésnél: "+e.message);
    } finally { setBusy(false); }
  };

  if (step==="main") return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button>
        <div><div style={{ fontWeight:700,fontSize:15 }}>⛽ OilTrade</div><div style={{ fontSize:11,color:"var(--t3)" }}>📍 {profile?.location}</div></div>
      </div>
      <div className="sc" style={{ textAlign:"center" }}>
        <div style={{ paddingTop:40,marginBottom:32 }}>
          <div style={{ fontSize:60,marginBottom:14,animation:"float 3s ease-in-out infinite" }}>⛽</div>
          <div style={{ fontSize:22,fontWeight:900,marginBottom:4 }}>OilTrade</div>
          <div style={{ fontSize:13,color:"var(--t3)" }}>Kereskedj olajjal a platformon</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:260,margin:"0 auto" }}>
          <button className="btn" onClick={()=>setStep("send")}>📦 Ajánlat küldése</button>
          <div style={{ background:"var(--bg3)",border:"1px solid var(--b2)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--t3)" }}>
            💰 ${(profile?.balance||0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  if (step==="sent") return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button></div>
      <div className="sc" style={{ textAlign:"center",paddingTop:60 }}>
        <div style={{ fontSize:56,marginBottom:16 }}>📨</div>
        <div style={{ fontSize:20,fontWeight:800,marginBottom:8 }}>Ajánlat elküldve!</div>
        <div style={{ color:"var(--t3)",fontSize:13,marginBottom:24 }}>A fogadó fél értesítést kap.</div>
        <button className="btn" onClick={()=>{setStep("main");setToId("");setForm({name:"",type:"",other:"",serial:"",price:""});setSv(null);setSPhoto(null);setPPhoto(null);}}>Új ajánlat</button>
      </div>
    </div>
  );

  return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={()=>setStep("main")}>←</button><b>📦 Ajánlat küldése</b></div>
      <div className="sc">
        <F label="Fogadó fél">
          <select className="inp" value={toId} onChange={e=>setToId(e.target.value)}>
            <option value="">— Válassz felhasználót —</option>
            {others.map(u=><option key={u.id} value={u.id}>{u.name} ({u.location})</option>)}
          </select>
        </F>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <F label="Termék neve"><input className="inp" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="pl. Tartály #3" /></F>
          <F label="Ár (USD)"><input className="inp" type="number" value={form.price} onChange={e=>f("price",e.target.value)} placeholder="0" /></F>
        </div>
        <F label="Olaj típusa">
          <select className="inp" value={form.type} onChange={e=>f("type",e.target.value)}>
            <option value="">— Típus —</option>
            {OIL_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </F>
        {form.type==="Egyéb"&&<F label="Leírás"><input className="inp" value={form.other} onChange={e=>f("other",e.target.value)} placeholder="Írd le..." /></F>}
        <F label="Serial szám (cimke)">
          <input className="inp" value={form.serial} onChange={e=>checkSerial(e.target.value)} placeholder="pl. SN-1001" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
          {sv!==null&&<div className="fi" style={{ fontSize:11,marginTop:3,color:sv?"var(--green)":"var(--red)" }}>{sv?"✓ Érvényes":"✗ Ismeretlen serial"}</div>}
        </F>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
          <div>
            <label className="fl">Cimke fotó</label>
            <input ref={sRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setSPhoto(e.target.files[0]); }} />
            <div className={`photo${sPhoto?" done":""}`} onClick={()=>sRef.current?.click()}>{sPhoto?"✓ Feltöltve":"📷 Fotó"}</div>
          </div>
          <div>
            <label className="fl">Termék fotó</label>
            <input ref={pRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]) setPPhoto(e.target.files[0]); }} />
            <div className={`photo${pPhoto?" done":""}`} onClick={()=>pRef.current?.click()}>{pPhoto?"✓ Feltöltve":"📷 Fotó"}</div>
          </div>
        </div>
        {err&&<div style={{ color:"var(--red)",fontSize:12,marginBottom:10,background:"var(--red-d)",borderRadius:8,padding:"8px 12px" }}>⚠ {err}</div>}
        {!canSend&&<div style={{ fontSize:11,color:"var(--t3)",marginBottom:8,textAlign:"center" }}>Fogadó fél, termék, típus és ár kötelező</div>}
        <button className="btn full" onClick={send} disabled={!canSend||busy}>{busy?"Küldés...":"Ajánlat küldése →"}</button>
      </div>
    </div>
  );
}
