import { CAT_LOGO } from '../data/catLogo';
import { useState, useEffect } from "react";

function useTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return t;
}

// Deterministic stars so they don't re-render
const STARS = Array.from({ length: 45 }, (_, i) => ({
  left: `${(i * 73 + 17) % 100}%`,
  top: `${(i * 41 + 11) % 55}%`,
  size: i % 7 === 0 ? 2 : 1,
  opacity: 0.15 + (i % 8) * 0.05,
}));

function ForestBg({ opacity = 0.35 }) {
  return (
    <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", height:"50%", opacity }} viewBox="0 0 390 300" preserveAspectRatio="none">
      <path d="M0,300 L0,160 L80,90 L160,140 L220,70 L290,110 L360,50 L390,80 L390,300 Z" fill="#0d1f38" />
      <path d="M0,300 L0,210 L60,155 L120,190 L180,120 L250,165 L320,105 L390,145 L390,300 Z" fill="#08152a" />
      <path d="M0,300 L0,260 L390,260 L390,300 Z" fill="#060f20" />
      {[0,18,36,54,72,90,108,126,144,162,180,198,216,234,252,270,288,306,324,342,360,378].map((x,i) => (
        <polygon key={i} points={`${x},300 ${x-10},${300-35-(i%4)*12} ${x+10},${300-35-(i%4)*12}`} fill="#040c1a" />
      ))}
    </svg>
  );
}

export function LockScreen({ onUnlock, pendingOffers }) {
  const time = useTime();
  const days = ["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"];
  const months = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];

  return (
    <div onClick={onUnlock} style={{
      position:"absolute", inset:0, zIndex:300,
      background:"linear-gradient(180deg,#020810 0%,#050c18 60%,#030a14 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      cursor:"pointer", overflow:"hidden",
    }}>
      {STARS.map((s,i) => <div key={i} style={{ position:"absolute",left:s.left,top:s.top,width:s.size,height:s.size,borderRadius:"50%",background:"#fff",opacity:s.opacity }} />)}
      <ForestBg opacity={0.3} />

      <div style={{ textAlign:"center", marginBottom:44, position:"relative" }}>
        <img src={CAT_LOGO} alt="logo" style={{ width:64,height:64,borderRadius:"50%",objectFit:"cover",boxShadow:"0 0 24px rgba(88,166,255,0.35)",marginBottom:16 }} />
        <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:88, fontWeight:400, color:"#fff", lineHeight:1, letterSpacing:-3, textShadow:"0 0 40px rgba(74,158,255,0.2)" }}>
          {time.getHours().toString().padStart(2,"0")}:{time.getMinutes().toString().padStart(2,"0")}
        </div>
        <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginTop:8 }}>
          {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}.
        </div>
      </div>

      {pendingOffers > 0 && (
        <div style={{ background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:16,padding:"12px 16px",margin:"0 28px",display:"flex",alignItems:"center",gap:12,width:"calc(100%-56px)",maxWidth:340 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"#4a9eff18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>⛽</div>
          <div>
            <div style={{ fontSize:12,fontWeight:600 }}>OilTrade</div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.45)" }}>{pendingOffers} új ajánlat vár</div>
          </div>
        </div>
      )}

      <div style={{ position:"absolute",bottom:44,fontSize:11,color:"rgba(255,255,255,0.25)",letterSpacing:".12em",animation:"pulse 2s infinite" }}>
        CSÚSZTATÁS ↑
      </div>
    </div>
  );
}

