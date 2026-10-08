import { createFileRoute, Link } from "@tanstack/react-router";
import { business } from "@/config/business";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { services } from "@/data/catalog";

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
  return (
    <SiteShell>
      <PageHero
        eyebrow="What we do"
        title="Our Services"
        subtitle="From finding the right car to answering your questions on WhatsApp, here is how we can help."
        image="/images/services-hero.jpg"
      />
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <p className="text-center text-micro font-semibold tracking-mark text-accent uppercase">
          Professional services
        </p>
        <h2 className="mt-2 text-center font-serif text-3xl text-ink">Professional Services</h2>
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
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Learn more <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Ready to find your next car?</h2>
          <p className="mt-3 text-sm text-muted">
            Message or call us on WhatsApp. We are open 24 hours a day, 7 days a week.
          </p>
          <Button asChild className="mt-8">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
