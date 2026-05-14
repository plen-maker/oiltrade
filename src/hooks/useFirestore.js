import { useState, useEffect } from "react";
import {
  collection, onSnapshot, where, query,
  addDoc, updateDoc, deleteDoc, doc,
  getDoc, setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const col = (name) => collection(db, name);
const ref = (name, id) => doc(db, name, id);
const ts = () => new Date().toISOString();

// Remove undefined values from object
function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null || v === false || v === 0)
  );
}

function useLive(collName, constraints = []) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const q = constraints.length ? query(col(collName), ...constraints) : col(collName);
    const unsub = onSnapshot(q,
      snap => setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error(collName, err)
    );
    return unsub;
  // eslint-disable-next-line
  }, [collName]);
  return data;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export const useUsers = () => useLive("users");

export async function getOrCreateUser(fb, adminEmail) {
  const r = ref("users", fb.uid);
  const snap = await getDoc(r);
  if (!snap.exists()) {
    const d = {
      uid: fb.uid,
      name: fb.displayName || fb.email.split("@")[0],
      email: fb.email,
      role: fb.email === adminEmail ? "admin" : "member",
      location: "Codeland",
      balance: 10000,
      bankPin: "1234",
      createdAt: ts(),
    };
    await setDoc(r, d);
    return { id: fb.uid, ...d };
  }
  return { id: snap.id, ...snap.data() };
}

export const updateUser = (uid, data) => updateDoc(ref("users", uid), clean(data));

// ─── OFFERS ───────────────────────────────────────────────────────────────────
export const useOffers = () => useLive("offers");


// ─── ONESIGNAL PUSH ───────────────────────────────────────────────────────────
async function pushTo(userId, title, body) {
  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic os_v2_app_35slxxbac5fn5bgkd2uritgjgyp6wu4armleezn5dozlt5643uqu6phdmpzy76u52hyilqwymqc3eikcgtkc5l4n2uubo23dhohk7ji",
      },
      body: JSON.stringify({
        app_id: "df64bbdc-2017-4ade-84ca-1ea9144cc936",
        filters: [{ field: "external_user_id", value: userId }],
        headings: { en: title },
        contents: { en: body },
        android_accent_color: "FF4a9eff",
      }),
    });
  } catch(e) { console.log("push error:", e); }
}

export async function createOffer(data) {
  try {
    const offerData = clean({
      fromId: data.fromId || "",
      fromName: data.fromName || "",
      fromLocation: data.fromLocation || "",
      toId: data.toId || "",
      toName: data.toName || "",
      productName: data.productName || "",
      oilType: data.oilType || "",
      otherOil: data.otherOil || "",
      serialNumber: data.serialNumber || "",
      serialValid: data.serialValid === true,
      price: Number(data.price) || 0,
      status: "pending",
      createdAt: ts(),
    });
    const docRef = await addDoc(col("offers"), offerData);
    await addDoc(col("messages"), {
      toId: data.toId || "",
      fromId: data.fromId || "",
      fromName: data.fromName || "",
      text: `📨 ${data.fromName} ajánlatot küldött neked: ${data.productName} ($${data.price})`,
      type: "offer_sent",
      read: false,
      createdAt: ts(),
    });
    // Push to receiver
    await pushTo(data.toId,
      "📨 Új OilTrade ajánlat!",
      `${data.fromName} küldött: ${data.productName} — $${data.price}`
    );
    return docRef;
  } catch (e) {
    console.error("createOffer error:", e);
    throw e;
  }
}

export const updateOffer = (id, data) => updateDoc(ref("offers", id), clean(data));

// ─── DELIVERIES ───────────────────────────────────────────────────────────────
export const useDeliveries = () => useLive("deliveries");

export async function createDelivery(data) {
  return addDoc(col("deliveries"), clean({ ...data, createdAt: ts() }));
}

export const updateDelivery = (id, data) => updateDoc(ref("deliveries", id), clean(data));

// ─── SERIALS ──────────────────────────────────────────────────────────────────
export const useSerials = () => useLive("serials");
export const addSerial = (data) => addDoc(col("serials"), clean({ ...data, createdAt: ts() }));
export const deleteSerial = (id) => deleteDoc(ref("serials", id));

// ─── CARDS ────────────────────────────────────────────────────────────────────
export const useAllCards = () => useLive("cards");

