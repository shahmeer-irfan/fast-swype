import { NextRequest, NextResponse } from "next/server";

// Firebase Admin SDK - using REST API to avoid heavy dependency
// This sends a push notification via Firebase Cloud Messaging HTTP v1 API

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY; // Legacy server key from Firebase Console

interface SendNotificationPayload {
  token: string;
  title: string;
  body: string;
  link?: string;
  tag?: string;
}

async function sendPushNotification(payload: SendNotificationPayload): Promise<boolean> {
  if (!FIREBASE_SERVER_KEY) {
    console.error("FIREBASE_SERVER_KEY not set");
    return false;
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: "/icons/icon-192x192.png",
          click_action: payload.link || "/proposals",
        },
        data: {
          link: payload.link || "/proposals",
          tag: payload.tag || "fastswype",
        },
        webpush: {
          fcm_options: {
            link: payload.link || "/proposals",
          },
        },
      }),
    });

    const result = await response.json();

    if (result.success === 1) {
      console.log("Push notification sent successfully");
      return true;
    }

    console.error("FCM send failed:", result);
    return false;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request has required auth
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.NOTIFICATION_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token, title, body: messageBody, link, tag } = body;

    if (!token || !title || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields: token, title, body" },
        { status: 400 }
      );
    }

    const success = await sendPushNotification({
      token,
      title,
      body: messageBody,
      link,
      tag,
    });

    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
