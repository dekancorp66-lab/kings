import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Lang; label: string; full: string }[] = [
  { code: "en", label: "EN", full: "English" },
  { code: "sw", label: "SW", full: "Kiswahili" },
];

/** Small EN | SW toggle. Sits in the header on every page. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn("inline-flex items-center rounded-full border border-line bg-canvas p-0.5", className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          title={option.full}
          className={cn(
            "h-7 min-w-9 rounded-full px-2.5 text-[0.7rem] font-semibold tracking-wider transition-colors",
            lang === option.code ? "bg-navy text-inverse" : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
