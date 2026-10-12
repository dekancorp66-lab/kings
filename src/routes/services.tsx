import { createFileRoute, Link } from "@tanstack/react-router";
import { business } from "@/config/business";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { services } from "@/data/catalog";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Our services | ${business.name}`,
      description: `How ${business.name} in ${business.city} can help you find and buy a car. Chat with us on WhatsApp, open 24/7.`,
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero
        eyebrow={t("services.eyebrow")}
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        image="/images/services-hero.jpg"
      />
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <p className="text-center text-micro font-semibold tracking-mark text-accent uppercase">
          {t("services.proEyebrow")}
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl text-ink">{t("services.proTitle")}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <article
              key={item.id}
              id={item.id}
              className="overflow-hidden rounded-2xl bg-surface shadow-card"
            >
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="aspect-16/10 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ink">
                  {t(`service.${item.id}.title` as TranslationKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`service.${item.id}.summary` as TranslationKey)}
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
                >
                  {t("services.learn")} <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">{t("services.readyTitle")}</h2>
          <p className="mt-3 text-sm text-muted">
            {t("services.readyBody")}
          </p>
          <Button asChild className="mt-8">
            <Link to="/contact">{t("services.contactBtn")}</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
