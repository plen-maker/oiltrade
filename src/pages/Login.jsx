import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const STARS = Array.from({length:20},(_,i)=>({left:`${(i*67+13)%100}%`,top:`${(i*43+7)%60}%`,op:0.12+(i%6)*0.04}));

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!email||!pw) { setErr("Töltsd ki mindkét mezőt!"); return; }
    setBusy(true); setErr("");
    try {
      await login(email, pw);
    } catch(e) {
      const m={
        "auth/user-not-found":"Nem találunk ilyen fiókot.",
        "auth/wrong-password":"Hibás jelszó.",
        "auth/invalid-credential":"Hibás email vagy jelszó.",
        "auth/too-many-requests":"Túl sok próbálkozás.",
      };
      setErr(m[e.code]||"Hiba. Próbáld újra.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,background:"linear-gradient(180deg,#030912,#060f1e 60%,#040c18)",position:"relative",overflow:"hidden" }}>
      {STARS.map((s,i)=><div key={i} style={{ position:"absolute",left:s.left,top:s.top,width:1,height:1,borderRadius:"50%",background:"#fff",opacity:s.op }} />)}

      {/* Forest bg */}
      <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:"40%",opacity:.22 }} viewBox="0 0 390 220" preserveAspectRatio="none">
        <path d="M0,220 L0,120 L70,60 L140,100 L200,40 L270,80 L340,20 L390,55 L390,220 Z" fill="#0d1f38"/>
        <path d="M0,220 L0,160 L50,115 L110,145 L170,85 L240,130 L310,80 L390,115 L390,220 Z" fill="#08152a"/>
        {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380].map((x,i)=>(
          <polygon key={i} points={`${x},220 ${x-9},${220-28-(i%3)*10} ${x+9},${220-28-(i%3)*10}`} fill="#040b18"/>
        ))}
      </svg>

      <div style={{ position:"relative",width:"100%",maxWidth:340 }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#4a9eff18,#0d1626)",border:"1px solid var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 14px",boxShadow:"0 0 36px #4a9eff18" }}>⛽</div>
          <div style={{ fontSize:30,fontWeight:900,letterSpacing:".1em",color:"var(--t)" }}>OILTRADE</div>
          <div style={{ fontSize:11,color:"var(--t3)",marginTop:4,letterSpacing:".1em" }}>V3 — PLATFORM</div>
        </div>

        <div style={{ marginBottom:10 }}>
          <label className="fl">Email</label>
          <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="pelda@email.com" onKeyDown={e=>e.key==="Enter"&&go()} />
        </div>
        <div style={{ marginBottom:18 }}>
          <label className="fl">Jelszó</label>
          <input className="inp" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()} />
        </div>

        {err && <div className="fi" style={{ background:"var(--red-d)",border:"1px solid #e0555530",borderRadius:9,padding:"8px 12px",color:"var(--red)",fontSize:12,marginBottom:12 }}>⚠ {err}</div>}

        <button className="btn full" onClick={go} disabled={busy} style={{ padding:13 }}>
          {busy ? <><div className="spin" style={{ width:15,height:15,borderWidth:2,borderTopColor:"#000" }}/> Belépés...</> : "Bejelentkezés →"}
        </button>

        <p style={{ marginTop:18,fontSize:11,color:"var(--t3)",textAlign:"center",lineHeight:1.7 }}>
          A fiókodat az admin hozza létre.<br/>Nincs regisztrációs lehetőség.
        </p>
      </div>
    </div>
  );
}
