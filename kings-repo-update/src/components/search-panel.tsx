import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { uniqueSorted, useVehicles } from "@/lib/vehicles";
import { Button } from "./ui/button";
import { Input, Label, Select } from "./ui/input";
import { useI18n } from "@/lib/i18n";
import type { PublicVehicle } from "@/data/types";
import { formatPrice } from "@/lib/utils";

/** Price choices in millions of TZS: [from, to). `to` = null means "and above". */
export const PRICE_RANGES: Array<{ value: string; from: number; to: number | null }> = [
  { value: "0-30", from: 0, to: 30 },
  { value: "30-50", from: 30, to: 50 },
  { value: "50-100", from: 50, to: 100 },
  { value: "100-200", from: 100, to: 200 },
  { value: "200-", from: 200, to: null },
];

export function inPriceRange(price: number, value: string) {
  const range = PRICE_RANGES.find((item) => item.value === value);
  if (!range) return true;
  return price >= range.from * 1_000_000 && (range.to === null || price < range.to * 1_000_000);
}

export function SearchPanel({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const vehicles = useVehicles();
  // Keeps the boxes filled with what the visitor already chose (also for shared links).
  const current = useSearch({ strict: false }) as Record<string, string | undefined>;
  // Options are built from the live stock, so a newly added make/body/year shows up in the filters.
  const makes = uniqueSorted(vehicles.map((item) => item.make));
  const bodies = uniqueSorted(vehicles.map((item) => item.body));
  const fuels = uniqueSorted(vehicles.map((item) => item.fuel));
  const transmissions = uniqueSorted(vehicles.map((item) => item.transmission));
  const years = [...new Set(vehicles.map((item) => item.year))].sort((a, b) => b - a);
  // Only offer price ranges that actually contain a car.
  const available = vehicles.filter((item) => item.status !== "sold");
  const prices = PRICE_RANGES.filter((range) => available.some((item) => inPriceRange(item.price, range.value)));

  const priceLabel = (range: (typeof PRICE_RANGES)[number]) =>
    range.from === 0
      ? t("search.priceUnder", { n: range.to ?? 0 })
      : range.to === null
        ? t("search.priceOver", { n: range.from })
        : t("search.priceBetween", { a: range.from, b: range.to });

  return (
    <section className={compact ? "" : "-mt-10 relative z-10 px-5 lg:px-8"}>
      <form
        data-compact-search
        className="mx-auto max-w-6xl rounded-2xl bg-surface p-4 shadow-lift md:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const pick = (key: string) => String(data.get(key) ?? "").trim();
          void navigate({
            to: "/inventory",
            search: {
              ...(pick("q") ? { q: pick("q") } : {}),
              ...(pick("make") ? { make: pick("make") } : {}),
              ...(pick("body") ? { body: pick("body") } : {}),
              ...(pick("year") ? { year: pick("year") } : {}),
              ...(pick("price") ? { price: pick("price") } : {}),
              ...(pick("fuel") ? { fuel: pick("fuel") } : {}),
              ...(pick("transmission") ? { transmission: pick("transmission") } : {}),
            },
          });
        }}
      >
        <div className="mb-3 flex items-baseline gap-3">
          <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-accent uppercase">
            {t("search.eyebrow")}
          </p>
          <h2 className="font-serif text-xl text-ink md:text-2xl">{t("search.title")}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-5">
            <SearchBox initial={current.q ?? ""} />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <Button type="submit" className="h-11 w-full">
              {t("search.submit")}
            </Button>
          </div>
          <Field label={t("search.make")} name="make" options={makes} defaultValue={current.make} />
          <Field label={t("search.body")} name="body" options={bodies} defaultValue={current.body} />
          <Field label={t("search.year")} name="year" options={years.map(String)} defaultValue={current.year} />
          <div>
            <Label htmlFor="price">{t("search.price")}</Label>
            <Select id="price" name="price" defaultValue={current.price ?? ""}>
              <option value="">{t("search.anyPrice")}</option>
              {prices.map((range) => (
                <option key={range.value} value={range.value}>
                  {priceLabel(range)}
                </option>
              ))}
            </Select>
          </div>
          <Field label={t("search.fuel")} name="fuel" options={fuels} defaultValue={current.fuel} />
          <Field
            label={t("search.transmission")}
            name="transmission"
            options={transmissions}
            defaultValue={current.transmission}
          />
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  options,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
}) {
  // The option VALUE stays English (the filters compare against stored data);
  // only the visible text is translated.
  const { t, tData } = useI18n();
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue ?? ""}>
        <option value="">{placeholder ?? t("search.all")}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {tData("val", option)}
          </option>
        ))}
      </Select>
    </div>
  );
}

// What a typed word is matched against: the car's name, make, model, year, colour and so on.
function searchText(vehicle: PublicVehicle) {
  return [
    vehicle.name, vehicle.make, vehicle.model, vehicle.trim, vehicle.year, vehicle.body, vehicle.fuel,
    vehicle.transmission, vehicle.drivetrain, vehicle.engine, vehicle.color,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "ig"));
  // With a capture group, the matched pieces are the odd-numbered parts.
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

// The search bar with a Google-style list of matching cars underneath while typing.
function SearchBox({ initial }: { initial: string }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const vehicles = useVehicles();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // A shared link like /inventory?q=subaru should show the word in the box.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) setQ(fromUrl);
  }, []);

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const suggestions = useMemo(() => {
    const typed = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!typed.length) return [];
    const title = (v: PublicVehicle) => `${v.year} ${v.name} ${v.trim}`.toLowerCase();
    return vehicles
      .filter((v) => v.status !== "sold" && typed.every((word) => searchText(v).includes(word)))
      .sort((a, b) => Number(!title(a).includes(typed[0])) - Number(!title(b).includes(typed[0])))
      .slice(0, 6);
  }, [q, vehicles]);

  const showList = open && suggestions.length > 0;

  function go(vehicle: PublicVehicle) {
    setOpen(false);
    void navigate({ to: "/inventory/$slug", params: { slug: vehicle.slug } });
  }

  return (
    <div
      className="relative"
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Label htmlFor="q">{t("search.q")}</Label>
      <Input
        id="q"
        name="q"
        type="search"
        maxLength={80}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `suggest-${active}` : undefined}
        value={q}
        placeholder={t("search.qPlaceholder")}
        onChange={(event) => {
          setQ(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length) {
            event.preventDefault();
            setOpen(true);
            setActive((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp" && suggestions.length) {
            event.preventDefault();
            setOpen(true);
            setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
          } else if (event.key === "Enter" && showList && active >= 0 && suggestions[active]) {
            event.preventDefault();
            go(suggestions[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showList ? (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-1 overflow-hidden rounded-xl bg-surface shadow-lift ring-1 ring-line"
        >
          {suggestions.map((vehicle, index) => (
            <li key={vehicle.id} role="presentation">
              <button
                type="button"
                role="option"
                id={`suggest-${index}`}
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(vehicle)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${index === active ? "bg-canvas" : ""}`}
              >
                <img
                  src={vehicle.images[0]}
                  alt=""
                  loading="lazy"
                  className="h-10 w-14 shrink-0 rounded-md bg-navy object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-muted">
                  <Highlight text={`${vehicle.year} ${vehicle.name} ${vehicle.trim}`.trim()} words={words} />
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-ink">{formatPrice(vehicle.price)}</span>
              </button>
            </li>
          ))}
          <li role="presentation" className="border-t border-line">
            <button type="submit" className="w-full px-3 py-2.5 text-left text-xs font-medium text-accent hover:bg-canvas">
              {t("search.seeAll", { q: q.trim() })}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
