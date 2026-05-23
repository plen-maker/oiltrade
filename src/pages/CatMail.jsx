import { useState, useEffect } from "react";
import { db } from "../firebase";

const GMAIL_CLIENT_ID = "851289814310-8rtgnue15cr0d7364vqln7iabijtqnlj.apps.googleusercontent.com";
const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";

export function CatMailApp({ onClose, profile }) {
  const [tab, setTab] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [authErr, setAuthErr] = useState("");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications from Firestore
    const unsub = db.collection("emailQueue")
      .where("sent", "==", false)
      .orderBy("createdAt", "desc")
      .limit(10)
      .onSnapshot(snap => {
        setNotifications(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }, () => {});
    return () => unsub();
  }, []);

  const signInGoogle = async () => {
    setLoading(true);
    setAuthErr("");
    try {
      // Use Capacitor Google Auth if available
      const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
      const result = await GoogleAuth.signIn();
      setAccessToken(result.authentication.accessToken);
      await fetchEmails(result.authentication.accessToken);
    } catch(e) {
      setAuthErr("Google bejelentkezés sikertelen: " + e.message);
    }
    setLoading(false);
  };

  const fetchEmails = async (token) => {
    setLoading(true);
    try {
      const listRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const listData = await listRes.json();
      if (!listData.messages) { setEmails([]); setLoading(false); return; }

      const emailDetails = await Promise.all(
        listData.messages.slice(0, 15).map(async (msg) => {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          const headers = data.payload?.headers || [];
          const get = (name) => headers.find(h => h.name === name)?.value || "";
          return {
            id: msg.id,
            from: get("From"),
            subject: get("Subject") || "(No subject)",
            date: get("Date"),
            snippet: data.snippet || "",
            read: !data.labelIds?.includes("UNREAD"),
          };
        })
      );
      setEmails(emailDetails);
    } catch(e) {
      setAuthErr("Email betöltés sikertelen");
    }
    setLoading(false);
  };

  const openEmail = async (email) => {
    setSelectedEmail(email);
    setTab("detail");
    if (!email.read && accessToken) {
      try {
        await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}/modify`,
          { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ removeLabelIds: ["UNREAD"] }) }
        );
      } catch {}
    }
  };

  const sendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setSending(true);
    try {
      const emailContent = [
        `To: ${composeTo}`,
        `Subject: ${composeSubject}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        composeBody,
      ].join("\n");
      const encoded = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: encoded }),
      });
      setComposeTo(""); setComposeSubject(""); setComposeBody("");
      setTab("inbox");
      alert("✅ Email elküldve!");
    } catch(e) {
      alert("❌ Hiba: " + e.message);
    }
    setSending(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("hu-HU", {hour:"2-digit",minute:"2-digit"});
      return d.toLocaleDateString("hu-HU", {month:"short", day:"numeric"});
    } catch { return dateStr; }
  };

  const fromName = (from) => {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].replace(/"/g,"") : from.split("@")[0];
  };

  return (
    <div className="win" style={{ display:"flex", flexDirection:"column" }}>
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:15 }}>🐱 CatMail</div>
          <div style={{ fontSize:10, color:"var(--t3)" }}>Gmail integráció</div>
        </div>
        {accessToken && (
          <button onClick={()=>fetchEmails(accessToken)} style={{
            background:"var(--bg3)", border:"1px solid var(--b2)",
            borderRadius:8, color:"var(--t2)", padding:"4px 10px",
            fontSize:11, cursor:"pointer"
          }}>↻</button>
        )}
      </div>

      {/* Tabs */}
      {accessToken && (
        <div className="tabs" style={{ borderBottom:"1px solid var(--b)" }}>
          {[["inbox","📥 Beérkező"],["compose","✏️ Írás"],["notifications","🔔 Értesítők"]].map(([id,l])=>(
            <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{l}</button>
          ))}
        </div>
      )}

      <div style={{ flex:1, overflow:"auto" }}>

        {/* NOT LOGGED IN */}
        {!accessToken && (
          <div style={{ padding:24, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:60 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🐱</div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>CatMail</div>
            <div style={{ color:"var(--t3)", fontSize:13, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>
              Gmail fiókod összekapcsolásával olvashatod és küldheted emailjeidet közvetlenül az appból.
            </div>
            {authErr && <div style={{ color:"var(--red)", fontSize:12, marginBottom:12, textAlign:"center" }}>{authErr}</div>}
            <button onClick={signInGoogle} disabled={loading} style={{
              background:"#fff", color:"#333", border:"none",
              borderRadius:12, padding:"14px 28px",
              fontWeight:700, fontSize:14, cursor:"pointer",
              display:"flex", alignItems:"center", gap:10, width:"100%",
              justifyContent:"center"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Betöltés..." : "Bejelentkezés Google-lal"}
            </button>
          </div>
        )}

        {/* INBOX */}
        {accessToken && tab === "inbox" && (
          <div>
            {loading && <div style={{ textAlign:"center", padding:30, color:"var(--t3)" }}>Betöltés...</div>}
            {!loading && emails.length === 0 && (
              <div style={{ textAlign:"center", padding:40, color:"var(--t3)" }}>Nincs email</div>
            )}
            {emails.map(email => (
              <div key={email.id} onClick={() => openEmail(email)} style={{
                padding:"14px 16px", borderBottom:"1px solid var(--b)",
                cursor:"pointer", background: email.read ? "transparent" : "rgba(88,166,255,.04)",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight: email.read ? 500 : 700, color:"var(--t)" }}>
                    {fromName(email.from)}
                  </div>
                  <div style={{ fontSize:11, color:"var(--t3)" }}>{formatDate(email.date)}</div>
                </div>
                <div style={{ fontSize:13, fontWeight: email.read ? 400 : 600, color:"var(--t2)", marginBottom:3 }}>
                  {email.subject}
                </div>
                <div style={{ fontSize:12, color:"var(--t3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {email.snippet}
                </div>
                {!email.read && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--blue)", marginTop:6 }} />}
              </div>
            ))}
          </div>
        )}

        {/* EMAIL DETAIL */}
        {accessToken && tab === "detail" && selectedEmail && (
          <div style={{ padding:16 }}>
            <button onClick={()=>setTab("inbox")} style={{
              background:"var(--bg2)", border:"1px solid var(--b2)",
              borderRadius:8, color:"var(--t2)", padding:"6px 12px",
              fontSize:12, cursor:"pointer", marginBottom:16
            }}>← Vissza</button>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:10, lineHeight:1.3 }}>
              {selectedEmail.subject}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontSize:12, color:"var(--t2)" }}>{selectedEmail.from}</div>
              <div style={{ fontSize:11, color:"var(--t3)" }}>{formatDate(selectedEmail.date)}</div>
            </div>
            <div style={{ background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:10, padding:14, fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
              {selectedEmail.snippet}
            </div>
            <button onClick={()=>{setComposeTo(selectedEmail.from);setComposeSubject("Re: "+selectedEmail.subject);setTab("compose");}} style={{
              width:"100%", marginTop:14, padding:12,
              background:"var(--blue-d)", border:"1px solid var(--blue)",
              borderRadius:10, color:"var(--blue)", fontWeight:700, fontSize:13, cursor:"pointer"
            }}>↩ Válasz</button>
          </div>
        )}

        {/* COMPOSE */}
        {accessToken && tab === "compose" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>✏️ Új email</div>
            {[
              ["Címzett", composeTo, setComposeTo, "email@example.com", "email"],
              ["Tárgy", composeSubject, setComposeSubject, "Tárgy...", "text"],
            ].map(([label, val, setter, ph, type]) => (
              <div key={label} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, marginBottom:4 }}>{label.toUpperCase()}</div>
                <input
                  type={type} value={val} onChange={e=>setter(e.target.value)}
                  placeholder={ph}
                  style={{ width:"100%", background:"var(--bg2)", border:"1px solid var(--b2)",
                    borderRadius:8, padding:"10px 12px", color:"var(--t)", fontSize:13 }}
                />
              </div>
            ))}
            <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, marginBottom:4 }}>ÜZENET</div>
            <textarea
              value={composeBody} onChange={e=>setComposeBody(e.target.value)}
              placeholder="Írd ide az üzenetet..."
              style={{ width:"100%", minHeight:160, background:"var(--bg2)", border:"1px solid var(--b2)",
                borderRadius:8, padding:"10px 12px", color:"var(--t)", fontSize:13,
                resize:"vertical", fontFamily:"'Syne',sans-serif", lineHeight:1.6 }}
            />
            <button onClick={sendEmail} disabled={sending || !composeTo || !composeSubject} style={{
              width:"100%", marginTop:12, padding:14,
              background:"var(--blue)", color:"#000", border:"none",
              borderRadius:10, fontWeight:800, fontSize:14, cursor:"pointer"
            }}>
              {sending ? "Küldés..." : "📤 Küldés"}
            </button>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {accessToken && tab === "notifications" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:14 }}>
              Automatikus értesítők rendelésekről, szállításokról
            </div>
            {notifications.length === 0 && (
              <div style={{ textAlign:"center", padding:30, color:"var(--t3)" }}>Nincs értesítő</div>
            )}
            {notifications.map(n => (
              <div key={n.id} style={{
                background:"var(--bg2)", border:"1px solid var(--b)",
                borderRadius:12, padding:14, marginBottom:10
              }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{n.subject}</div>
                <div style={{ fontSize:12, color:"var(--t2)", marginBottom:4 }}>→ {n.to}</div>
                <div style={{ fontSize:11, color:"var(--t3)" }}>
                  {n.createdAt?.toDate?.()?.toLocaleString("hu-HU") || ""}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