export function useBankCards(userId) {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(col("cards"), where("ownerId", "==", userId));
    const unsub = onSnapshot(q,
      snap => setCards(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error("cards", err)
    );
    return unsub;
  }, [userId]);
  return cards;
}

export const createCard = (data) => addDoc(col("cards"), clean({ ...data, createdAt: ts() }));
export const deleteCard = (id) => deleteDoc(ref("cards", id));

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export function useMessages(userId) {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(col("messages"), where("toId", "==", userId));
    const unsub = onSnapshot(q,
      snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt||"").localeCompare(a.createdAt||""))),
      err => console.error("messages", err)
    );
    return unsub;
  }, [userId]);
  return msgs;
}

export const markRead = (id) => updateDoc(ref("messages", id), { read: true });

export async function sendMsg(toId, fromId, fromName, text, type = "info") {
  return addDoc(col("messages"), {
    toId: toId || "",
    fromId: fromId || "",
    fromName: fromName || "",
    text: text || "",
    type,
    read: false,
    createdAt: ts(),
  });
}

// ─── TRANSACTIONS / INVOICES ──────────────────────────────────────────────────
export const useInvoices = (userId) => {
  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(col("invoices"), where("participants", "array-contains", userId));
    const unsub = onSnapshot(q,
      snap => setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt||"").localeCompare(a.createdAt||""))),
      err => console.error("invoices", err)
    );
    return unsub;
  }, [userId]);
  return invoices;
};

export async function processPayment({ offerId, fromId, fromName, toId, toName, amount, payMethod, product, oilType }) {
  // 1. Deduct from buyer, add to seller
  const fromSnap = await getDoc(ref("users", fromId));
  const toSnap = await getDoc(ref("users", toId));
  const fromBal = parseFloat(fromSnap.data()?.balance || 0);
  const toBal = parseFloat(toSnap.data()?.balance || 0);
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) throw new Error("Érvénytelen összeg");
  if (fromBal < amt) throw new Error("Nincs elég egyenleg!");
  const fromBalance = Math.round((fromBal - amt) * 100) / 100;
  const toBalance = Math.round((toBal + amt) * 100) / 100;
  await updateDoc(ref("users", fromId), { balance: fromBalance });
  await updateDoc(ref("users", toId), { balance: toBalance });

  // 2. Create invoice for both
  const invoiceNum = `TRD-${Date.now().toString().slice(-8)}`;
  await addDoc(col("invoices"), {
    invoiceNumber: invoiceNum,
    offerId,
    buyerId: fromId,
    buyerName: fromName,
    sellerId: toId,
    sellerName: toName,
    amount,
    payMethod,
    product,
    oilType: oilType || "",
    participants: [fromId, toId],
    status: "paid",
    createdAt: ts(),
  });

  // 3. Notify both parties (in-app messages)
  await addDoc(col("messages"), {
    toId: fromId, fromId: "system", fromName: "OilTrade",
    text: `🧾 Számla #${invoiceNum} — $${amount} levonva. Egyenleg: $${fromBalance}. Termék: ${product}`,
    type: "invoice", read: false, createdAt: ts(),
  });
  await addDoc(col("messages"), {
    toId: toId, fromId: "system", fromName: "OilTrade",
    text: `💰 Számla #${invoiceNum} — $${amount} jóváírva! Egyenleg: $${toBalance}. Termék: ${product}`,
    type: "invoice", read: false, createdAt: ts(),
  });

  // 4. Push notifications (works even when app is closed)
  await addDoc(col("pushQueue"), {
    toUserId: fromId,
    title: "💳 Fizetés teljesítve",
    body: `$${amount} levonva. Termék: ${product}`,
    data: { type: "invoice", invoiceNum },
    sent: false, createdAt: ts(),
  });
  await addDoc(col("pushQueue"), {
    toUserId: toId,
    title: "💰 Bevétel érkezett!",
    body: `$${amount} jóváírva a számládra. Termék: ${product}`,
    data: { type: "invoice", invoiceNum },
    sent: false, createdAt: ts(),
  });

  // Push both parties
  await pushTo(fromId, "💳 Fizetés teljesítve", `$${amount} levonva. Termék: ${product}`);
  await pushTo(toId, "💰 Bevétel érkezett!", `$${amount} jóváírva! Termék: ${product}`);

  return invoiceNum;
}
