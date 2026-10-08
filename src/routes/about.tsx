import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { Shield, Sparkles, Users } from "lucide-react";
import { business } from "@/config/business";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";
import { pillars } from "@/data/catalog";

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
  return (
    <SiteShell>
      <PageHero
        eyebrow="Who we are"
        title={`About ${business.name}`}
        subtitle={`${business.tagline}. Message or call us any time, 24 hours a day, 7 days a week.`}
        image="/images/about-hero.jpg"
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-2xl shadow-card">
          <img
            src="/images/showroom.jpg"
            alt={`${business.name} showroom`}
            className="aspect-4/3 w-full object-cover"
          />
        </div>
        <div>
          <p className="text-micro font-semibold tracking-mark text-accent uppercase">Our story</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            Cars You Can Ask Us About, Any Time
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {business.name} is a car dealership based in {business.city}, {business.country}. We
            help buyers find a vehicle that suits their needs and budget, and we keep the process
            simple: clear prices, straight answers, and a real person on the other end of the phone.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            You can reach us on WhatsApp or by phone at any hour. Browse the inventory, pick a car,
            and message us to ask questions or arrange a viewing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <p className="text-center text-micro font-semibold tracking-mark text-accent uppercase">
          What we stand for
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl text-ink">Our Promises</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((item, index) => {
            const Icon = PILLAR_ICONS[index] ?? Shield;
            return (
              <article key={item.title} className="rounded-2xl bg-surface p-7 shadow-card">
                <span className="grid size-11 place-items-center rounded-full bg-canvas text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
