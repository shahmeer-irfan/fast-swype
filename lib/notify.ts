import { supabase } from "./supabase/client";

const NOTIFICATION_API_KEY = process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY;

interface NotifyPayload {
  userId: string; // User to notify
  title: string;
  body: string;
  link: string;
  tag: string;
}

/**
 * Send push notification to a user via API route
 */
async function triggerNotification(payload: NotifyPayload): Promise<boolean> {
  try {
    // Get the user's FCM token from their profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("fcm_token")
      .eq("id", payload.userId)
      .single();

    if (error || !profile?.fcm_token) {
      console.log("User has no FCM token, skipping notification");
      return false;
    }

    // Call our API route to send the push notification
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOTIFICATION_API_KEY}`,
      },
      body: JSON.stringify({
        token: profile.fcm_token,
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

/**
 * Notify sender when their proposal is accepted
 */
export async function notifyProposalAccepted(
  senderId: string,
  accepterName: string
): Promise<void> {
  await triggerNotification({
    userId: senderId,
    title: "Proposal Accepted! 🎉",
    body: `${accepterName} accepted your proposal!`,
    link: "/proposals",
    tag: "proposal-accepted",
  });
}
