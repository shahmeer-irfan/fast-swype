import { NextRequest, NextResponse } from "next/server";

// Sends push notifications via Firebase Cloud Messaging HTTP v1 API.
// Uses service account credentials for OAuth2 authentication.
// This delivers web push notifications to PWA users via FCM web push.
// Background messages are handled by the firebase-messaging-sw.js service worker.

interface SendNotificationPayload {
  token: string;
  title: string;
  body: string;
  link?: string;
  tag?: string;
}

/**
 * Get an OAuth2 access token from the Firebase service account credentials.
 * The service account JSON is stored as a base64-encoded env var.
 */
async function getAccessToken(): Promise<string> {
  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountB64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 not set");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountB64, "base64").toString("utf-8")
  );

  // Create JWT
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  // Sign with RS256 using Web Crypto API
  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Buffer.from(pemContents, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const jwt = `${unsignedToken}.${Buffer.from(signature).toString("base64url")}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Cache the access token (valid for 1 hour, refresh at 50 min)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getCachedAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const token = await getAccessToken();
  cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 }; // 50 minutes
  return token;
}

async function sendPushNotification(payload: SendNotificationPayload): Promise<boolean> {
  try {
    const accessToken = await getCachedAccessToken();

    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountB64) {
      console.error("FIREBASE_SERVICE_ACCOUNT_BASE64 not set");
      return false;
    }
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountB64, "base64").toString("utf-8")
    );
    const projectId = serviceAccount.project_id;

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: payload.token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              link: payload.link || "/proposals",
              tag: payload.tag || "fastswype",
            },
            webpush: {
              fcm_options: {
                link: payload.link || "/proposals",
              },
              notification: {
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
                vibrate: [200, 100, 200],
                require_interaction: "true",
              },
            },
          },
        }),
      }
    );

    if (response.ok) {
      console.log("Push notification sent successfully via FCM v1 API");
      return true;
    }

    const errorResult = await response.text();
    console.error("FCM v1 send failed:", errorResult);

    // If token expired, clear cache and retry once
    if (response.status === 401 && cachedToken) {
      cachedToken = null;
      return sendPushNotification(payload);
    }

    throw new Error(`FCM send failed (${response.status}): ${errorResult}`);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
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
  } catch (error: any) {
    console.error("Notification API error:", error);
    return NextResponse.json({ error: "Internal server error", detail: error?.message || String(error) }, { status: 500 });
  }
}
