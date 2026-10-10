import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/config/business";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";

const phones = business.phones.map((phone) => phone.display).join(", ");

// NOTE FOR THE OWNER: this is a plain-language starting point, not legal advice.
// Have it checked against Tanzanian data-protection rules and edit anything that is not true for your business.
const sections: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `${business.name} is a car dealership in ${business.city}, ${business.country}. You can reach us on ${phones} or at ${business.email}.`,
    ],
  },
  {
    heading: "What information we collect",
    paragraphs: [
      "When you send an enquiry or ask about a vehicle through this website, we receive what you type in: your name, email address, phone number, the vehicle you are asking about, and your message.",
      "If you message or call us on WhatsApp or by phone, we receive what you send us there. Visitors do not need an account to use this website. Our staff sign in to a private dealer desk, which uses a cookie so the site can recognise them.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "We use your details to answer your enquiry, arrange a viewing and follow up on a purchase you asked about. We do not sell your personal information.",
    ],
  },
  {
    heading: "Other services involved",
    paragraphs: [
      "Our WhatsApp buttons open the WhatsApp app, where WhatsApp's own privacy policy applies. This website also loads its fonts from Google Fonts, so your browser contacts Google's servers when a page loads.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep an enquiry for as long as we need it to deal with your request and keep a record of it. After that we delete it.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      `You can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Email ${business.email} or message us on WhatsApp and we will help.`,
    ],
  },
  {
    heading: "Changes to this page",
    paragraphs: [
      "We may update this page from time to time. The date at the top shows when it last changed.",
    ],
  },
];

export const Route = createFileRoute("/privacy")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Privacy policy | ${business.name}`,
      description: `How ${business.name} handles the information you send us when you enquire about a vehicle.`,
      path: "/privacy",
    }),
  component: () => (
    <LegalPage
      eyebrow="Your information"
      title="Privacy Policy"
      subtitle="What we collect when you contact us, why, and what you can ask us to do."
      updated="October 2026"
      sections={sections}
    />
  ),
});
