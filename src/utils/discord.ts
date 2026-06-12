export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export async function sendDiscordNotification(message: string, embed?: DiscordEmbed) {
  // If no webhook URL is defined, we safely skip to avoid crashing in dev environments
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[Discord] Skipping webhook notification - DISCORD_WEBHOOK_URL is not set.");
    console.log("[Discord Mock Payload]:", message, embed);
    return false;
  }

  try {
    const payload: any = {
      content: message,
      username: "Pandaschool Alerts",
      avatar_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=256&h=256&q=80",
    };

    if (embed) {
      payload.embeds = [{
        ...embed,
        color: embed.color || 0x0F6E56, // Default Pandaschool Brand Color
        timestamp: new Date().toISOString()
      }];
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[Discord] Webhook failed with status:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Discord] Error sending webhook:", error);
    return false;
  }
}
