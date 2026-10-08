import { createFileRoute } from "@tanstack/react-router";
import { getSiteOrigin } from "@/lib/site";
import { listVehicles } from "@/lib/vehicle-store.server";

const STATIC_PAGES = ["/", "/inventory", "/about", "/services", "/contact"];

/** Keeps stray characters in a slug from breaking the XML. */
const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      // A fresh list of every car for Google. Built on request so a car you add in the admin
      // is included automatically. Sold cars are left out (nobody should land on them from search).
      GET: async () => {
        const origin = await getSiteOrigin();
        const cars = listVehicles().filter((car) => car.status !== "sold");
        const urls = [...STATIC_PAGES, ...cars.map((car) => `/inventory/${car.slug}`)];
        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((path) => `  <url><loc>${esc(origin + path)}</loc></url>`).join("\n") +
          `\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
