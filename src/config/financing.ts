/**
 * SINGLE SOURCE OF TRUTH for the loan options shown on the website.
 * Change the lenders, percentages and document lists here and every page updates.
 * Public information only (never passwords).
 */
import type { Phone } from "@/config/business";

export type L = "en" | "sw";

export type Lender = {
  id: string;
  /** TODO: put the real bank / lender names here. */
  name: Record<L, string>;
  /** Share of the car price that the lender pays, in %. The customer pays the rest as a deposit. */
  financePercent: number;
  /** Longest repayment period, in months. */
  maxMonths: number;
  /** Interest as the lender quotes it, e.g. "2.63%". Leave "" to hide it. */
  interest: string;
  /** TODO: confirm with the lender, then set "month" or "year". Until then no unit is shown. */
  interestPer: "" | "month" | "year";
  /** Who pays for the comprehensive car insurance. TODO: confirm lender 3. */
  insurance: "customer" | "lender";
  /** Optional: the lender's contact, so customers can ask about monthly repayments. */
  phone?: Phone;
  /** Branch ids (see branches.ts) where customers can meet this lender. */
  branches?: string[];
};

export const lenders: Lender[] = [
  {
    id: "lender1",
    name: { en: "Lender 1", sw: "Mtoa Mkopo wa 1" },
    financePercent: 65,
    maxMonths: 36,
    interest: "2.63%",
    interestPer: "",
    insurance: "customer",
    branches: ["dar", "arusha", "moshi", "mwanza", "mbeya"],
  },
  {
    id: "lender2",
    name: { en: "Lender 2", sw: "Mtoa Mkopo wa 2" },
    financePercent: 50,
    maxMonths: 24,
    interest: "3.5%",
    interestPer: "",
    insurance: "customer",
  },
  {
    id: "lender3",
    name: { en: "Lender 3", sw: "Mtoa Mkopo wa 3" },
    financePercent: 70,
    maxMonths: 36,
    interest: "",
    interestPer: "",
    insurance: "lender",
  },
];

export const depositPercent = (lender: Lender) => 100 - lender.financePercent;
export const depositFor = (price: number, lender: Lender) => Math.round((price * depositPercent(lender)) / 100);
export const loanFor = (price: number, lender: Lender) => Math.round((price * lender.financePercent) / 100);

export type Kind = "employee" | "business";

export const documents: Record<Kind, Record<L, string[]>> = {
  employee: {
    en: [
      "National ID (NIDA) or another accepted ID",
      "Passport-size photos",
      "Introduction letter, if required",
      "Proof of residence, if required",
      "Salary slips for 3 months or the period required",
      "Employment confirmation letter",
      "Employment contract, if required",
      "Bank statements for 3–6 months, depending on the loan product",
      "Quotation / pro forma invoice for the car",
      "Vehicle documents",
      "Proof of the deposit (initial payment)",
      "Guarantor or next-of-kin documents, if required",
    ],
    sw: [
      "NIDA au kitambulisho kinachokubalika",
      "Picha za passport",
      "Barua ya utambulisho, ikiwa inahitajika",
      "Uthibitisho wa makazi, ikiwa unahitajika",
      "Salary slips za miezi 3 au kipindi kinachotakiwa",
      "Barua ya uthibitisho wa ajira",
      "Mkataba wa ajira, ikiwa unahitajika",
      "Bank statements za miezi 3–6, kulingana na bidhaa ya mkopo",
      "Quotation / pro forma invoice ya gari",
      "Nyaraka za gari",
      "Uthibitisho wa mchango wa awali",
      "Nyaraka za mdhamini au next of kin, ikiwa zinahitajika",
    ],
  },
  business: {
    en: [
      "National ID (NIDA) or another accepted ID",
      "Passport-size photos",
      "Introduction letter from the local / village government",
      "Proof of residence, if required",
      "Bank statements for 6 months, or the period the lender requires",
      "Business licence, where required",
      "TIN certificate, if required",
      "Evidence of income and how the business is doing",
      "Vehicle documents and quotation / pro forma invoice",
      "Proof of the deposit (initial payment)",
      "Guarantor or next-of-kin documents, if required",
    ],
    sw: [
      "NIDA au kitambulisho kinachokubalika",
      "Picha za passport",
      "Barua ya utambulisho kutoka serikali ya mtaa/kijiji",
      "Uthibitisho wa makazi, ikiwa unahitajika",
      "Bank statements za miezi 6, au kipindi kinachotakiwa na mtoa mkopo",
      "Leseni ya biashara, pale inapohitajika",
      "TIN certificate, ikiwa inahitajika",
      "Ushahidi wa mapato na mwenendo wa biashara",
      "Nyaraka za gari na quotation / proforma",
      "Uthibitisho wa mchango wa awali",
      "Nyaraka za mdhamini au next of kin, ikiwa zinahitajika",
    ],
  },
};

type Copy = {
  navLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  cardTitle: string;
  cardIntro: string;
  cardCta: string;
  deposit: string;
  loan: string;
  upTo: (months: number) => string;
  interest: string;
  perMonth: string;
  perYear: string;
  insurance: string;
  insuranceCustomer: string;
  insuranceLender: string;
  repayNote: string;
  estimateNote: string;
  step1: string;
  pickCar: string;
  noCar: string;
  priceLabel: string;
  step2: string;
  myDeposit: string;
  myDepositHelp: string;
  enough: string;
  short: (amount: string) => string;
  step3: string;
  employee: string;
  business: string;
  businessHelp: string;
  ready: (done: number, total: number) => string;
  step4: string;
  sendIntro: string;
  sendButton: string;
  callLender: string;
  meetAt: string;
  waCar: string;
  waPrice: string;
  waDeposit: string;
  waKind: string;
  waEnd: string;
};

