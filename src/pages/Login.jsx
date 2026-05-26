import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const STARS = Array.from({length:20},(_,i)=>({left:`${(i*67+13)%100}%`,top:`${(i*43+7)%60}%`,op:0.12+(i%6)*0.04}));

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const googleGo = async () => {
    setBusy(true); setErr("");
    try {
      await loginWithGoogle();
    } catch(e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

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

        {/* Google Sign-In */}
        <button onClick={googleGo} disabled={busy} style={{ width:"100%",padding:"13px 0",background:"#fff",color:"#333",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12,fontFamily:"inherit" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Folytatás Google fiókkal
        </button>

        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
          <div style={{ flex:1,height:1,background:"var(--b)" }}/>
          <span style={{ fontSize:11,color:"var(--t3)" }}>vagy</span>
          <div style={{ flex:1,height:1,background:"var(--b)" }}/>
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
