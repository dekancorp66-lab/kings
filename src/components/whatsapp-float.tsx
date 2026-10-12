import { MessageCircle } from "lucide-react";
import { business, primaryPhone, whatsappUrl } from "@/config/business";
import { useI18n } from "@/lib/i18n";

/**
 * Floating "Chat on WhatsApp" button shown on every public page.
 * Why WhatsApp first: in Tanzania most buyers ask about a car by WhatsApp, not by web form,
 * so this is the lowest-friction way for a visitor to become a lead.
 */
export function WhatsAppFloat() {
  const { t } = useI18n();
  const href = whatsappUrl(primaryPhone, t("wa.greeting", { name: business.name }));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("wa.chatAria")}
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" />
      <span className="hidden sm:inline">{t("wa.chat")}</span>
    </a>
  );
}
