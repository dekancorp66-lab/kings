import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { Shield, Sparkles, Users } from "lucide-react";
import { business } from "@/config/business";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";
import { pillars } from "@/data/catalog";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `About us | ${business.name}`,
      description: `${business.name} is a car dealership in ${business.city}, ${business.country}. Message or call us any time, 24 hours a day.`,
      path: "/about",
    }),
  component: AboutPage,
});

const PILLAR_ICONS = [Shield, Sparkles, Users];

function AboutPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero
        compact
        eyebrow={t("about.eyebrow")}
        title={t("about.title", { name: business.name })}
        subtitle={`${t("biz.tagline")}. ${t("about.subtitle")}`}
        image="/images/about-hero.jpg"
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-2xl shadow-card">
          <img
            src="/images/king-sellers-logo.jpg"
            alt={`${business.name} logo`}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <p className="text-micro font-semibold tracking-mark text-accent uppercase">
            {t("about.storyEyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            {t("about.storyTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {t("about.p1", { name: business.name, city: business.city, country: business.country })}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {t("about.p2")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <p className="text-center text-micro font-semibold tracking-mark text-accent uppercase">
          {t("about.stand")}
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl text-ink">{t("about.promises")}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((item, index) => {
            const Icon = PILLAR_ICONS[index] ?? Shield;
            const titleKey = `pillar.${index}.title` as TranslationKey;
            const bodyKey = `pillar.${index}.body` as TranslationKey;
            return (
              <article key={item.title} className="rounded-2xl bg-surface p-7 shadow-card">
                <span className="grid size-11 place-items-center rounded-full bg-canvas text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
