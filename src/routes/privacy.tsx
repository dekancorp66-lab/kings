import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/config/business";
import { useI18n, type Lang } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";

const phones = business.phones.map((phone) => phone.display).join(", ");

// NOTE FOR THE OWNER: this is a plain-language starting point, not legal advice.
// Have it checked against Tanzanian data-protection rules and edit anything that is not true for your business.
// Keep the English and Swahili versions saying the same thing when you edit one of them.
const sections: Record<Lang, LegalSection[]> = {
  en: [
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
  ],
  sw: [
    {
      heading: "Sisi ni nani",
      paragraphs: [
        `${business.name} ni muuzaji wa magari anayepatikana ${business.city}, ${business.country}. Unaweza kutupata kupitia ${phones} au ${business.email}.`,
      ],
    },
    {
      heading: "Taarifa tunazokusanya",
      paragraphs: [
        "Unapotuma swali au kuuliza kuhusu gari kupitia tovuti hii, tunapokea unachoandika: jina lako, barua pepe, namba ya simu, gari unalouliza kulihusu, na ujumbe wako.",
        "Ukitutumia ujumbe au kutupigia kwenye WhatsApp au kwa simu, tunapokea unachotutumia huko. Wageni hawahitaji akaunti ili kutumia tovuti hii. Wafanyakazi wetu huingia kwenye dawati la muuzaji la faragha, ambalo hutumia cookie ili tovuti iwatambue.",
      ],
    },
    {
      heading: "Jinsi tunavyozitumia",
      paragraphs: [
        "Tunatumia taarifa zako kujibu swali lako, kupanga kuliona gari na kufuatilia ununuzi uliouliza kuuhusu. Hatuuzi taarifa zako binafsi.",
      ],
    },
    {
      heading: "Huduma nyingine zinazohusika",
      paragraphs: [
        "Vitufe vyetu vya WhatsApp hufungua programu ya WhatsApp, ambako sera ya faragha ya WhatsApp yenyewe inatumika. Tovuti hii pia hupakia fonti zake kutoka Google Fonts, kwa hivyo kivinjari chako huwasiliana na seva za Google ukurasa unapopakiwa.",
      ],
    },
    {
      heading: "Muda tunaozihifadhi",
      paragraphs: [
        "Tunahifadhi swali kwa muda tunaohitaji kushughulikia ombi lako na kuweka kumbukumbu yake. Baada ya hapo tunalifuta.",
      ],
    },
    {
      heading: "Chaguo zako",
      paragraphs: [
        `Unaweza kutuuliza tunashikilia taarifa gani kukuhusu, kutuomba tuzirekebishe, au kutuomba tuzifute. Tuandikie kwa ${business.email} au tutumie ujumbe kwenye WhatsApp nasi tutakusaidia.`,
      ],
    },
    {
      heading: "Mabadiliko ya ukurasa huu",
      paragraphs: [
        "Tunaweza kusasisha ukurasa huu mara kwa mara. Tarehe iliyo juu inaonyesha ulipobadilishwa mara ya mwisho.",
      ],
    },
  ],
};

export const Route = createFileRoute("/privacy")({
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Privacy policy | ${business.name}`,
      description: `How ${business.name} handles the information you send us when you enquire about a vehicle.`,
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang, t } = useI18n();
  return (
    <LegalPage
      eyebrow={t("privacy.eyebrow")}
      title={t("privacy.title")}
      subtitle={t("privacy.subtitle")}
      updated={t("legal.updatedDate")}
      sections={sections[lang]}
    />
  );
}
