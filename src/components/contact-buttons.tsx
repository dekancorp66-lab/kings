import { MessageCircle, Phone } from "lucide-react";
import { business, telUrl, whatsappUrl } from "@/config/business";
import { useI18n } from "@/lib/i18n";

/** One WhatsApp + one Call button per business number (we have two numbers). */
export function ContactButtons({
  message,
  tone = "light",
}: {
  message?: string;
  tone?: "light" | "dark";
}) {
  const { t } = useI18n();
  const text = message ?? t("wa.greeting", { name: business.name });
  const callStyle =
    tone === "dark"
      ? "bg-white/10 text-inverse ring-1 ring-inverse/25 hover:bg-white/20"
      : "bg-canvas text-ink ring-1 ring-line hover:bg-line/40";
  return (
    <div className="space-y-3">
      {business.phones.map((phone) => (
        <div key={phone.intl} className="flex flex-wrap items-center gap-2">
          <a
            href={whatsappUrl(phone, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95"
          >
            <MessageCircle className="size-4" /> WhatsApp {phone.display}
          </a>
          <a
            href={telUrl(phone)}
            aria-label={t("btn.callAria", { phone: phone.display })}
            className={`inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium ${callStyle}`}
          >
            <Phone className="size-4" /> {t("btn.call")}
          </a>
        </div>
      ))}
    </div>
  );
}
