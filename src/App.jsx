import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useUsers, useOffers, useDeliveries, useBankCards, useSerials, useMessages } from "./hooks/useFirestore";
import { CSS } from "./data/constants";
import { LockScreen, HomeScreen } from "./components/HomeScreen";
import Login from "./pages/Login";
import { FlightApp, TradeApp } from "./pages/FlightTrade";
import { OffersApp, DeliveryApp } from "./pages/OffersDelivery";
import { BankApp } from "./pages/Bank";
import { MessagesApp, AdminApp, ProfileApp, BrowserApp } from "./pages/OtherApps";
import { WebBuilderApp } from "./pages/WebBuilder";
import { CatTinderApp } from "./pages/CatTinder";
import { UpdaterApp } from "./pages/Updater";
import { CatMailApp } from "./pages/CatMail";
import { CatPayApp } from "./pages/CatPay";
import { AIWebEditorApp } from "./pages/AIWebEditor";
import React, { useState, useEffect, useRef } from "react";
import { initPushNotifications } from "./hooks/usePush";
import { Spinner } from "./components/UI";

const MSG_ICONS = { offer_sent:"📨", offer_accepted:"✅", offer_declined:"❌", delivery_arrived:"📦", delivery_confirmed:"🎉", info:"💬" };

function NotifBanner({ notif, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [notif]);
  if (!notif) return null;
  return (
    <div style={{
      position:"absolute", top:0, left:0, right:0, zIndex:500,
      padding:"max(12px,env(safe-area-inset-top,12px)) 14px 12px",
      background:"rgba(8,15,28,0.97)", backdropFilter:"blur(24px)",
      borderBottom:"1px solid var(--b2)",
      display:"flex", alignItems:"center", gap:12,
      animation:"notifIn .4s cubic-bezier(.22,.68,0,1.2)",
      boxShadow:"0 8px 32px rgba(0,0,0,.5)",
    }}>
      <div style={{ width:40,height:40,borderRadius:12,background:"var(--blue-d)",border:"1px solid var(--b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
        {MSG_ICONS[notif.type]||"💬"}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:11,color:"var(--blue)",fontWeight:700,marginBottom:2,textTransform:"uppercase",letterSpacing:".06em" }}>OilTrade</div>
        <div style={{ fontSize:13,color:"var(--t)",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{notif.text}</div>
      </div>
      <button onClick={onDismiss} style={{ background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:18,flexShrink:0,padding:"4px" }}>✕</button>
    </div>
  );
}



// In-app notification sound
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    o.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.4);
  } catch {}
}

const GITHUB_REPO = "plen-maker/oiltrade";
const APP_VERSION = "__APP_VERSION__"; // ezt növeld minden release-nél — egyezzen a GitHub tag-gel!

function compareVersions(a, b) {
  // true ha b újabb mint a
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0, nb = pb[i] || 0;
    if (nb > na) return true;
    if (nb < na) return false;
  }
  return false; // egyenlő
}

function useUpdateChecker() {
  const [update, setUpdate] = React.useState(null);
  const [showChangelog, setShowChangelog] = React.useState(false);

  React.useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!r.ok) return;
        const data = await r.json();
        const latest = data.tag_name?.replace(/^v/, "");
        if (latest && compareVersions(APP_VERSION, latest)) {
          const apk = data.assets?.find(a => a.name.endsWith(".apk"));
          // Fetch release notes from Firestore
          let notes = "";
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("./firebase");
            const d = await getDoc(doc(db, "app_config", "release_notes"));
            if (d.exists() && d.data().version === latest) {
              notes = d.data().notes || "";
            }
          } catch {}
          setUpdate({ version: latest, url: apk?.browser_download_url || data.html_url, name: data.name, notes });
          setShowChangelog(true);
        }
      } catch {}
    };
    check();
    const interval = setInterval(check, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return { update, showChangelog, setShowChangelog };
}

function OS() {
  const { profile, loading, logout, patchProfile } = useAuth();
  const { update: updateInfo, showChangelog, setShowChangelog } = useUpdateChecker();
  const [locked, setLocked] = useState(true);
  const [app, setApp] = useState(null);
  const [notif, setNotif] = useState(null);
  const prevIds = useRef(new Set());

  const users = useUsers();
  const offers = useOffers();
  const deliveries = useDeliveries();
  const cards = useBankCards(profile?.id);
  const serials = useSerials();
  const messages = useMessages(profile?.id);

  useEffect(() => {
    if (!messages.length) return;
    messages.forEach(m => {
      if (!prevIds.current.has(m.id)) {
        if (prevIds.current.size > 0 && !m.read) { setNotif(m); playNotifSound(); }
        prevIds.current.add(m.id);
      }
    });
  }, [messages]);

  // Init FCM push notifications - must be before any early returns!
  useEffect(() => {
    if (profile?.id) initPushNotifications(profile.id);
  }, [profile?.id]);

  if (loading) return <Spinner />;
  if (!profile) return <Login />;

  const pendingOffers = offers.filter(o => o.toId === profile.id && o.status === "pending").length;
  const activeDeliveries = deliveries.filter(d => (d.fromId === profile.id || d.toId === profile.id) && !d.verified).length;
  const unreadMsgs = messages.filter(m => !m.read).length;
  const close = () => setApp(null);

  const renderApp = () => {
    switch(app) {
      case "trade":    return <TradeApp profile={profile} users={users} serials={serials} onClose={close} />;
      case "flight":   return <FlightApp profile={profile} onClose={close} onLocationChange={loc => patchProfile({ location: loc })} />;
      case "offers":   return <OffersApp profile={profile} offers={offers} onClose={close} />;
      case "delivery": return <DeliveryApp profile={profile} deliveries={deliveries} onClose={close} />;
      case "bank":     return <BankApp profile={profile} cards={cards} onClose={close} />;
      case "messages": return <MessagesApp profile={profile} messages={messages} onClose={close} />;
      case "admin":    return <AdminApp profile={profile} onClose={close} />;
      case "profile":  return <ProfileApp profile={profile} onClose={close} onLogout={logout} />;
      case "browser":  return <BrowserApp onClose={close} initMode="internet" />;
      case "oiltrade-browser": return <BrowserApp onClose={close} initMode="oiltrade" />;
      case "builder":  return <WebBuilderApp profile={profile} onClose={close} />;
      case "cattinder": return <CatTinderApp onClose={close} />;
      case "catmail":   return <CatMailApp onClose={close} profile={profile} />;
      case "catpay":    return <CatPayApp onClose={close} profile={profile} />;
      case "updater":     return <UpdaterApp onClose={close} />;
      case "aiwebeditor": return <AIWebEditorApp onClose={close} />;
      default: return null;
    }
  };

  return (
    <>

      {notif && <NotifBanner notif={notif} onDismiss={() => setNotif(null)} />}
      {locked && <LockScreen onUnlock={() => setLocked(false)} pendingOffers={pendingOffers} />}
      <HomeScreen profile={profile} pendingOffers={pendingOffers} activeDeliveries={activeDeliveries} unreadMsgs={unreadMsgs} onOpenApp={setApp} />
      {app && renderApp()}
    </>
  );
}

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <div className="frame">
          <div className="screen">
            <AuthProvider><OS /></AuthProvider>
          </div>
        </div>
      </div>
    </>
  );
}
