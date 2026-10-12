import { HeroReel } from "@/components/hero-reel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { businessJsonLd, pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { Clock, Headphones, MapPin, Phone, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { SiteShell } from "@/components/layout/site-shell";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicle-card";
import { ContactButtons } from "@/components/contact-buttons";
import { TanzaniaMap } from "@/components/tanzania-map";
import { business } from "@/config/business";
import { standards } from "@/data/catalog";
import { useVehicles } from "@/lib/vehicles";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  // The loader fetches the public site address (server side) so link previews get absolute URLs.
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `${business.name} | Cars for sale in ${business.city}`,
      description: `${business.tagline}. Browse our cars and chat with us on WhatsApp. Open 24 hours, 7 days a week.`,
      path: "/",
      jsonLd: [businessJsonLd(origin)],
    }),
  component: Home,
});

const ICONS = [ShieldCheck, Scale, Sparkles, Headphones];

function Home() {
  const { t } = useI18n();
  const allVehicles = useVehicles();
  const available = allVehicles.filter((item) => item.status !== "sold");
  const featuredPicks = available.filter((item) => item.featured);
  // If no car is ticked "Featured", show the 3 newest so the home page is never empty while stock exists.
  const featured = featuredPicks.length ? featuredPicks : available.slice(0, 3);

  return (
    <SiteShell>
      <section className="relative isolate min-h-[34rem] overflow-hidden bg-navy md:min-h-[40rem]">
        <HeroReel />
        <div className="absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-center px-5 py-20 md:min-h-[40rem] lg:px-8">
          <p className="text-micro font-semibold tracking-mark text-inverse/70 uppercase">
            {business.name}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight text-inverse uppercase sm:text-5xl md:text-6xl">
            {t("home.hero1")}
            <br />
            {t("home.hero2")}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-inverse/75 md:text-base">
            {t("home.heroSub")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/inventory">{t("home.explore")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SearchPanel />

      {featured.length ? (
        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-micro font-semibold tracking-mark text-accent uppercase">
                {t("home.featuredEyebrow")}
              </p>
              <h2 className="mt-1 font-serif text-3xl text-ink md:text-4xl">
                {t("home.featuredTitle")}
              </h2>
            </div>
            <Link
              to="/inventory"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              {t("home.browseAll")}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="text-center">
            <p className="text-micro font-semibold tracking-mark text-accent uppercase">
              {t("home.whyEyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {t("home.whyTitle")}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((item, index) => {
              const titleKey = `standard.${index}.title` as TranslationKey;
              const bodyKey = `standard.${index}.body` as TranslationKey;
              const Icon = ICONS[index] ?? ShieldCheck;
              return (
                <article key={item.title} className="rounded-2xl bg-canvas p-6 shadow-card">
                  <span className="grid size-11 place-items-center rounded-xl bg-surface text-accent shadow-card">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-ink">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-micro font-semibold tracking-mark text-accent uppercase">
              {t("home.findEyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {t("home.findTitle")}
            </h2>
            <ul className="mt-8 space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 text-accent" />
                <div>
                  <p className="font-semibold text-ink">{t("home.address")}</p>
                  {business.address.map((line) => (
                    <p key={line} className="text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 text-accent" />
                <div>
                  <p className="font-semibold text-ink">{t("home.phone")}</p>
                  {business.phones.map((phone) => (
                    <p key={phone.intl} className="text-muted">
                      {phone.display}
                    </p>
                  ))}
                  <p className="text-muted">{business.email}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 text-accent" />
                <div>
                  <p className="font-semibold text-ink">{t("home.hours")}</p>
                  <p className="text-muted">{t("biz.hours1")}</p>
                  <p className="text-muted">{t("biz.hours2")}</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <TanzaniaMap />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-surface p-6 shadow-card md:p-10">
          <p className="text-micro font-semibold tracking-mark text-accent uppercase">
            {t("home.enqEyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink">{t("home.enqTitle")}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {t("home.enqIntro")}
          </p>
          <div className="mt-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
