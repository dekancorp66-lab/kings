import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/config/business";
import { useI18n, type Lang } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";

// NOTE FOR THE OWNER: plain-language starting point, not legal advice. Add your real rules on
// deposits, reservations, warranty and refunds here, and have a lawyer review the page.
// Keep the English and Swahili versions saying the same thing when you edit one of them.
const sections: Record<Lang, LegalSection[]> = {
  en: [
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
  ],
  sw: [
    {
      heading: "Kuhusu tovuti hii",
      paragraphs: [
        `Tovuti hii inaorodhesha magari yanayopatikana kutoka ${business.name} na hukuruhusu kuwasiliana nasi. Kwa kuitumia unakubali masharti haya.`,
      ],
    },
    {
      heading: "Matangazo na bei",
      paragraphs: [
        "Tunajitahidi kuweka kila tangazo sahihi, lakini maelezo, bei (zinazoonyeshwa kwa shilingi za Tanzania, TZS) na upatikanaji vinaweza kubadilika bila taarifa. Tangazo si ofa inayofunga hadi tuthibitishe nawe moja kwa moja.",
        "Tafadhali thibitisha maelezo nasi kupitia WhatsApp au simu kabla ya kusafiri kuliona gari.",
      ],
    },
    {
      heading: "Hakuna malipo ya mtandaoni",
      paragraphs: [
        "Tovuti hii haipokei malipo. Bei, malipo na makabidhiano hukubaliwa moja kwa moja nasi.",
      ],
    },
    {
      heading: "Maswali na kuona gari",
      paragraphs: [
        "Kutuma swali hakuhifadhi gari. Gari huhifadhiwa tu pale tunapokuthibitishia hilo.",
      ],
    },
    {
      heading: "Picha na maudhui",
      paragraphs: [
        `Picha na maandishi kwenye tovuti hii ni mali ya ${business.name} au yanatumika kwa ruhusa. Tafadhali usiyanakili bila kutuomba kwanza.`,
      ],
    },
    {
      heading: "Wajibu wetu",
      paragraphs: [
        "Kwa kiwango ambacho sheria inaruhusu, hatuwajibiki kwa hasara yoyote inayotokana na kutegemea taarifa za tovuti hii bila kuthibitisha nasi kwanza.",
      ],
    },
    {
      heading: "Sheria inayotawala",
      paragraphs: ["Masharti haya yanatawaliwa na sheria za Jamhuri ya Muungano wa Tanzania."],
    },
    {
      heading: "Mawasiliano",
      paragraphs: [
        `Una maswali kuhusu masharti haya? Tuandikie kwa ${business.email} au tutumie ujumbe kwenye WhatsApp. Tuko wazi saa 24 kwa siku, siku 7 kwa wiki.`,
      ],
    },
  ],
};

export const Route = createFileRoute("/terms")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Terms of use | ${business.name}`,
      description: `The terms for using the ${business.name} website: listings, prices, enquiries and viewings.`,
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  const { lang, t } = useI18n();
  return (
    <LegalPage
      eyebrow={t("terms.eyebrow")}
      title={t("terms.title")}
      subtitle={t("terms.subtitle")}
      updated={t("legal.updatedDate")}
      sections={sections[lang]}
    />
  );
}
