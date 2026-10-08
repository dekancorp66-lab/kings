import { createFileRoute } from "@tanstack/react-router";
import { getSiteOrigin } from "@/lib/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = await getSiteOrigin();
        // Why Allow /api/uploads/ first: car photos you upload are served from there, and
        // Google/WhatsApp must be able to fetch them. The admin area and the rest of the API stay private.
        const body = [
          "User-agent: *",
          "Allow: /api/uploads/",
          "Disallow: /curator",
          "Disallow: /api/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
