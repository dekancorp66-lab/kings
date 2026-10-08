import { MessageCircle } from "lucide-react";
import { business, primaryPhone, whatsappUrl } from "@/config/business";

/**
 * Floating "Chat on WhatsApp" button shown on every public page.
 * Why WhatsApp first: in Tanzania most buyers ask about a car by WhatsApp, not by web form,
 * so this is the lowest-friction way for a visitor to become a lead.
 */
export function WhatsAppFloat() {
  const href = whatsappUrl(
    primaryPhone,
    `Hello ${business.name}, I would like to ask about a car.`,
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
