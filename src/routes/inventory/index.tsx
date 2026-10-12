import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { ContactButtons } from "@/components/contact-buttons";
import { business } from "@/config/business";
import { SiteShell } from "@/components/layout/site-shell";
import { SearchPanel } from "@/components/search-panel";
import { VehicleCard } from "@/components/vehicle-card";
import { useVehicles } from "@/lib/vehicles";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/inventory/")({
  validateSearch: (search: Record<string, unknown>) => {
    const next: {
      make?: string;
      body?: string;
      fuel?: string;
      transmission?: string;
      yearMin?: string;
      yearMax?: string;
    } = {};
    if (typeof search.make === "string" && search.make) next.make = search.make;
    if (typeof search.body === "string" && search.body) next.body = search.body;
    if (typeof search.fuel === "string" && search.fuel) next.fuel = search.fuel;
    if (typeof search.transmission === "string" && search.transmission)
      next.transmission = search.transmission;
    if (typeof search.yearMin === "string" && search.yearMin) next.yearMin = search.yearMin;
    if (typeof search.yearMax === "string" && search.yearMax) next.yearMax = search.yearMax;
    return next;
  },
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Cars for sale in ${business.city} | ${business.name}`,
      description: `Browse cars for sale from ${business.name} in ${business.city}. Prices in TZS. Chat with us on WhatsApp to ask or arrange a viewing.`,
      path: "/inventory",
    }),
  component: InventoryPage,
});

function InventoryPage() {
  const { t } = useI18n();
  const filters = Route.useSearch();
  const vehicles = useVehicles();
  // True when the shop has no cars at all (not merely none matching the filters).
  const shopIsEmpty = vehicles.every((vehicle) => vehicle.status === "sold");
  const list = vehicles.filter((vehicle) => {
    if (vehicle.status === "sold") return false;
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.body && vehicle.body !== filters.body) return false;
    if (filters.fuel && vehicle.fuel !== filters.fuel) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) return false;
    if (filters.yearMin && vehicle.year < Number(filters.yearMin)) return false;
    if (filters.yearMax && vehicle.year > Number(filters.yearMax)) return false;
    return true;
  });

  return (
    <SiteShell>
      <section className="border-b-2 border-accent/50 bg-navy px-5 py-6 text-inverse md:py-7">
        <div className="mx-auto max-w-6xl">
          <p className="text-micro font-semibold tracking-mark text-inverse/60 uppercase">
            {t("inv.eyebrow")}
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">{t("inv.title")}</h1>
          <p className="mt-1.5 max-w-3xl text-sm text-inverse/70">
            {t("inv.intro", { name: business.name })}
          </p>
        </div>
      </section>
      <div className="px-5 pt-10 lg:px-8">
        <SearchPanel compact />
      </div>
      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        {shopIsEmpty ? null : (
          <p className="mb-6 text-sm text-muted">
            {list.length === 1 ? t("inv.countOne") : t("inv.countMany", { n: list.length })}
          </p>
        )}
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : shopIsEmpty ? (
          <div className="rounded-2xl bg-surface p-10 text-center shadow-card">
            <p className="font-serif text-2xl text-ink">{t("inv.emptyTitle")}</p>
            <p className="mt-2 text-sm text-muted">
              {t("inv.emptyBody")}
            </p>
            <div className="mt-6 flex justify-center">
              <ContactButtons />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-10 text-center shadow-card">
            <p className="font-serif text-2xl text-ink">{t("inv.noMatchTitle")}</p>
            <p className="mt-2 text-sm text-muted">
              {t("inv.noMatchBody")}
            </p>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