export const copy: Record<L, Copy> = {
  en: {
    navLabel: "Financing",
    heroEyebrow: "Financing",
    heroTitle: "Car loan options",
    heroSubtitle:
      "See how much deposit you need and which documents to prepare. Our partner lenders handle the loan and the monthly repayments.",
    cardTitle: "Loan options for this car",
    cardIntro: "How much you start with (deposit) depends on the lender:",
    cardCta: "Plan my loan",
    deposit: "Deposit",
    loan: "Loan",
    upTo: (months) => `Repay over up to ${months} months`,
    interest: "Interest",
    perMonth: "per month",
    perYear: "per year",
    insurance: "Insurance",
    insuranceCustomer: "Comprehensive car insurance is paid by the customer",
    insuranceLender: "Insurance is handled by the lender",
    repayNote: "Monthly repayments are set by the lender. Please ask the lender directly.",
    estimateNote:
      "This estimate does not include interest, insurance, fees, taxes or other costs. The final loan amount depends on the lender's valuation and terms.",
    step1: "1. Choose the car or enter a price",
    pickCar: "Pick a car from our stock",
    noCar: "Enter my own price",
    priceLabel: "Car price (TZS)",
    step2: "2. How much you start with",
    myDeposit: "How much can you pay as a deposit? (optional)",
    myDepositHelp: "We will show which lenders your deposit is enough for.",
    enough: "Your deposit is enough",
    short: (amount) => `You need ${amount} more`,
    step3: "3. Documents you need",
    employee: "I am employed",
    business: "I run a business / self-employed",
    businessHelp: "For business owners, companies, shops or other self-employed work.",
    ready: (done, total) => `${done} of ${total} ready`,
    step4: "4. Talk to us",
    sendIntro: "Send us your plan on WhatsApp and we will connect you with the lender.",
    sendButton: "Send my plan on WhatsApp",
    callLender: "Contact lender",
    meetAt: "Meet this lender at our branches",
    waCar: "Car",
    waPrice: "Price",
    waDeposit: "Deposit I can pay",
    waKind: "I am",
    waEnd: "Please help me with a car loan.",
  },
  sw: {
    navLabel: "Mkopo",
    heroEyebrow: "Mkopo",
    heroTitle: "Chaguo za mkopo wa gari",
    heroSubtitle:
      "Angalia kiasi cha malipo ya awali unachohitaji na nyaraka za kuandaa. Watoa mkopo wetu washirika wanashughulikia mkopo na marejesho ya kila mwezi.",
    cardTitle: "Chaguo za mkopo kwa gari hili",
    cardIntro: "Kiasi unachoanza nacho (malipo ya awali) kinategemea mtoa mkopo:",
    cardCta: "Panga mkopo wangu",
    deposit: "Malipo ya awali",
    loan: "Mkopo",
    upTo: (months) => `Marejesho hadi miezi ${months}`,
    interest: "Riba",
    perMonth: "kwa mwezi",
    perYear: "kwa mwaka",
    insurance: "Bima",
    insuranceCustomer: "Bima kubwa ya gari inalipwa na mteja",
    insuranceLender: "Bima inashughulikiwa na mtoa mkopo",
    repayNote: "Marejesho ya kila mwezi ni jukumu la mtoa mkopo. Tafadhali muulize mtoa mkopo moja kwa moja.",
    estimateNote:
      "Hesabu hii haijajumuisha riba, bima, ada, kodi au gharama nyingine. Kiwango halisi cha mkopo hutegemea tathmini na masharti ya mtoa mkopo.",
    step1: "1. Chagua gari au weka bei",
    pickCar: "Chagua gari kutoka kwenye magari yetu",
    noCar: "Naweka bei yangu mwenyewe",
    priceLabel: "Bei ya gari (TZS)",
    step2: "2. Kiasi unachoanza nacho",
    myDeposit: "Unaweza kulipa kiasi gani kama malipo ya awali? (si lazima)",
    myDepositHelp: "Tutakuonyesha watoa mkopo ambao malipo yako yanatosha.",
    enough: "Malipo yako yanatosha",
    short: (amount) => `Unahitaji ${amount} zaidi`,
    step3: "3. Nyaraka unazohitaji",
    employee: "Nimeajiriwa",
    business: "Nina biashara / nimejiajiri",
    businessHelp: "Kwa wenye biashara, kampuni, maduka au shughuli za kujiajiri.",
    ready: (done, total) => `${done} kati ya ${total} tayari`,
    step4: "4. Zungumza nasi",
    sendIntro: "Tutumie mpango wako kwa WhatsApp nasi tutakuunganisha na mtoa mkopo.",
    sendButton: "Tuma mpango wangu kwa WhatsApp",
    callLender: "Wasiliana na mtoa mkopo",
    meetAt: "Kutana na mtoa mkopo huyu kwenye matawi yetu",
    waCar: "Gari",
    waPrice: "Bei",
    waDeposit: "Malipo ya awali ninayoweza kulipa",
    waKind: "Mimi ni",
    waEnd: "Naomba msaada wa mkopo wa gari.",
  },
};
