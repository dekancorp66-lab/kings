import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { pageHead, vehicleDescription, vehicleJsonLd } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { ContactButtons } from "@/components/contact-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import type { Vehicle } from "@/data/types";
import { getVehicles } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

type VehicleLoaderData = { vehicle: Vehicle; origin: string };

/** What WhatsApp/Facebook show when someone shares the link: photo, name, price. */
function vehicleHead(data: VehicleLoaderData | undefined) {
  if (!data) return {};
  const { vehicle, origin } = data;
  const name = `${vehicle.year} ${vehicle.name} ${vehicle.trim}`.trim();
  return pageHead({
    origin,
    title: `${name} - ${formatPrice(vehicle.price)} | ${business.name}`,
    description: vehicleDescription(vehicle),
    path: `/inventory/${vehicle.slug}`,
    image: vehicle.images[0],
    jsonLd: [vehicleJsonLd(vehicle, origin)],
    // Sold cars stay viewable but drop out of Google.
    noindex: vehicle.status === "sold",
  });
}

export const Route = createFileRoute("/inventory/$slug")({
  // Explicit return type: it keeps TypeScript from losing the Vehicle type through head().
  loader: async ({ params }): Promise<VehicleLoaderData> => {
    const vehicle = (await getVehicles()).find((item) => item.slug === params.slug);
    if (!vehicle) throw notFound();
    return { vehicle, origin: await getSiteOrigin() };
  },
  head: ({ loaderData }) => vehicleHead(loaderData),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { vehicle } = Route.useLoaderData();

  // The page link is added after mount (not during render) so the server and browser HTML match.
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);
  const whatsappMessage =
    `Hello ${business.name}, I am interested in the ${vehicle.year} ${vehicle.name} ${vehicle.trim} ` +
    `(${formatPrice(vehicle.price)}). Is it still available?` +
    (pageUrl ? `\n${pageUrl}` : "");

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        {/* min-w-0 stops the thumbnail strip from stretching the grid column on small screens */}
        <div className="min-w-0">
          <VehicleGallery
            images={vehicle.images}
            categories={vehicle.imageCategories}
            alt={`${vehicle.year} ${vehicle.name} ${vehicle.trim}`}
          />
        </div>

        <div>
          {vehicle.badge === "new" ? <Badge tone="accent">New arrival</Badge> : null}
          <p className="mt-3 text-sm text-muted">{vehicle.year}</p>
          <h1 className="font-serif text-3xl text-ink md:text-4xl">
            {vehicle.name} {vehicle.trim}
          </h1>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-ink">
            {formatPrice(vehicle.price)}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted">{vehicle.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-6">
            {vehicle.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-micro tracking-nav text-subtle uppercase">{spec.label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-ink">Interested? Ask us on WhatsApp</p>
            <ContactButtons message={whatsappMessage} />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/contact" search={{ vehicle: vehicle.slug }}>
                Contact dealer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <div className="rounded-2xl bg-surface p-6 shadow-card md:p-10">
          <h2 className="font-serif text-2xl text-ink md:text-3xl">Technical Specifications</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {vehicle.technical.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-3"
              >
                <dt className="text-sm text-muted">{spec.label}</dt>
                <dd className="text-sm font-semibold text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SiteShell>
  );
}
