import { business } from "@/config/business";
import type { Inquiry } from "@/data/types";

/**
 * Emails the dealer when a customer sends an enquiry.
 *
 * Uses Resend (https://resend.com) over plain HTTPS, so there is nothing extra to install.
 * Settings (in .env on the server):
 *   RESEND_API_KEY   the key from your Resend account. If empty, no email is sent
 *                    (enquiries are still saved and visible in the dealer desk).
 *   NOTIFY_EMAIL     where alerts go. Defaults to the email in src/config/business.ts.
 *                    With Resend's free test sender this must be the email you signed up with.
 *   NOTIFY_FROM      optional. Default "King Sellers <onboarding@resend.dev>". Once you verify
 *                    your own domain in Resend, use e.g. "King Sellers <alerts@yourdomain.co.tz>".
 *
 * Never throws: a failed email must not stop the customer's enquiry from being saved.
 */

function setting(key: string): string {
  return (process.env[key] ?? "").trim();
}

// Plain text only (no HTML), so nothing a customer types can inject markup into the email.
function oneLine(text: string, max = 120): string {
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Turns a typed phone number into a WhatsApp link, or "" if it does not look like a number. */
function whatsappLink(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("0") && digits.length === 10) digits = `255${digits.slice(1)}`;
  return digits.length >= 9 && digits.length <= 15 ? `https://wa.me/${digits}` : "";
}

export async function notifyNewInquiry(row: Inquiry): Promise<void> {
  try {
    const apiKey = setting("RESEND_API_KEY");
    if (!apiKey) return; // alerts not set up yet

    const to = setting("NOTIFY_EMAIL") || business.email;
    const from = setting("NOTIFY_FROM") || `${business.name} <onboarding@resend.dev>`;
    const name = oneLine(`${row.firstName} ${row.lastName}`, 80);
    const wa = whatsappLink(row.phone);

    const text = [
      `New website enquiry from ${name}`,
      "",
      `Vehicle: ${oneLine(row.vehicle) || "(not specified)"}`,
      `Phone: ${oneLine(row.phone, 32) || "(not given)"}${wa ? `  ->  ${wa}` : ""}`,
      `Email: ${oneLine(row.email)}`,
      "",
      "Message:",
      row.message,
      "",
      `Received: ${row.createdAt}`,
      "View all enquiries in the dealer desk: /curator/login",
    ].join("\n");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: row.email, // pressing Reply answers the customer directly
          subject: oneLine(`New enquiry: ${name}${row.vehicle ? ` - ${row.vehicle}` : ""}`, 150),
          text,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        console.warn(`[notify] email not sent (${response.status}): ${(await response.text()).slice(0, 300)}`);
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.warn(`[notify] email failed: ${(error as Error).message}`);
  }
}
