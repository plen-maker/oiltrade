const ONESIGNAL_APP_ID = "df64bbdc-2017-4ade-84ca-1ea9144cc936";

export async function initPushNotifications(userId) {
  try {
    const OneSignal = window.plugins?.OneSignal;
    if (!OneSignal) {
      console.log("OneSignal not available (web mode)");
      return;
    }

    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request permission
    OneSignal.Notifications.requestPermission(true);

    // Set external user ID (our Firebase UID)
    OneSignal.login(userId);

    console.log("OneSignal initialized for user:", userId);
  } catch (e) {
    console.log("Push init error:", e.message);
  }
}

// Send push via OneSignal REST API
export async function sendPushToUser(toUserId, title, body) {
  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: In production use Firebase Functions to hide this key
        "Authorization": "Basic os_v2_app_35slxxbac5fn5bgkd2uritgjgyp6wu4armleezn5dozlt5643uqu6phdmpzy76u52hyilqwymqc3eikcgtkc5l4n2uubo23dhohk7ji",
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        filters: [{ field: "external_user_id", value: toUserId }],
        headings: { en: title },
        contents: { en: body },
        android_accent_color: "FF4a9eff",
        small_icon: "ic_stat_onesignal_default",
      }),
    });
  } catch (e) {
    console.log("Push send error:", e);
  }
}
