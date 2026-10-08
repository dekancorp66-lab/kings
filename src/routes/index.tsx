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
import { business } from "@/config/business";
import { standards } from "@/data/catalog";
import { useVehicles } from "@/lib/vehicles";

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
  const featured = useVehicles().filter((item) => item.featured);

  return (
    <SiteShell>
      <section className="relative isolate min-h-[34rem] overflow-hidden bg-navy md:min-h-[40rem]">
        <HeroReel />
        <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-center px-5 py-20 md:min-h-[40rem] lg:px-8">
          <p className="text-micro font-semibold tracking-mark text-inverse/70 uppercase">
            {business.name}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight text-inverse uppercase sm:text-5xl md:text-6xl">
            Drive something
            <br />
            exceptional.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-inverse/75 md:text-base">
            Premium vehicles. Carefully selected. Ready for the discerning driver who demands
            something beyond the ordinary.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/inventory">Explore inventory</Link>
            </Button>
          </div>
        </div>
      </section>

      <SearchPanel />

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-micro font-semibold tracking-mark text-accent uppercase">
              Featured arrivals
            </p>
            <h2 className="mt-1 font-serif text-3xl text-ink md:text-4xl">Featured Vehicles</h2>
          </div>
          <Link to="/inventory" className="text-sm font-medium text-accent hover:text-accent-hover">
            Browse entire catalogue
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="text-center">
            <p className="text-micro font-semibold tracking-mark text-accent uppercase">
              Why choose us
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Why Buy From Us</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((item, index) => {
              const Icon = ICONS[index] ?? ShieldCheck;
              return (
                <article key={item.title} className="rounded-2xl bg-canvas p-6 shadow-card">
                  <span className="grid size-11 place-items-center rounded-xl bg-surface text-accent shadow-card">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-micro font-semibold tracking-mark text-accent uppercase">Find us</p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Visit Us</h2>
            <ul className="mt-8 space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 text-accent" />
                <div>
                  <p className="font-semibold text-ink">Address</p>
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
                  <p className="font-semibold text-ink">Phone & WhatsApp</p>
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
                  <p className="font-semibold text-ink">Opening hours</p>
                  {business.hours.map((line) => (
                    <p key={line} className="text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-navy p-8 text-inverse shadow-card">
            <p className="text-micro font-semibold tracking-mark text-inverse/60 uppercase">
              Talk to us now
            </p>
            <h3 className="mt-2 font-serif text-3xl">Ask about any car on WhatsApp</h3>
            <p className="mt-3 text-sm text-inverse/70">
              Send us a message or call. We are open 24 hours a day, 7 days a week.
            </p>
            <div className="mt-6">
              <ContactButtons tone="dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl bg-surface p-6 shadow-card md:p-10">
          <p className="text-micro font-semibold tracking-mark text-accent uppercase">
            Private correspondence
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Send a Direct Enquiry</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Tell us the motorcar, the window, and how you would like to view it. A curator replies
            personally.
          </p>
          <div className="mt-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
