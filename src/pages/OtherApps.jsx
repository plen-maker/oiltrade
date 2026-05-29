import React from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { useState } from "react";
import { useUsers, useSerials, useAllCards, addSerial, deleteSerial, createCard, deleteCard, updateUser } from "../hooks/useFirestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { LOCATIONS } from "../data/constants";
import { markRead } from "../hooks/useFirestore";

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export function MessagesApp({ profile, messages, onClose }) {
  const icons = { offer_sent:"📨",offer_accepted:"✅",offer_declined:"❌",delivery_arrived:"📦",delivery_confirmed:"🎉",info:"💬" };
  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:15 }}>💬 Üzenetek</div><div style={{ fontSize:11,display:"flex",alignItems:"center",gap:5,color:"var(--green)" }}><span className="rtdot"/>élő</div></div>
      </div>
      <div className="sc">
        {messages.length===0?(
          <div style={{ textAlign:"center",paddingTop:60 }}>
            <div style={{ fontSize:48,marginBottom:12 }}>💬</div>
            <div style={{ color:"var(--t3)",fontSize:13 }}>Nincs üzeneted.</div>
          </div>
        ):messages.map((m,i)=>(
          <div key={m.id} onClick={()=>!m.read&&markRead(m.id)} className={`card fu s${Math.min(i+1,5)}`}
            style={{ display:"flex",gap:12,cursor:m.read?"default":"pointer",borderColor:m.read?"var(--b)":"var(--blue)",background:m.read?"var(--bg2)":"var(--blue-d)" }}>
            <div style={{ width:38,height:38,borderRadius:10,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0 }}>
              {icons[m.type]||"💬"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:m.read?400:600,lineHeight:1.5,marginBottom:3 }}>{m.text}</div>
              <div style={{ fontSize:10,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace" }}>
                {m.createdAt?.toDate?.()?.toLocaleString("hu-HU")||"most"}
              </div>
            </div>
            {!m.read&&<div style={{ width:8,height:8,borderRadius:"50%",background:"var(--blue)",flexShrink:0,marginTop:4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export function AdminApp({ profile, onClose }) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [serials, setSerials] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [nu, setNu] = useState({ email:"",pw:"",name:"",loc:"Codeland" });
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const { getDocs, collection: col2, orderBy: ob, query: q2 } = await import("firebase/firestore");
      const [uSnap, sSnap, cSnap] = await Promise.all([
        getDocs(q2(col2(db, "users"), ob("name"))),
        getDocs(col2(db, "serials")),
        getDocs(col2(db, "cards")),
      ]);
      setUsers(uSnap.docs.map(d=>({id:d.id,...d.data()})));
      setSerials(sSnap.docs.map(d=>({id:d.id,...d.data()})));
      setAllCards(cSnap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e) { console.error(e); }
    setRefreshing(false);
  }, []);

  React.useEffect(() => { refreshData(); }, [refreshData]);
  const [ns, setNs] = useState({ code:"",oilType:"",quality:"",origin:"",notes:"" });
  const [nc, setNc] = useState({ ownerId:"",fullNumber:"",last4:"",bank:"",expiry:"",cvv:"",holderName:"",color1:"#4a9eff",color2:"#060d1e" });
  const [msg, setMsg] = useState("");
  const [relVersion, setRelVersion] = useState("1.1.0");
  const [relNotes, setRelNotes] = useState("");
  const [relSaving, setRelSaving] = useState(false);
  // Settings tab state
  const [settFlight, setSettFlight] = useState(300);
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");
  const [bcTarget, setBcTarget] = useState("all");
  const [bcTargetUser, setBcTargetUser] = useState("");
  const [bcSending, setBcSending] = useState(false);
  const [nfcDelivId, setNfcDelivId] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [editBalance, setEditBalance] = useState(0);
  const [editRole, setEditRole] = useState("member");
  const [editLoc, setEditLoc] = useState("");
  const [fbCol, setFbCol] = useState("");
  const [fbDocId, setFbDocId] = useState("");
  const [fbField, setFbField] = useState("");
  const [fbValue, setFbValue] = useState("");
  const [etaDelivId, setEtaDelivId] = useState("");
  const [etaValue, setEtaValue] = useState("");

  // Load existing release notes
  React.useEffect(() => {
    getDoc(doc(db, "app_config", "release_notes")).then(d => {
      if (d.exists()) {
        const data = d.data();
        setRelVersion(data.version || "1.1.0");
        setRelNotes(data.notes || "");
      }
    }).catch(() => {});
    getDoc(doc(db, "app_config", "app_settings")).then(d => {
      if (d.exists()) setSettFlight(d.data().flightDuration || 300);
    }).catch(() => {});
  }, []);

  const saveRelease = async () => {
    if (!relVersion || !relNotes) return;
    setRelSaving(true);
    try {
      await setDoc(doc(db, "app_config", "release_notes"), {
        version: relVersion,
        notes: relNotes,
        updatedAt: new Date().toISOString(),
      });
      ok("✓ Release notes mentve!");
    } catch(e) { ok("Hiba: " + e.message); }
    setRelSaving(false);
  };

  const ok = (m) => { setMsg(m); setTimeout(()=>setMsg(""),3000); };

  const sendBroadcast = async () => {
    if (!bcTitle || !bcBody) { ok("Töltsd ki a címet és az üzenetet!"); return; }
    setBcSending(true);
    try {
      const { addDoc, collection: col2 } = await import("firebase/firestore");
      if (bcTarget === "all") {
        // Send to all users via pushQueue
        for (const u of users) {
          if (u.id) {
            await addDoc(col2(db, "messages"), {
              toId: u.id, fromId: "system", fromName: "📢 OilTrade",
              text: `${bcTitle} — ${bcBody}`,
              type: "broadcast", read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
        // OneSignal push to all
        await addDoc(col2(db, "pushQueue"), {
          type: "broadcast", title: bcTitle, body: bcBody,
          createdAt: new Date().toISOString(),
        });
        ok(`✓ Elküldve ${users.length} felhasználónak!`);
      } else if (bcTargetUser) {
        await addDoc(col2(db, "messages"), {
          toId: bcTargetUser, fromId: "system", fromName: "📢 OilTrade",
          text: `${bcTitle} — ${bcBody}`,
          type: "broadcast", read: false,
          createdAt: new Date().toISOString(),
        });
        ok("✓ Elküldve!");
      }
      setBcTitle(""); setBcBody("");
    } catch(e) { ok("Hiba: " + e.message); }
    setBcSending(false);
  };

  const activateNFC = async () => {
    if (!nfcDelivId) { ok("Add meg a delivery ID-t!"); return; }
    try {
      const { doc: doc2, updateDoc: upd2 } = await import("firebase/firestore");
      await upd2(doc2(db, "deliveries", nfcDelivId), { nfcEnabled: true, state: "a kapu előtt" });
      ok("✓ NFC aktiválva! A vevő fizethet.");
    } catch(e) { ok("Hiba: " + e.message); }
  };

  const saveAppConfig = async (key, value) => {
    try {
      await setDoc(doc(db, "app_config", "app_settings"), { [key]: value }, { merge: true });
      ok(`✓ ${key} mentve: ${value}`);
    } catch(e) { ok("Hiba: " + e.message); }
  };

  const saveUserEdit = async () => {
    if (!editUserId) return;
    try {
      await updateUser(editUserId, { balance: parseFloat(editBalance), role: editRole, location: editLoc });
      ok("✓ Felhasználó frissítve!");
      refreshData();
    } catch(e) { ok("Hiba: " + e.message); }
  };

  const fbDirectEdit = async () => {
    if (!fbCol || !fbDocId || !fbField || !fbValue) { ok("Töltsd ki az összes mezőt!"); return; }
    try {
      const { doc: doc2, updateDoc: upd2 } = await import("firebase/firestore");
      let val = fbValue;
      if (!isNaN(Number(val)) && val !== "") val = Number(val);
      else if (val === "true") val = true;
      else if (val === "false") val = false;
      await upd2(doc2(db, fbCol, fbDocId), { [fbField]: val });
      ok(`✓ ${fbCol}/${fbDocId}.${fbField} = ${val}`);
    } catch(e) { ok("Hiba: " + e.message); }
  };

  const saveEta = async () => {
    if (!etaDelivId || !etaValue) { ok("Add meg a delivery ID-t és az ETA-t!"); return; }
    try {
      const { doc: doc2, updateDoc: upd2 } = await import("firebase/firestore");
      await upd2(doc2(db, "deliveries", etaDelivId), { eta: etaValue });
      ok("✓ ETA mentve!");
    } catch(e) { ok("Hiba: " + e.message); }
  };

  const createUser = async () => {
    if (!nu.email||!nu.pw||!nu.name) return;
    try {
      const cred = await createUserWithEmailAndPassword(getAuth(), nu.email, nu.pw);
      await updateUser(cred.user.uid, { uid:cred.user.uid,name:nu.name,email:nu.email,role:"member",location:nu.loc,balance:10000,bankPin:"1234" });
      setNu({email:"",pw:"",name:"",loc:"Codeland"});
      ok("✓ Felhasználó létrehozva");
    } catch(e) { ok("Hiba: "+e.message); }
  };

  const addSer = async () => {
    if (!ns.code) return;
    await addSerial(ns);
    setNs({code:"",oilType:"",quality:"",origin:"",notes:""});
    ok("✓ Serial hozzáadva");
  };

  const issueCard = async () => {
    if (!nc.ownerId||!nc.last4) return;
    await createCard({...nc, fullNumber: nc.fullNumber.replace(/\s/g,"")});
    setNc({ownerId:"",fullNumber:"",last4:"",bank:"",expiry:"",cvv:"",holderName:"",color1:"#4a9eff",color2:"#060d1e"});
    ok("✓ Kártya kiállítva");
  };

  if (profile?.role!=="admin") return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>⚙️ Admin</b>
        <button onClick={refreshData} disabled={refreshing} style={{ marginLeft:"auto",background:"none",border:"1px solid var(--b2)",borderRadius:8,color:"var(--blue)",fontSize:12,padding:"4px 10px",cursor:"pointer" }}>
          {refreshing?"⟳...":"⟳ Frissít"}
        </button>
      </div>
      <div className="sc" style={{ textAlign:"center",paddingTop:60 }}>
        <div style={{ fontSize:40,marginBottom:12 }}>🚫</div>
        <div style={{ color:"var(--red)" }}>Nincs jogosultságod.</div>
      </div>
    </div>
  );

  const F = ({label,children}) => <div style={{ marginBottom:9 }}><label className="fl">{label}</label>{children}</div>;

  return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>⚙️ Admin Panel</b></div>
      <div className="tabs">
        {[["users","👥 Tagok"],["serials","🔢 Serialek"],["cards","💳 Kártyák"],["broadcast","📢 Üzenet"],["release","🚀 Release"],["settings","⚙️ Beállítások"]].map(([id,l])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>
      {msg&&<div className="fi" style={{ margin:"0 14px 0",background:"var(--green-d)",border:"1px solid #3ecf7a30",borderRadius:8,padding:"7px 11px",color:"var(--green)",fontSize:12 }}>{msg}</div>}
      <div style={{ overflow:"auto",height:"calc(100% - 130px)",padding:14 }}>

        {tab==="users"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>Új felhasználó</div>
          <div className="card" style={{ marginBottom:16 }}>
            <F label="Teljes név"><input className="inp" value={nu.name} onChange={e=>{const v=e.target.value;setNu(u=>({...u,name:v}))}} placeholder="Nagy Péter" /></F>
            <F label="Email"><input className="inp" type="email" value={nu.email} onChange={e=>setNu(u=>({...u,email:e.target.value}))} /></F>
            <F label="Jelszó"><input className="inp" type="password" value={nu.pw} onChange={e=>setNu(u=>({...u,pw:e.target.value}))} /></F>
            <F label="Helyszín"><select className="inp" value={nu.loc} onChange={e=>setNu(u=>({...u,loc:e.target.value}))}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></F>
            <button className="btn full" onClick={createUser} style={{ marginTop:6 }}>Fiók létrehozása</button>
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>Tagok ({users.length})</div>
          {users.map(u=>(
            <div key={u.id} className="card" style={{ display:"flex",alignItems:"center",gap:9,margin:0,marginBottom:8 }}>
              <div style={{ width:34,height:34,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0 }}>{u.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600 }}>{u.name}</div><div style={{ fontSize:11,color:"var(--t3)" }}>{u.email} · {u.location}</div></div>
              <span className={`bdg ${u.role==="admin"?"gold":"dim"}`}>{u.role}</span>
            </div>
          ))}
        </>}

        {tab==="serials"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>Új serial kód</div>
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <F label="Kód"><input className="inp" value={ns.code} onChange={e=>setNs(s=>({...s,code:e.target.value}))} placeholder="SN-1001" style={{ fontFamily:"'JetBrains Mono',monospace" }} /></F>
              <F label="Olaj típus"><input className="inp" value={ns.oilType} onChange={e=>setNs(s=>({...s,oilType:e.target.value}))} placeholder="Kerozin" /></F>
              <F label="Minőség"><input className="inp" value={ns.quality} onChange={e=>setNs(s=>({...s,quality:e.target.value}))} placeholder="A+" /></F>
              <F label="Származás"><input className="inp" value={ns.origin} onChange={e=>setNs(s=>({...s,origin:e.target.value}))} placeholder="Tarantula Fészek" /></F>
            </div>
            <F label="Megjegyzés"><input className="inp" value={ns.notes} onChange={e=>setNs(s=>({...s,notes:e.target.value}))} placeholder="Extra info..." /></F>
            <button className="btn full" onClick={addSer} style={{ marginTop:6 }}>Serial hozzáadása</button>
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>Regisztráltak ({serials.length})</div>
          {serials.map(s=>(
            <div key={s.id} className="card" style={{ display:"flex",alignItems:"center",gap:9,margin:0,marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:"var(--blue)" }}>{s.code}</div>
                <div style={{ fontSize:11,color:"var(--t3)" }}>{s.oilType} · {s.quality} · {s.origin}</div>
              </div>
              <button onClick={()=>deleteSerial(s.id)} style={{ background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontSize:16 }}>🗑</button>
            </div>
          ))}
        </>}

        {tab==="cards"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>Kártya kiállítása</div>
          <div className="card" style={{ marginBottom:16 }}>
            <F label="Kártyabirtokos">
              <select className="inp" value={nc.ownerId} onChange={e=>setNc(c=>({...c,ownerId:e.target.value}))}>
                <option value="">— Válassz tagot —</option>
                {users.filter(u=>u.role!=="admin").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </F>
            <F label="Kártya teljes száma">
              <input className="inp" value={nc.fullNumber} onChange={e=>{
                const v=e.target.value.replace(/\D/g,"").slice(0,16);
                const fmt=v.replace(/(.{4})/g,"$1 ").trim();
                setNc(c=>({...c,fullNumber:fmt,last4:v.slice(-4)}));
              }} placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em" }} />
            </F>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <F label="CVV"><input className="inp" value={nc.cvv} onChange={e=>setNc(c=>({...c,cvv:e.target.value}))} placeholder="123" maxLength={3} style={{ fontFamily:"'JetBrains Mono',monospace" }} /></F>
              <F label="Bank"><input className="inp" value={nc.bank} onChange={e=>setNc(c=>({...c,bank:e.target.value}))} placeholder="TradeBank" /></F>
              <F label="Lejárat"><input className="inp" value={nc.expiry} onChange={e=>setNc(c=>({...c,expiry:e.target.value}))} placeholder="12/28" maxLength={5} /></F>
            </div>
            <F label="Kártyabirtokos neve"><input className="inp" value={nc.holderName} onChange={e=>setNc(c=>({...c,holderName:e.target.value}))} placeholder="NAGY PETER" /></F>
            <div style={{ display:"flex",gap:10,alignItems:"center",marginBottom:10 }}>
              <div><label className="fl">Szín 1</label><input type="color" value={nc.color1} onChange={e=>setNc(c=>({...c,color1:e.target.value}))} style={{ width:38,height:30,border:"none",borderRadius:6,cursor:"pointer" }} /></div>
              <div><label className="fl">Szín 2</label><input type="color" value={nc.color2} onChange={e=>setNc(c=>({...c,color2:e.target.value}))} style={{ width:38,height:30,border:"none",borderRadius:6,cursor:"pointer" }} /></div>
              <div style={{ flex:1,height:30,borderRadius:8,background:`linear-gradient(135deg,${nc.color1},${nc.color2})`,marginTop:14 }} />
            </div>
            <button className="btn full" onClick={issueCard}>Kártya kiállítása</button>
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>Összes kártya ({allCards.length})</div>
          {allCards.map(c=>(
            <div key={c.id} className="card" style={{ display:"flex",alignItems:"center",gap:9,margin:0,marginBottom:8 }}>
              <div style={{ width:36,height:22,borderRadius:4,background:`linear-gradient(135deg,${c.color1||"#4a9eff"},${c.color2||"#060d1e"})`,flexShrink:0 }} />
              <div style={{ flex:1 }}><div style={{ fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600 }}>•••• {c.last4}</div><div style={{ fontSize:10,color:"var(--t3)" }}>{c.holderName} · {c.bank}</div></div>
              <button onClick={()=>deleteCard(c.id)} style={{ background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontSize:15 }}>🗑</button>
            </div>
          ))}
        </>}

        {tab==="settings"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>App beállítások</div>

          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>✈️ Repülési idő</div>
            <F label="Repülési idő (másodperc)">
              <input className="inp" type="number" value={settFlight} onChange={e=>setSettFlight(e.target.value)}
                style={{ fontFamily:"'JetBrains Mono',monospace" }} />
            </F>
            <div style={{ fontSize:11,color:"var(--t3)",marginBottom:8 }}>Jelenlegi: {Math.floor(settFlight/60)} perc {settFlight%60} mp</div>
            <button className="btn full" onClick={()=>saveAppConfig("flightDuration",parseInt(settFlight))}>Mentés</button>
          </div>

          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>👥 Felhasználó szerkesztése</div>
            <F label="Felhasználó">
              <select className="inp" value={editUserId} onChange={e=>{ setEditUserId(e.target.value); const u=users.find(x=>x.id===e.target.value); if(u){setEditBalance(u.balance||0);setEditRole(u.role||"member");setEditLoc(u.location||"");} }}>
                <option value="">— Válassz —</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </F>
            {editUserId&&<>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <F label="Egyenleg ($)"><input className="inp" type="number" value={editBalance} onChange={e=>setEditBalance(e.target.value)} /></F>
                <F label="Szerepkör">
                  <select className="inp" value={editRole} onChange={e=>setEditRole(e.target.value)}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </F>
              </div>
              <F label="Helyszín">
                <select className="inp" value={editLoc} onChange={e=>setEditLoc(e.target.value)}>
                  {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </F>
              <button className="btn full" onClick={saveUserEdit}>Mentés</button>
            </>}
          </div>

          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>🔥 Firebase közvetlen szerkesztés</div>
            <F label="Kollekció"><input className="inp" value={fbCol} onChange={e=>setFbCol(e.target.value)} placeholder="users / offers / deliveries" /></F>
            <F label="Dokument ID"><input className="inp" value={fbDocId} onChange={e=>setFbDocId(e.target.value)} placeholder="abc123..." style={{ fontFamily:"'JetBrains Mono',monospace" }} /></F>
            <F label="Mező neve"><input className="inp" value={fbField} onChange={e=>setFbField(e.target.value)} placeholder="balance / role / status" /></F>
            <F label="Új érték"><input className="inp" value={fbValue} onChange={e=>setFbValue(e.target.value)} placeholder="12345 / admin / completed" /></F>
            <button className="btn full" onClick={fbDirectEdit} style={{ background:"var(--red)" }}>Közvetlen írás Firestore-ba</button>
          </div>

          <div className="card">
            <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>📦 Szállítás ETA szerkesztése</div>
            <F label="Delivery ID"><input className="inp" value={etaDelivId} onChange={e=>setEtaDelivId(e.target.value)} placeholder="delivery doc ID" style={{ fontFamily:"'JetBrains Mono',monospace" }} /></F>
            <F label="ETA (pl. 2025-05-10 14:30)"><input className="inp" value={etaValue} onChange={e=>setEtaValue(e.target.value)} placeholder="2025-05-10 14:30" /></F>
            <button className="btn full" onClick={saveEta}>ETA mentése</button>
          </div>
        </>}

        {tab==="broadcast"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>📢 Broadcast üzenet</div>
          <div className="card" style={{ marginBottom:12 }}>
            <F label="Cél">
              <select className="inp" value={bcTarget} onChange={e=>setBcTarget(e.target.value)}>
                <option value="all">Mindenki</option>
                <option value="one">Egy felhasználó</option>
              </select>
            </F>
            {bcTarget==="one"&&(
              <F label="Felhasználó">
                <select className="inp" value={bcTargetUser} onChange={e=>setBcTargetUser(e.target.value)}>
                  <option value="">— Válassz —</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </F>
            )}
            <F label="Cím (push értesítés fejléce)">
              <input className="inp" value={bcTitle} onChange={e=>setBcTitle(e.target.value)}
                placeholder="☀️ Időjárás Budapesten" />
            </F>
            <F label="Üzenet szövege">
              <textarea className="inp" value={bcBody} onChange={e=>setBcBody(e.target.value)}
                placeholder="18°C, felhős. Jó szállítást!" style={{ minHeight:80,resize:"vertical" }} />
            </F>
            <button className="btn full" onClick={sendBroadcast} disabled={bcSending}>
              {bcSending?"Küldés...":"📢 Küldés"}
            </button>
          </div>

          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>📱 NFC aktiválás kapunál</div>
            <div style={{ fontSize:11,color:"var(--t3)",marginBottom:8,lineHeight:1.5 }}>
              Ha a futár a kapunál van, add meg a delivery ID-t és aktiváld az NFC fizetést.
            </div>
            <F label="Delivery ID">
              <input className="inp" value={nfcDelivId} onChange={e=>setNfcDelivId(e.target.value)}
                placeholder="delivery doc ID" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
            </F>
            <button className="btn full" onClick={activateNFC} style={{ background:"var(--green)" }}>
              📱 NFC aktiválás + Kapu előtt állapot
            </button>
          </div>

          <div style={{ fontSize:11,color:"var(--t3)",padding:"10px 0",lineHeight:1.6 }}>
            💡 Példa üzenetek:<br/>
            "☀️ Időjárás" — "18°C, felhős Budapest"<br/>
            "📦 Szállítás" — "Csomagod 30 percen belül érkezik!"<br/>
            "⚠️ Rendszer" — "Karbantartás 22:00-23:00"
          </div>
        </>}

        {tab==="release"&&<>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--blue)",marginBottom:10 }}>Verzió release notes</div>
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ marginBottom:9 }}>
              <label className="fl">Verziószám (pl. 1.2.0)</label>
              <input className="inp" value={relVersion}
                onChange={e=>setRelVersion(e.target.value)}
                placeholder="1.2.0"
                style={{ fontFamily:"'JetBrains Mono',monospace" }} />
            </div>
            <div style={{ marginBottom:9 }}>
              <label className="fl">Mi változott? (felhasználóknak mutatja)</label>
              <textarea className="inp" value={relNotes}
                onChange={e=>setRelNotes(e.target.value)}
                placeholder={"• Bug fix: fehér képernyő javítva\n• Új funkció: Cat Tinder\n• Browser app elkészült"}
                style={{ minHeight:160,resize:"vertical",lineHeight:1.6 }} />
            </div>
            <div style={{ fontSize:11,color:"var(--t3)",marginBottom:10,lineHeight:1.6 }}>
              💡 Amikor a felhasználók letöltik az updateet, ez az üzenet jelenik meg először.
            </div>
            <button className="btn full" onClick={saveRelease} disabled={relSaving}>
              {relSaving ? "Mentés..." : "💾 Release notes mentése"}
            </button>
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:8 }}>Előnézet</div>
          <div className="card" style={{ background:"linear-gradient(135deg,#0d2a0d,#1a3a1a)",border:"1px solid #2d6a2d" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ fontSize:28 }}>🚀</div>
              <div>
                <div style={{ fontSize:11,color:"#4ade80",fontWeight:700,letterSpacing:".06em" }}>ÚJ VERZIÓ — v{relVersion}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,0.6)" }}>OilTrade update</div>
              </div>
            </div>
            {relNotes.split("\n").filter(l=>l.trim()).map((line,i)=>(
              <div key={i} style={{ fontSize:12,color:"rgba(255,255,255,0.85)",marginBottom:5,lineHeight:1.5 }}>{line}</div>
            ))}
          </div>
        </>}

      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function ProfileApp({ profile, onClose, onLogout }) {
  const [name, setName] = useState(profile?.name||"");
  const [saved, setSaved] = useState(false);
  const [loc, setLoc] = useState(profile?.location||"Tarantula Fészek Szigete");
  const save = async () => {
    await updateUser(profile.id, {name, location: loc});
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
    // Force reload profile
    window.location.reload();
  };
  return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button><b>👤 Profil</b></div>
      <div className="sc">
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24 }}>
          <div style={{ width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,var(--blue-d),var(--bg3))",border:"2px solid var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:12 }}>{profile?.name?.[0]?.toUpperCase()}</div>
          <div style={{ fontSize:17,fontWeight:800 }}>{profile?.name}</div>
          <div style={{ fontSize:12,color:"var(--t3)" }}>{profile?.email}</div>
          <span className={`bdg ${profile?.role==="admin"?"gold":"dim"}`} style={{ marginTop:6 }}>{profile?.role}</span>
        </div>
        <div style={{ marginBottom:12 }}>
          <label className="fl">Megjelenített név</label>
          <input className="inp" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="card" style={{ marginBottom:12 }}>
          <label className="fl">Helyszín</label>
          <select className="inp" value={loc} onChange={e=>setLoc(e.target.value)}>
            {["Tarantula Fészek Szigete","Nyauperth","Catland"].map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="card" style={{ marginBottom:14 }}>
          <div style={{ fontSize:11,color:"var(--t3)",marginBottom:6 }}>Jelenlegi helyszín</div>
          <div style={{ fontSize:15,fontWeight:700,color:"var(--blue)" }}>📍 {profile?.location}</div>
          <div style={{ fontSize:11,color:"var(--t3)",marginTop:3 }}>Helyszín váltáshoz: Repülő app</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button className="btn" style={{ flex:1 }} onClick={save}>{saved?"✓ Mentve!":"Mentés"}</button>
          <button className="btn danger" onClick={onLogout}>Kilépés</button>
        </div>
      </div>
    </div>
  );
}

// ─── BROWSER ──────────────────────────────────────────────────────────────────
export function BrowserApp({ onClose, initMode="internet" }) {
  const [mode, setMode] = React.useState(initMode); // "internet" | "oiltrade"
  const [url, setUrl] = React.useState("https://oiltrade-3.web.app");
  const [input, setInput] = React.useState("https://oiltrade-3.web.app");
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState(["https://www.google.com"]);
  const [histIdx, setHistIdx] = React.useState(0);

  const BOOKMARKS = [
    { icon:"🔍", label:"Google", url:"https://www.google.com" },
    { icon:"📰", label:"Index", url:"https://index.hu" },
    { icon:"🎬", label:"YouTube", url:"https://m.youtube.com" },
    { icon:"🌤", label:"Időjárás", url:"https://www.met.hu" },
    { icon:"🛒", label:"Alza", url:"https://www.alza.hu" },
    { icon:"🐱", label:"CatAPI", url:"https://thecatapi.com" },
  ];

  // OilTrade generált oldalak a Firebase Hostingról
  const [sites, setSites] = React.useState([]);
  const [showSites, setShowSites] = React.useState(false);
  const [sitesLoading, setSitesLoading] = React.useState(false);

  const fetchSites = async () => {
    setSitesLoading(true);
    try {
      // Firestore-ból olvassa a Python WebEditor által feltöltött oldalakat
      const q = query(collection(db, "hosted_sites"), orderBy("uploadedAt", "desc"), limit(20));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map(d => d.data());
        setSites(list);
      } else {
        // Ha még nincs feltöltve semmi, csak a főoldalt mutatja
        setSites([{ name:"Főoldal", url:"https://oiltrade-3.web.app/", icon:"🏠" }]);
      }
    } catch {
      setSites([{ name:"Főoldal", url:"https://oiltrade-3.web.app/", icon:"🏠" }]);
    }
    setSitesLoading(false);
  };

  const navigate = (target) => {
    let u = target.trim();
    if (!u) return;
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      if (u.includes(".") && !u.includes(" ")) u = "https://" + u;
      else u = "https://www.google.com/search?q=" + encodeURIComponent(u);
    }
    setUrl(u); setInput(u); setLoading(true);
    const newHist = [...history.slice(0, histIdx + 1), u];
    setHistory(newHist); setHistIdx(newHist.length - 1);
  };

  const goBack = () => {
    if (histIdx > 0) { const i = histIdx - 1; setHistIdx(i); setUrl(history[i]); setInput(history[i]); setLoading(true); }
  };
  const goForward = () => {
    if (histIdx < history.length - 1) { const i = histIdx + 1; setHistIdx(i); setUrl(history[i]); setInput(history[i]); setLoading(true); }
  };
  const reload = () => { setLoading(true); setUrl(""); setTimeout(() => setUrl(history[histIdx]), 50); };

  return (
    <div className="win" style={{ display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"rgba(4,11,20,.97)", backdropFilter:"blur(24px)", borderBottom:"1px solid var(--b)", padding:"max(10px,env(safe-area-inset-top,10px)) 10px 10px", display:"flex", alignItems:"center", gap:6 }}>
        <button className="bk" onClick={onClose} style={{ flexShrink:0 }}>←</button>
        <button onClick={goBack} disabled={histIdx===0} style={{ background:"none",border:"none",color:histIdx===0?"var(--t3)":"var(--blue)",fontSize:20,cursor:"pointer",padding:"0 4px",flexShrink:0,lineHeight:1 }}>‹</button>
        <button onClick={goForward} disabled={histIdx>=history.length-1} style={{ background:"none",border:"none",color:histIdx>=history.length-1?"var(--t3)":"var(--blue)",fontSize:20,cursor:"pointer",padding:"0 4px",flexShrink:0,lineHeight:1 }}>›</button>
        <div style={{ flex:1, background:"var(--bg2)", border:"1px solid var(--b2)", borderRadius:20, display:"flex", alignItems:"center", padding:"5px 10px", gap:6 }}>
          <span style={{ fontSize:10, color:"var(--green)", flexShrink:0 }}>🔒</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && navigate(input)}
            style={{ flex:1, background:"none", border:"none", color:"var(--t)", fontSize:11, outline:"none", fontFamily:"'JetBrains Mono',monospace" }}
            placeholder="URL vagy keresés..."
          />
        </div>
        <button onClick={reload} style={{ background:"none",border:"none",color:"var(--blue)",fontSize:16,cursor:"pointer",padding:"0 4px",flexShrink:0 }}>↻</button>
      </div>

      {/* Bookmarks bar */}
      <div style={{ background:"var(--bg2)", borderBottom:"1px solid var(--b)", padding:"6px 10px", display:"flex", gap:6, overflowX:"auto" }}>
        <button onClick={() => { setShowSites(!showSites); if(!showSites) fetchSites(); }} style={{
          background: showSites ? "var(--blue-d)" : "var(--bg3)",
          border: showSites ? "1px solid var(--blue)" : "1px solid var(--b2)",
          borderRadius:8, padding:"4px 10px", fontSize:11,
          color: showSites ? "var(--blue)" : "var(--t2)",
          cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4, flexShrink:0
        }}>
          <span>⬡</span><span>OilTrade</span>
        </button>
        <div style={{ width:1, background:"var(--b2)", flexShrink:0, margin:"0 2px" }} />
        {BOOKMARKS.map(b => (
          <button key={b.url} onClick={() => { navigate(b.url); setShowSites(false); }} style={{
            background:"var(--bg3)", border:"1px solid var(--b2)", borderRadius:8,
            padding:"4px 10px", fontSize:11, color:"var(--t2)", cursor:"pointer",
            whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4, flexShrink:0
          }}>
            <span>{b.icon}</span><span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Mode switcher */}
      <div style={{ background:"var(--bg2)", borderBottom:"1px solid var(--b)", display:"flex", padding:"6px 10px", gap:6 }}>
        <button onClick={() => setMode("internet")} style={{
          flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
          background: mode==="internet" ? "var(--blue)" : "var(--bg3)",
          color: mode==="internet" ? "#000" : "var(--t2)",
        }}>🌐 Internet</button>
        <button onClick={() => { setMode("oiltrade"); fetchSites(); }} style={{
          flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
          background: mode==="oiltrade" ? "var(--blue)" : "var(--bg3)",
          color: mode==="oiltrade" ? "#000" : "var(--t2)",
        }}>⬡ OilTrade Oldalak</button>
      </div>

        {/* Quick links */}
        <div style={{ display:"flex", gap:8, padding:"6px 14px 0", overflowX:"auto" }}>
          {[
            { label:"⬡ OilTrade", url:"https://oiltrade-3.web.app", color:"#6366f1" },
            { label:"🛒 KormShop", url:"https://oiltrade-korm.web.app", color:"#f97316" },
          ].map(link => (
            <button key={link.url} onClick={() => { setInput(link.url); navigate(link.url); }}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                background:`${link.color}20`, border:`1px solid ${link.color}40`,
                color:link.color, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
                fontFamily:"Inter,sans-serif" }}>
              {link.label}
            </button>
          ))}
        </div>

      {/* Internet bookmarks */}
      {mode==="internet" && (
        <div style={{ background:"var(--bg3)", borderBottom:"1px solid var(--b)", padding:"6px 10px", display:"flex", gap:6, overflowX:"auto" }}>
          {BOOKMARKS.map(b => (
            <button key={b.url} onClick={() => { navigate(b.url); setShowSites(false); }} style={{
              background:"var(--bg2)", border:"1px solid var(--b2)", borderRadius:8,
              padding:"4px 10px", fontSize:11, color:"var(--t2)", cursor:"pointer",
              whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4, flexShrink:0
            }}>
              <span>{b.icon}</span><span>{b.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* OilTrade Sites panel */}
      {mode==="oiltrade" && (
        <div style={{ flex:1, overflowY:"auto", padding:12 }}>
          <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, letterSpacing:".08em", marginBottom:10 }}>FELTÖLTÖTT WEBOLDALAK</div>
          {sitesLoading ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:24 }}>Betöltés...</div>
          ) : sites.length === 0 ? (
            <div style={{ textAlign:"center", padding:40 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⬡</div>
              <div style={{ color:"var(--t2)", fontSize:14, fontWeight:600, marginBottom:6 }}>Még nincs feltöltött oldal</div>
              <div style={{ color:"var(--t3)", fontSize:12 }}>Használd a Python WebEditor-t és töltsd fel Firebase-re!</div>
            </div>
          ) : (
            sites.map(site => (
              <div key={site.url} onClick={() => { setMode("internet"); navigate(site.url); }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, cursor:"pointer", marginBottom:8, background:"var(--bg2)", border:"1px solid var(--b)" }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"linear-gradient(135deg,var(--blue-d),var(--bg3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{site.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, color:"var(--t)", fontWeight:700 }}>{site.name}</div>
                  <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{site.url}</div>
                </div>
                <div style={{ fontSize:18, color:"var(--blue)" }}>→</div>
              </div>
            ))
          )}
          <div style={{ marginTop:8, padding:"12px", borderRadius:10, background:"var(--bg2)", border:"1px solid var(--b)", textAlign:"center" }}>
            <div style={{ fontSize:11, color:"var(--t3)" }}>WebEditor → Feltöltés Firebase-re → megjelenik itt</div>
          </div>
        </div>
      )}

      {/* Loading bar */}
      {mode==="internet" && loading && (
        <div style={{ height:2, background:"var(--bg3)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, height:"100%", width:"60%", background:"var(--blue)", animation:"loadBar 1.2s ease-in-out infinite" }} />
        </div>
      )}

      {/* WebView - only in internet mode */}
      {mode==="internet" && (
        <iframe
          src={url}
          style={{ flex:1, border:"none", width:"100%", background:"#fff" }}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
          title="browser"
        />
      )}
    </div>
  );
}

