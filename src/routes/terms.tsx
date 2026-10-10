import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/config/business";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";

// NOTE FOR THE OWNER: plain-language starting point, not legal advice. Add your real rules on
// deposits, reservations, warranty and refunds here, and have a lawyer review the page.
const sections: LegalSection[] = [
  {
    heading: "About this website",
    paragraphs: [
      `This website lists vehicles available from ${business.name} and lets you contact us. By using it you agree to these terms.`,
    ],
  },
  {
    heading: "Listings and prices",
    paragraphs: [
      "We try to keep every listing accurate, but details, prices (shown in Tanzanian shillings, TZS) and availability can change without notice. A listing is not a binding offer until we have confirmed it with you directly.",
      "Please confirm the details with us on WhatsApp or by phone before you travel to see a vehicle.",
    ],
  },
  {
    heading: "No online payments",
    paragraphs: [
      "This website does not take payments. Price, payment and handover are agreed directly with us.",
    ],
  },
  {
    heading: "Enquiries and viewings",
    paragraphs: [
      "Sending an enquiry does not reserve a vehicle. A vehicle is only reserved once we confirm that to you.",
    ],
  },
  {
    heading: "Photos and content",
    paragraphs: [
      `The photos and text on this website belong to ${business.name} or are used with permission. Please do not copy them without asking us first.`,
    ],
  },
  {
    heading: "Our responsibility",
    paragraphs: [
      "To the extent the law allows, we are not responsible for any loss that comes from relying on information on this website without confirming it with us first.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: ["These terms are governed by the laws of the United Republic of Tanzania."],
  },
  {
    heading: "Contact",
    paragraphs: [
      `Questions about these terms? Email ${business.email} or message us on WhatsApp. We are open 24 hours a day, 7 days a week.`,
    ],
  },
];

export const Route = createFileRoute("/terms")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Terms of use | ${business.name}`,
      description: `The terms for using the ${business.name} website: listings, prices, enquiries and viewings.`,
      path: "/terms",
    }),
  component: () => (
    <LegalPage
      eyebrow="The small print"
      title="Terms of Use"
      subtitle="How listings, prices and enquiries work on this website."
      updated="October 2026"
      sections={sections}
    />
  ),
});
