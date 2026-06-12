"use server";

import { sendDiscordNotification } from "@/utils/discord";

export async function notifyNewUserRegistration(userId: string, email: string, fullName: string) {
  try {
    const name = fullName || email.split('@')[0] || "A new student";

    await sendDiscordNotification(`👋 **New User Alert!**`, {
      title: "Student Registration",
      description: `Welcome aboard, **${name}**! They just joined the Pandaschool platform.`,
      color: 0x3B82F6, // Blue
      fields: [
        { name: "User ID", value: userId.substring(0, 8) + "...", inline: true },
        { name: "Email", value: email, inline: true }
      ]
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to trigger registration webhook:", err);
    return { success: false, error: err.message };
  }
}