const APPS = [
  { id:"trade",    e:"⛽", l:"OilTrade",   bg:"#0d1a06,#060e03" },
  { id:"offers",   e:"📨", l:"Ajánlatok",  bg:"#0a1a3a,#060d1e", b:"offers" },
  { id:"delivery", e:"🚚", l:"Szállítás",  bg:"#0a1e10,#060d08", b:"delivery" },
  { id:"bank",     e:"💳", l:"Bank",       bg:"#0a1626,#060d14" },
  { id:"browser",  e:"🌐", l:"Browser",    bg:"#0a1a3a,#060d1e" },
  { id:"builder",  e:"🛠", l:"WebBuilder", bg:"#160a3a,#0a0620" },
  { id:"flight",   e:"✈️", l:"Repülő",     bg:"#0a1a3a,#060d1e" },
  { id:"messages", e:"💬", l:"Üzenetek",   bg:"#1a0a28,#0d0616", b:"messages" },
  { id:"profile",  e:"👤", l:"Profil",     bg:"#141414,#0a0a0a" },
  { id:"admin",    e:"⚙️", l:"Admin",      bg:"#280a0a,#160505", admin:true },
  { id:"cattinder", e:"🐱", l:"Cat Tinder",  bg:"#2a1a0a,#160a05" },
];

const DOCK = ["trade","offers","bank","profile"];

export function HomeScreen({ profile, pendingOffers, activeDeliveries, unreadMsgs, onOpenApp }) {
  const isAdmin = profile?.role === "admin";
  const visible = APPS.filter(a => !a.admin || isAdmin);

  const badge = (a) => {
    if (a.b === "offers" && pendingOffers > 0) return pendingOffers;
    if (a.b === "delivery" && activeDeliveries > 0) return activeDeliveries;
    if (a.b === "messages" && unreadMsgs > 0) return unreadMsgs;
    return 0;
  };

  return (
    <div style={{ width:"100%",height:"100%",position:"relative",overflow:"hidden",background:"linear-gradient(180deg,#030912 0%,#060f1e 50%,#040c18 100%)" }}>
      {STARS.map((s,i) => <div key={i} style={{ position:"absolute",left:s.left,top:s.top,width:s.size,height:s.size,borderRadius:"50%",background:"#fff",opacity:s.opacity }} />)}
      <ForestBg opacity={0.3} />

      {/* Greeting — NO fake status bar */}
      <div style={{ position:"absolute",top:0,left:0,right:0,padding:"max(16px,env(safe-area-inset-top,16px)) 22px 0" }}>
        <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)" }}>Üdv,</div>
        <div style={{ fontSize:19,fontWeight:800,color:"#fff" }}>{profile?.name} 👋</div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1 }}>📍 {profile?.location}</div>
      </div>

      {/* App grid */}
      <div style={{ position:"absolute",top:105,left:0,right:0,padding:"0 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px 6px" }}>
        {visible.map((app,i) => {
          const b = badge(app);
          return (
            <div key={app.id} className={`fu s${Math.min(i+1,6)}`} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer" }} onClick={() => onOpenApp(app.id)}>
              <div style={{ width:58,height:58,borderRadius:15,background:`linear-gradient(135deg,#${app.bg})`,border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:25,position:"relative",boxShadow:"0 4px 16px rgba(0,0,0,.45)" }}>
                {app.e}
                {b > 0 && <div style={{ position:"absolute",top:-4,right:-4,background:"#e05555",color:"#fff",fontSize:9,fontWeight:700,minWidth:15,height:15,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px" }}>{b}</div>}
              </div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,0.7)",textAlign:"center",textShadow:"0 1px 4px rgba(0,0,0,.8)",fontWeight:500 }}>{app.l}</div>
            </div>
          );
        })}
      </div>

      {/* Dock */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:`10px 18px max(18px,env(safe-area-inset-bottom,18px))`,background:"linear-gradient(0deg,rgba(3,9,18,.96),transparent)" }}>
        <div style={{ background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:24,padding:"9px 14px",display:"flex",justifyContent:"space-around" }}>
          {DOCK.map(id => {
            const a = APPS.find(x => x.id === id);
            if (!a) return null;
            return <div key={id} onClick={() => onOpenApp(id)} style={{ width:50,height:50,borderRadius:13,background:`linear-gradient(135deg,#${a.bg})`,border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,cursor:"pointer" }}>{a.e}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
