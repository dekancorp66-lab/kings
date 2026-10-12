import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { EnquiryForm } from "@/components/enquiry-form";
import { SiteShell } from "@/components/layout/site-shell";
import { ContactButtons } from "@/components/contact-buttons";
import { business } from "@/config/business";
import { useVehicles } from "@/lib/vehicles";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => {
    if (typeof search.vehicle === "string" && search.vehicle) return { vehicle: search.vehicle };
    return {};
  },
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Contact us | ${business.name}`,
      description: `Call or WhatsApp ${business.name} in ${business.city} on ${business.phones.map((p) => p.display).join(" or ")}. Open 24 hours, 7 days a week.`,
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { vehicle: slug } = Route.useSearch();
  const { t } = useI18n();
  const vehicles = useVehicles();
  const match = vehicles.find((item) => item.slug === slug);
  const defaultVehicle = match ? `${match.year} ${match.name} ${match.trim}` : "";

  return (
    <SiteShell>
      <section className="bg-navy px-5 py-16 text-inverse">
        <div className="mx-auto max-w-6xl">
          <p className="text-micro font-semibold tracking-mark text-inverse/60 uppercase">
            {t("contact.eyebrow")}
          </p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{t("contact.title")}</h1>
          <p className="mt-3 max-w-xl text-sm text-inverse/70">
            {t("contact.intro")}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <aside className="rounded-2xl bg-surface p-7 shadow-card">
          <h2 className="font-serif text-2xl text-ink">{business.name}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{business.address.join(", ")}</p>
          <p className="mt-4 text-sm text-ink">
            <a href={`mailto:${business.email}`} className="hover:text-accent">
              {business.email}
            </a>
          </p>
          <div className="mt-6 space-y-1 text-sm text-muted">
            <p>{t("biz.hours1")}</p>
            <p>{t("biz.hours2")}</p>
          </div>
          <div className="mt-6">
            <ContactButtons message={t("wa.greeting", { name: business.name })} />
          </div>
        </aside>
        <div className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
          <h2 className="font-serif text-2xl text-ink">{t("home.enqTitle")}</h2>
          <div className="mt-6">
            <EnquiryForm defaultVehicle={defaultVehicle} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
