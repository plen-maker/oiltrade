const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

// Watches pushQueue collection and sends FCM push to device
exports.sendPushNotification = onDocumentCreated("pushQueue/{docId}", async (event) => {
  const data = event.data.data();
  if (data.sent) return;

  const db = getFirestore();
  const messaging = getMessaging();

  try {
    // Get user's FCM token
    const userSnap = await db.collection("users").doc(data.toUserId).get();
    const fcmToken = userSnap.data()?.fcmToken;

    if (!fcmToken) {
      console.log("No FCM token for user:", data.toUserId);
      return;
    }

    // Send push notification
    await messaging.send({
      token: fcmToken,
      notification: {
        title: data.title,
        body: data.body,
      },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#4a9eff",
          channelId: "tradelos_default",
        },
      },
      data: data.data || {},
    });

    // Mark as sent
    await event.data.ref.update({ sent: true, sentAt: new Date().toISOString() });
    console.log("Push sent to:", data.toUserId);

  } catch (e) {
    console.error("Push error:", e);
    await event.data.ref.update({ error: e.message });
  }
});

// Also trigger push for new offers
exports.notifyNewOffer = onDocumentCreated("offers/{offerId}", async (event) => {
  const offer = event.data.data();
  const db = getFirestore();

  const userSnap = await db.collection("users").doc(offer.toId).get();
  const fcmToken = userSnap.data()?.fcmToken;
  if (!fcmToken) return;

  await getMessaging().send({
    token: fcmToken,
    notification: {
      title: "📨 Új trade ajánlat!",
      body: `${offer.fromName} ajánlatot küldött: ${offer.productName} — $${offer.price}`,
    },
    android: {
      notification: { icon: "ic_notification", color: "#4a9eff", channelId: "tradelos_default" },
    },
  });
});

// Push for delivery state changes
exports.notifyDeliveryUpdate = onDocumentCreated("deliveries/{deliveryId}", async (event) => {
  const d = event.data.data();
  const db = getFirestore();

  const userSnap = await db.collection("users").doc(d.toId).get();
  const fcmToken = userSnap.data()?.fcmToken;
  if (!fcmToken) return;

  await getMessaging().send({
    token: fcmToken,
    notification: {
      title: "🚚 Szállítás elindult!",
      body: `"${d.product}" szállítása megkezdődött.`,
    },
    android: {
      notification: { icon: "ic_notification", color: "#4a9eff", channelId: "tradelos_default" },
    },
  });
});
