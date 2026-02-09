import { supabase } from "./supabase/client";

interface NotifyPayload {
  userId: string; // User to notify
  title: string;
  body: string;
  link: string;
  tag: string;
}

/**
 * Send push notification to a user via API route.
 * The server looks up the FCM token — we never read it on the client.
 */
async function triggerNotification(payload: NotifyPayload): Promise<boolean> {
  try {
    // Get current user's Supabase session token for auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log("No active session, skipping notification");
      return false;
    }

    // Call our API route — server handles fcm_token lookup
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        link: payload.link,
        tag: payload.tag,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send notification:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error triggering notification:", error);
    return false;
  }
}

/**
 * Notify receiver when a new proposal is sent
 */
export async function notifyNewProposal(
  receiverId: string,
  senderName: string
): Promise<void> {
  await triggerNotification({
    userId: receiverId,
    title: "New Proposal! 🎉",
    body: `You have a new proposal from ${senderName}`,
    link: "/proposals",
    tag: "new-proposal",
  });
}
