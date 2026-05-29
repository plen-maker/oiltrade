import { db } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

const ONESIGNAL_APP_ID = "df64bbdc-2017-4ade-84ca-1ea9144cc936";
const ONESIGNAL_REST_KEY = "os_v2_app_35slxxbac5fn5bgkd2uritgjgyp6wu4armleezn5dozlt5643uqu6phdmpzy76u52hyilqwymqc3eikcgtkc5l4n2uubo23dhohk7ji";

let osInitialized = false;

export async function initPushNotifications(userId) {
  try {
    const { OneSignal } = await import("onesignal-cordova-plugin").catch(() => ({ OneSignal: null }));
    if (!OneSignal) { console.log("OneSignal not available (web)"); return; }
    if (!osInitialized) { OneSignal.initialize(ONESIGNAL_APP_ID); osInitialized = true; }
    await OneSignal.Notifications.requestPermission(true).catch(() => {});
    await OneSignal.login(userId).catch(() => {});
    console.log("OneSignal linked:", userId);
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", (e) => e.notification.display());
    OneSignal.Notifications.addEventListener("click", (e) => {
      const d = e.notification.additionalData || {};
      const m = { catpay:"catpay", catmail:"catmail", order:"catmail", update:"updater", nfc:"catpay" };
      if (m[d.type]) window.dispatchEvent(new CustomEvent("openApp", { detail: { app: m[d.type] } }));
    });
  } catch(e) { console.log("OneSignal init error:", e.message); }
}

export function processPushQueue() {
  const q = query(collection(db, "pushQueue"), where("sent", "==", false));
  return onSnapshot(q, async (snap) => {
    for (const d of snap.docs) {
      const push = d.data();
      try {
        const res = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Basic " + ONESIGNAL_REST_KEY },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            filters: [{ field: "external_user_id", value: push.toUserId }],
            headings: { en: push.title, hu: push.title },
            contents: { en: push.body, hu: push.body },
            data: push.data || {},
            android_accent_color: "FFf59e0b",
            android_sound: "default",
            ios_sound: "default",
          }),
        });
        const json = await res.json();
        if (json.id) await updateDoc(doc(db, "pushQueue", d.id), { sent: true, sentAt: serverTimestamp() });
      } catch(e) { console.log("Push send error:", e.message); }
    }
  });
}

export async function sendPushToUser(toUserId, title, body, data) {
  try {
    await addDoc(collection(db, "pushQueue"), { toUserId, title, body, data: data||{}, sent: false, createdAt: serverTimestamp() });
  } catch(e) { console.log("Push queue error:", e); }
}

export const notifyCatMail = (uid, from, subj) => sendPushToUser(uid, "📧 Új CatMail: "+from, subj, {type:"catmail"});
export const notifyCatPayRequest = (uid, site, amt) => sendPushToUser(uid, "🐾 CatPay fizetési kérés", (site||"Shop")+" — $"+parseFloat(amt).toFixed(2)+" USD. Te voltál?", {type:"catpay"});
export const notifyOrder = (uid, id, total) => sendPushToUser(uid, "✅ Rendelés visszaigazolva", id+" · $"+parseFloat(total||0).toFixed(2)+" USD", {type:"order"});
export const notifyUpdate = (uid, ver) => sendPushToUser(uid, "⬆️ OilTrade "+ver+" elérhető", "Új verzió — koppints!", {type:"update"});
