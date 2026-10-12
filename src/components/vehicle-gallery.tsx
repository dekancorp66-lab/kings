import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import {
  categoryOf,
  PHOTO_CATEGORIES,
  type PhotoCategory,
  type PhotoCategoryMap,
} from "@/lib/photo-categories";
import { cn } from "@/lib/utils";
import { useI18n, type TranslationKey } from "@/lib/i18n";

/**
 * BeForward-style gallery for the car detail page:
 * big photo + arrows + "3 / 6" counter + category tabs + thumbnail strip + fullscreen view.
 *
 * Tabs come from the category the dealer picked for each photo in the admin. Photos with no
 * choice (the demo photos) are sorted by file name (interior.jpg, wheel.jpg ...), anything else is "Exterior".
 */

type Props = { images: string[]; alt: string; categories?: PhotoCategoryMap };

export function VehicleGallery({ images, alt, categories }: Props) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<PhotoCategory | "All">("All");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Only show tabs that actually have photos, so a 3-photo car doesn't get empty tabs.
  const tabs = useMemo(() => {
    const present = PHOTO_CATEGORIES.filter((c) =>
      images.some((src) => categoryOf(src, categories) === c),
    );
    return present.length > 1 ? (["All", ...present] as const) : ([] as const);
  }, [images, categories]);

  const visible = useMemo(
    () =>
      filter === "All" ? images : images.filter((src) => categoryOf(src, categories) === filter),
    [images, filter, categories],
  );

  // Reset when the car changes (same component instance is reused between slugs).
  useEffect(() => {
    setFilter("All");
    setIndex(0);
  }, [images]);

  const count = visible.length;
  const current = visible[index] ?? visible[0];

  const go = useCallback(
    (step: number) => {
      if (count === 0) return;
      setIndex((i) => (i + step + count) % count); // wraps around like BeForward
    },
    [count],
  );

  // Keyboard: arrows to browse, Esc to close fullscreen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Lock page scroll while the fullscreen viewer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Keep the active thumbnail in view when the user uses arrows.
  useEffect(() => {
    const el = stripRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, filter]);

  // Swipe support for phones (most Tanzanian buyers browse on mobile).
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  if (!current) return null;

  const arrow =
    "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70";

  return (
    <div>
      {tabs.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label={t("gallery.categories")}>
          {tabs.map((tab) => {
            const total =
              tab === "All"
                ? images.length
                : images.filter((s) => categoryOf(s, categories) === tab).length;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                onClick={() => {
                  setFilter(tab);
                  setIndex(0);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                  filter === tab
                    ? "bg-navy text-inverse"
                    : "bg-surface text-muted shadow-card hover:text-ink",
                )}
              >
                {tab === "All" ? t("gallery.all") : t(`gallery.${tab}` as TranslationKey)}{" "}
                <span className="opacity-60">({total})</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className="group relative overflow-hidden rounded-2xl bg-navy shadow-card"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label={t("gallery.fullscreen")}
        >
          <img src={current} alt={alt} className="aspect-16/10 w-full object-cover" />
        </button>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn(arrow, "left-3")}
              aria-label={t("gallery.prev")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={cn(arrow, "right-3")}
              aria-label={t("gallery.next")}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}

        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white tabular-nums">
          {index + 1} / {count}
        </span>
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
          <Expand className="size-3.5" /> Fullscreen
        </span>
      </div>

      {count > 1 ? (
        <div ref={stripRef} className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {visible.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("gallery.show", { n: i + 1 })}
              className={cn(
                "w-24 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-canvas transition-[box-shadow,opacity] duration-150",
                i === index ? "ring-accent" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <img src={src} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={t("gallery.viewer")}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="text-sm tabular-nums">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("gallery.close")}
              className="rounded-full p-2 hover:bg-white/10"
            >
              <X className="size-6" />
            </button>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6"
            onClick={() => setOpen(false)}
          >
            <img
              src={current}
              alt={alt}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className={cn(arrow, "left-4")}
                  aria-label={t("gallery.prev")}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className={cn(arrow, "right-4")}
                  aria-label={t("gallery.next")}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
