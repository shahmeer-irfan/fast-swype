import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Sends push notifications via Firebase Cloud Messaging HTTP v1 API.
// Uses service account credentials for OAuth2 authentication.
// The caller's Supabase session is verified — no API keys are exposed to the client.

// Admin client for server-side fcm_token lookup (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
            // Data fields for the service worker's onBackgroundMessage handler
            data: {
              title: payload.title,
              body: payload.body,
              link: payload.link || "/proposals",
              tag: payload.tag || "fastswype",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-72x72.png",
            },
            webpush: {
              // Notification field ensures Android shows the correct title/body
              // even when the browser auto-handles the push before the SW runs
              notification: {
                title: payload.title,
                body: payload.body,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
                tag: payload.tag || "fastswype",
              },
              fcm_options: {
                link: payload.link || "/proposals",
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
    // 1. Verify caller via Supabase auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { userId, title, body: messageBody, link, tag } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, body" },
        { status: 400 }
      );
    }

    // 3. Look up target user's FCM token server-side (bypasses RLS)
    const { data: targetProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", userId)
      .single();

    if (profileError || !targetProfile?.fcm_token) {
      // User has no FCM token — not an error, just skip
      return NextResponse.json({ success: true, skipped: true });
    }

    // 4. Send push notification via FCM
    const success = await sendPushNotification({
      token: targetProfile.fcm_token,
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
