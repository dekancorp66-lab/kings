import { business } from "@/config/business";
import type { PublicVehicle } from "@/data/types";
import type { DetailedHTMLProps, MetaHTMLAttributes } from "react";
import { formatKm, formatPrice } from "@/lib/utils";

/** Share picture used when a page has no better one (1200x630, branded). */
export const DEFAULT_SHARE_IMAGE = "/og.jpg";

/** Turns "/inventory" or "/images/x.jpg" into "https://yoursite.com/inventory". */
export function abs(origin: string, path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageHeadInput = {
  origin: string;
  title: string;
  description: string;
  /** Path of this page WITHOUT query string, used for the canonical link and og:url */
  path: string;
  image?: string;
  type?: "website" | "article";
  /** Structured data for Google (JSON-LD). Escaped safely by the router. */
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
};

/**
 * Builds every <meta> tag a page needs for Google AND for link previews (WhatsApp, Facebook,
 * X). WhatsApp reads the Open Graph (og:*) tags: that is what makes a shared car link show
 * the car photo, name and price instead of a bare URL.
 */
type MetaTag = DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;

export function pageHead({
  origin,
  title,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
  type = "website",
  jsonLd = [],
  noindex = false,
}: PageHeadInput) {
  const url = abs(origin, path);
  const img = abs(origin, image);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: business.name },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: img },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      // The router turns a {"script:ld+json": data} entry into a safe <script type="application/ld+json">.
      // Its TypeScript types don't list that key yet, hence the cast.
      ...jsonLd.map((data) => ({ "script:ld+json": data })),
    ] as unknown as MetaTag[],
    links: [{ rel: "canonical", href: url }],
  };
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Tells Google who/where the business is (shown in Maps-style results). Built from business.ts. */
export function businessJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: business.name,
    url: origin,
    image: abs(origin, DEFAULT_SHARE_IMAGE),
    email: business.email,
    telephone: `+${business.phones[0].intl}`,
    address: { "@type": "PostalAddress", addressLocality: business.city, addressCountry: "TZ" },
    // Open 24 hours, 7 days a week
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_DAYS,
        opens: "00:00",
        closes: "23:59",
      },
    ],
  };
}

/** Lets Google show the car with its price and mileage in search results. */
export function vehicleJsonLd(vehicle: PublicVehicle, origin: string) {
  const title = `${vehicle.year} ${vehicle.name} ${vehicle.trim}`.trim();
  const availability =
    vehicle.status === "sold"
      ? "https://schema.org/SoldOut"
      : vehicle.status === "pending"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    url: abs(origin, `/inventory/${vehicle.slug}`),
    image: vehicle.images.slice(0, 6).map((src) => abs(origin, src)),
    description: vehicle.description,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    bodyType: vehicle.body,
    fuelType: vehicle.fuel,
    vehicleTransmission: vehicle.transmission,
    color: vehicle.color,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "TZS",
      availability,
      seller: { "@type": "AutoDealer", name: business.name },
    },
  };
}

/** Short, WhatsApp-friendly description: price, km, fuel, gearbox, and where to ask. */
export function vehicleDescription(vehicle: PublicVehicle) {
  return (
    `${formatPrice(vehicle.price)} · ${formatKm(vehicle.mileage)} · ${vehicle.fuel} · ${vehicle.transmission}. ` +
    `For sale in ${business.city}. Chat with ${business.name} on WhatsApp to ask or arrange a viewing.`
  );
}
