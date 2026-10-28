"use client";

/**
 * Tiny English / Swahili translation system (no extra library needed).
 *
 * HOW IT WORKS
 *  - Every visible word lives in the `en` and `sw` tables below, under one shared key.
 *  - Components call `const { t } = useI18n()` and write `t("nav.home")`.
 *  - The visitor's choice is saved in localStorage, so it is remembered next visit.
 *
 * TO ADD OR FIX A TRANSLATION: edit the line in `en` and the SAME key in `sw`.
 * TypeScript will refuse to build if a key exists in English but is missing in Swahili,
 * so the two languages can never silently drift apart.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "sw";
const STORAGE_KEY = "kingsellers-lang";

const en = {
  // ---- navigation / header ----
  "nav.home": "Home",
  "nav.inventory": "Inventory",
  "nav.services": "Services",
  "nav.financing": "Financing",
  "nav.about": "About Us",
  "nav.contact": "Contact",
  "header.openMenu": "Open menu",
  "header.closeMenu": "Close menu",
  "lang.label": "Language",

  // ---- business details ----
  "biz.tagline": "Quality vehicles in Dar es Salaam",
  "biz.hours1": "Open 24 hours",
  "biz.hours2": "7 days a week",

  // ---- WhatsApp / call ----
  "wa.greeting": "Hello {name}, I would like to ask about a car.",
  "wa.interest": "Hello {name}, I am interested in the {car} ({price}). Is it still available?",
  "wa.chat": "Chat on WhatsApp",
  "wa.chatAria": "Chat with us on WhatsApp",
  "btn.call": "Call",
  "btn.callAria": "Call {phone}",

  // ---- home ----
  "home.hero1": "Drive something",
  "home.hero2": "exceptional.",
  "home.heroSub":
    "Premium vehicles. Carefully selected. Ready for the discerning driver who demands something beyond the ordinary.",
  "home.explore": "Explore inventory",
  "home.featuredEyebrow": "Featured arrivals",
  "home.featuredTitle": "Featured Vehicles",
  "home.browseAll": "Browse entire catalogue",
  "home.whyEyebrow": "Why choose us",
  "home.whyTitle": "Why Buy From Us",
  "home.findEyebrow": "Find us",
  "home.findTitle": "Visit Us",
  "home.address": "Address",
  "home.phone": "Phone & WhatsApp",
  "home.hours": "Opening hours",
  "home.enqEyebrow": "Private correspondence",
  "home.enqTitle": "Send a Direct Enquiry",
  "home.enqIntro":
    "Tell us the motorcar, the window, and how you would like to view it. A curator replies personally.",

  // ---- search panel ----
  "search.eyebrow": "The catalogue",
  "search.title": "Find Your Perfect Vehicle",
  "search.make": "Make",
  "search.body": "Body",
  "search.yearMin": "Year min",
  "search.yearMax": "Year max",
  "search.fuel": "Fuel",
  "search.transmission": "Transmission",
  "search.all": "All",
  "search.noMin": "No minimum",
  "search.noMax": "No maximum",
  "search.submit": "Search vehicles",
  "search.q": "Search",
  "search.qPlaceholder": "Search by make, model or year, e.g. Forester 2011",
  "search.year": "Year",
  "search.price": "Price",
  "search.anyPrice": "Any price",
  "search.priceUnder": "Under TZS {n}M",
  "search.priceBetween": "TZS {a}M – {b}M",
  "search.priceOver": "Over TZS {n}M",
  "search.seeAll": "See all results for “{q}”",

  // ---- vehicle card / detail ----
  "card.details": "Details",
  "card.new": "New",
  "detail.newArrival": "New arrival",
  "detail.ask": "Interested? Ask us on WhatsApp",
  "detail.contactDealer": "Contact dealer",
  "detail.techTitle": "Technical Specifications",
  "detail.paymentTitle": "Payment details",
  "detail.useTitle": "Potential use",

  // ---- inventory page ----
  "inv.eyebrow": "The catalogue",
  "inv.title": "Inventory",
  "inv.intro":
    "Vehicles currently available from {name}. Message us on WhatsApp to ask about any car.",
  "inv.countOne": "1 vehicle available",
  "inv.countMany": "{n} vehicles available",
  "inv.emptyTitle": "New vehicles are on the way",
  "inv.emptyBody":
    "We are adding cars to the website. Message us to ask what is available right now.",
  "inv.noMatchTitle": "No vehicles match those filters",
  "inv.noMatchBody":
    "Clear a filter, or message us on WhatsApp and we will help you find one.",

  // ---- enquiry form ----
  "form.firstName": "First name",
  "form.lastName": "Last name",
  "form.email": "Email address",
  "form.phone": "Phone number",
  "form.vehicle": "Vehicle of interest",
  "form.general": "General enquiry",
  "form.message": "Message",
  "form.placeholder": "Tell us what you are looking for.",
  "form.send": "Send message",
  "form.sending": "Sending…",
  "form.tooShort": "Please tell us a little more in your message.",
  "form.thanks": "Thank you! We received your enquiry and will reply shortly.",
  "form.failed": "Unable to send just now.",

  // ---- footer ----
  "footer.blurb": "Message or call us any time, we are open 24 hours, 7 days a week.",
  "footer.inventory": "Inventory",
  "footer.allVehicles": "All vehicles",
  "footer.sedans": "Sedans",
  "footer.coupes": "Coupes",
  "footer.suvs": "SUVs",
  "footer.services": "Services",
  "footer.sales": "Vehicle sales",
  "footer.sourcing": "Sourcing",
  "footer.inspection": "Inspection",
  "footer.about": "About us",
  "footer.contact": "Contact us",
  "footer.rights": "All rights reserved.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms of use",
  "footer.staff": "Staff login",

  // ---- about ----
  "about.eyebrow": "Who we are",
  "about.title": "About {name}",
  "about.subtitle": "Message or call us any time, 24 hours a day, 7 days a week.",
  "about.storyEyebrow": "Our story",
  "about.storyTitle": "Cars You Can Ask Us About, Any Time",
  "about.p1":
    "{name} is a car dealership based in {city}, {country}. We help buyers find a vehicle that suits their needs and budget, and we keep the process simple: clear prices, straight answers, and a real person on the other end of the phone.",
  "about.p2":
    "You can reach us on WhatsApp or by phone at any hour. Browse the inventory, pick a car, and message us to ask questions or arrange a viewing.",
  "about.stand": "What we stand for",
  "about.promises": "Our Promises",
  "pillar.0.title": "Honest Information",
  "pillar.0.body": "We tell you what we know about each vehicle and answer your questions plainly.",
  "pillar.1.title": "Clear, Upfront Pricing",
  "pillar.1.body":
    "Prices are listed in TZS on every vehicle, so there are no surprises when you contact us.",
  "pillar.2.title": "Always Reachable",
  "pillar.2.body": "Message or call us any time of day. We are open 24 hours, 7 days a week.",

  // ---- "why buy from us" cards ----
  "standard.0.title": "Clear Pricing",
  "standard.0.body":
    "Every listing shows its price in TZS up front, so you know what to expect before you get in touch.",
  "standard.1.title": "Talk to a Real Person",
  "standard.1.body":
    "Message or call us on WhatsApp and speak to the team directly, no chatbots and no waiting.",
  "standard.2.title": "Open 24/7",
  "standard.2.body":
    "We are available 24 hours a day, 7 days a week, so you can ask about a car whenever suits you.",
  "standard.3.title": "Based in Dar es Salaam",
  "standard.3.body": "Message us to arrange a viewing of any car in our inventory.",

  // ---- services page ----
  "services.eyebrow": "What we do",
  "services.title": "Our Services",
  "services.subtitle":
    "From finding the right car to answering your questions on WhatsApp, here is how we can help.",
  "services.proEyebrow": "Professional services",
  "services.proTitle": "Professional Services",
  "services.learn": "Learn more",
  "services.readyTitle": "Ready to find your next car?",
  "services.readyBody":
    "Message or call us on WhatsApp. We are open 24 hours a day, 7 days a week.",
  "services.contactBtn": "Contact us",
  "service.sales.title": "Vehicle Sales",
  "service.sales.summary":
    "A private, invitation-grade presentation of motorcars selected for provenance, condition, and character — never volume.",
  "service.sourcing.title": "Vehicle Sourcing",
  "service.sourcing.summary":
    "Commission a search. We locate rare specification examples through a discreet network of collectors, houses, and marque specialists.",
  "service.trade-in.title": "Trade-In Evaluation",
  "service.trade-in.summary":
    "Transparent, inspection-backed valuations. We assess history, originality, and market truth — then make a firm offer.",
  "service.financing.title": "Bespoke Financing",
  "service.financing.summary":
    "Private-client lending structured around the motorcar, not a mass-market scorecard. Lease, term, and balloon options.",
  "service.inspection.title": "Vehicle Inspection",
  "service.inspection.summary":
    "A 180-point mechanical and cosmetic audit, road test, and fluid analysis. Every motor we represent carries this report.",
  "service.aftercare.title": "After Sales Care",
  "service.aftercare.summary":
    "Concierge servicing, storage, detailing, and transport. Ownership continues long after the keys change hands.",

  // ---- contact page ----
  "contact.eyebrow": "Get in touch",
  "contact.title": "Contact",
  "contact.intro":
    "Message us on WhatsApp, call, or send the form below. A real person reads every message, and we are open 24 hours a day, 7 days a week.",

  // ---- photo gallery ----
  "gallery.all": "All",
  "gallery.Exterior": "Exterior",
  "gallery.Interior": "Interior",
  "gallery.Engine": "Engine",
  "gallery.Wheels": "Wheels",
  "gallery.categories": "Photo categories",
  "gallery.fullscreen": "Open fullscreen",
  "gallery.prev": "Previous photo",
  "gallery.next": "Next photo",
  "gallery.show": "Show photo {n}",
  "gallery.viewer": "Photo viewer",
  "gallery.close": "Close",

  // ---- map ----
  "map.alt": "Map of Tanzania showing our branches",
  "map.directions": "Get directions",
  "map.mbeya": "Century Plaza",
  "map.arusha": "NSSF, 3rd floor",
  "map.mwanza": "Mongo House, Nyerere Road",
  "map.dodoma": "Hotel Tower, 2nd floor",
  "map.bukoba": "NSSF Tower",
  "map.dar": "Manzese Tiptop",

  // ---- 404 ----
  "nf.title": "We could not find that page",
  "nf.body": "The vehicle or page you requested is no longer listed.",
  "nf.home": "Return home",

  // ---- legal pages ----
  "legal.updatedLabel": "Last updated:",
  "legal.updatedDate": "October 2026",
  "privacy.eyebrow": "Your information",
  "privacy.title": "Privacy Policy",
  "privacy.subtitle": "What we collect when you contact us, why, and what you can ask us to do.",
  "terms.eyebrow": "The small print",
  "terms.title": "Terms of Use",
  "terms.subtitle": "How listings, prices and enquiries work on this website.",

  // ---- vehicle spec LABELS (shown on car pages) ----
  "spec.Year": "Year",
  "spec.Mileage": "Mileage",
  "spec.Engine": "Engine",
  "spec.Fuel": "Fuel",
  "spec.Transmission": "Transmission",
  "spec.Drivetrain": "Drivetrain",
  "spec.Exterior Color": "Exterior Color",
  "spec.Interior Color": "Interior Color",
  "spec.Horsepower": "Horsepower",
  "spec.Torque": "Torque",
  "spec.0–100 km/h": "0–100 km/h",
  "spec.Top Speed": "Top Speed",

  // ---- common vehicle VALUES (anything not listed is shown as typed) ----
  "val.Petrol": "Petrol",
  "val.Diesel": "Diesel",
  "val.Hybrid": "Hybrid",
  "val.Electric": "Electric",
  "val.Automatic": "Automatic",
  "val.Manual": "Manual",
  "val.Sedan": "Sedan",
  "val.Coupe": "Coupe",
  "val.SUV": "SUV",
  "val.Hatchback": "Hatchback",
  "val.Wagon": "Wagon",
  "val.Convertible": "Convertible",
  "val.Pickup": "Pickup",
  "val.Van": "Van",
  "val.Black": "Black",
  "val.White": "White",
  "val.Silver": "Silver",
  "val.Grey": "Grey",
  "val.Gray": "Grey",
  "val.Red": "Red",
  "val.Blue": "Blue",
  "val.Green": "Green",
  "val.Brown": "Brown",
  "val.Beige": "Beige",
  "val.Gold": "Gold",
  "val.Yellow": "Yellow",
  "val.Orange": "Orange",
};

type Key = keyof typeof en;

const sw: Record<Key, string> = {
  "nav.home": "Nyumbani",
  "nav.inventory": "Magari",
  "nav.services": "Huduma",
  "nav.financing": "Mkopo",
  "nav.about": "Kuhusu Sisi",
  "nav.contact": "Mawasiliano",
  "header.openMenu": "Fungua menyu",
  "header.closeMenu": "Funga menyu",
  "lang.label": "Lugha",

  "biz.tagline": "Magari bora jijini Dar es Salaam",
  "biz.hours1": "Tuko wazi saa 24",
  "biz.hours2": "Siku 7 kwa wiki",

  "wa.greeting": "Habari {name}, ningependa kuuliza kuhusu gari.",
  "wa.interest": "Habari {name}, ninavutiwa na {car} ({price}). Je, bado linapatikana?",
  "wa.chat": "Ongea nasi WhatsApp",
  "wa.chatAria": "Ongea nasi kwenye WhatsApp",
  "btn.call": "Piga simu",
  "btn.callAria": "Piga {phone}",

  "home.hero1": "Endesha gari",
  "home.hero2": "la kipekee.",
  "home.heroSub":
    "Magari ya hadhi ya juu. Yaliyochaguliwa kwa uangalifu. Tayari kwa dereva makini anayetaka kitu kinachozidi kawaida.",
  "home.explore": "Tazama magari",
  "home.featuredEyebrow": "Yaliyowasili hivi karibuni",
  "home.featuredTitle": "Magari Yaliyochaguliwa",
  "home.browseAll": "Tazama katalogi yote",
  "home.whyEyebrow": "Kwa nini sisi",
  "home.whyTitle": "Kwa Nini Ununue Kwetu",
  "home.findEyebrow": "Tupate",
  "home.findTitle": "Tutembelee",
  "home.address": "Anwani",
  "home.phone": "Simu na WhatsApp",
  "home.hours": "Saa za kazi",
  "home.enqEyebrow": "Mawasiliano ya faragha",
  "home.enqTitle": "Tuma Swali Moja kwa Moja",
  "home.enqIntro":
    "Tuambie gari unalolitaka, muda unaokufaa, na jinsi ungependa kuliona. Mhudumu wetu atakujibu binafsi.",

  "search.eyebrow": "Katalogi",
  "search.title": "Tafuta Gari Lako Bora",
  "search.make": "Chapa",
  "search.body": "Aina ya mwili",
  "search.yearMin": "Mwaka wa chini",
  "search.yearMax": "Mwaka wa juu",
  "search.fuel": "Mafuta",
  "search.transmission": "Mfumo wa gia",
  "search.all": "Zote",
  "search.noMin": "Hakuna kiwango cha chini",
  "search.noMax": "Hakuna kiwango cha juu",
  "search.submit": "Tafuta magari",
  "search.q": "Tafuta",
  "search.qPlaceholder": "Tafuta kwa chapa, modeli au mwaka, mfano Forester 2011",
  "search.year": "Mwaka",
  "search.price": "Bei",
  "search.anyPrice": "Bei yoyote",
  "search.priceUnder": "Chini ya TZS {n}M",
  "search.priceBetween": "TZS {a}M – {b}M",
  "search.priceOver": "Zaidi ya TZS {n}M",
  "search.seeAll": "Tazama matokeo yote ya “{q}”",

  "card.details": "Maelezo",
  "card.new": "Mpya",
  "detail.newArrival": "Limewasili hivi karibuni",
  "detail.ask": "Unavutiwa? Tuulize kupitia WhatsApp",
  "detail.contactDealer": "Wasiliana na muuzaji",
  "detail.techTitle": "Vipimo vya Kiufundi",
  "detail.paymentTitle": "Maelezo ya malipo",
  "detail.useTitle": "Matumizi yanayofaa",

  "inv.eyebrow": "Katalogi",
  "inv.title": "Magari Yetu",
  "inv.intro":
    "Magari yanayopatikana sasa kutoka {name}. Tutumie ujumbe kwenye WhatsApp kuuliza kuhusu gari lolote.",
  "inv.countOne": "Gari 1 linapatikana",
  "inv.countMany": "Magari {n} yanapatikana",
  "inv.emptyTitle": "Magari mapya yanakuja",
  "inv.emptyBody":
    "Tunaendelea kuongeza magari kwenye tovuti. Tutumie ujumbe kuuliza kinachopatikana sasa hivi.",
  "inv.noMatchTitle": "Hakuna magari yanayolingana na vichujio hivyo",
  "inv.noMatchBody":
    "Ondoa kichujio, au tutumie ujumbe kwenye WhatsApp tutakusaidia kupata gari.",

  "form.firstName": "Jina la kwanza",
  "form.lastName": "Jina la mwisho",
  "form.email": "Barua pepe",
  "form.phone": "Namba ya simu",
  "form.vehicle": "Gari unalolipenda",
  "form.general": "Swali la jumla",
  "form.message": "Ujumbe",
  "form.placeholder": "Tuambie unachotafuta.",
  "form.send": "Tuma ujumbe",
  "form.sending": "Inatuma…",
  "form.tooShort": "Tafadhali tuambie zaidi kidogo kwenye ujumbe wako.",
  "form.thanks": "Asante! Tumepokea swali lako na tutakujibu hivi karibuni.",
  "form.failed": "Imeshindwa kutuma kwa sasa.",

  "footer.blurb":
    "Tutumie ujumbe au tupigie wakati wowote, tuko wazi saa 24, siku 7 kwa wiki.",
  "footer.inventory": "Magari",
  "footer.allVehicles": "Magari yote",
  "footer.sedans": "Sedani",
  "footer.coupes": "Coupe",
  "footer.suvs": "SUV",
  "footer.services": "Huduma",
  "footer.sales": "Uuzaji wa magari",
  "footer.sourcing": "Kutafuta magari",
  "footer.inspection": "Ukaguzi",
  "footer.about": "Kuhusu sisi",
  "footer.contact": "Wasiliana nasi",
  "footer.rights": "Haki zote zimehifadhiwa.",
  "footer.privacy": "Faragha",
  "footer.terms": "Masharti ya matumizi",
  "footer.staff": "Kuingia kwa wafanyakazi",

  "about.eyebrow": "Sisi ni nani",
  "about.title": "Kuhusu {name}",
  "about.subtitle": "Tutumie ujumbe au tupigie wakati wowote, saa 24 kwa siku, siku 7 kwa wiki.",
  "about.storyEyebrow": "Hadithi yetu",
  "about.storyTitle": "Magari Unayoweza Kutuuliza Wakati Wowote",
  "about.p1":
    "{name} ni muuzaji wa magari anayepatikana {city}, {country}. Tunawasaidia wanunuzi kupata gari linalofaa mahitaji na bajeti yao, na tunafanya mchakato uwe rahisi: bei wazi, majibu ya moja kwa moja, na mtu halisi upande wa pili wa simu.",
  "about.p2":
    "Unaweza kutupata kwenye WhatsApp au kwa simu saa yoyote. Pitia orodha ya magari, chagua gari, kisha tutumie ujumbe kuuliza maswali au kupanga kuliona.",
  "about.stand": "Tunachosimamia",
  "about.promises": "Ahadi Zetu",
  "pillar.0.title": "Taarifa za Ukweli",
  "pillar.0.body": "Tunakueleza tunachojua kuhusu kila gari na kujibu maswali yako kwa uwazi.",
  "pillar.1.title": "Bei Wazi za Mapema",
  "pillar.1.body":
    "Bei zimeorodheshwa kwa TZS kwenye kila gari, kwa hivyo hakuna mshangao unapowasiliana nasi.",
  "pillar.2.title": "Tunapatikana Kila Wakati",
  "pillar.2.body": "Tutumie ujumbe au tupigie wakati wowote. Tuko wazi saa 24, siku 7 kwa wiki.",

  "standard.0.title": "Bei Zilizo Wazi",
  "standard.0.body":
    "Kila gari lina bei yake kwa TZS ikionyeshwa wazi, ili ujue unachotarajia kabla ya kuwasiliana nasi.",
  "standard.1.title": "Ongea na Mtu Halisi",
  "standard.1.body":
    "Tutumie ujumbe au tupigie kupitia WhatsApp na uongee na timu yetu moja kwa moja, bila roboti wala kusubiri.",
  "standard.2.title": "Tuko Wazi Saa 24",
  "standard.2.body":
    "Tunapatikana saa 24 kwa siku, siku 7 kwa wiki, kwa hivyo unaweza kuuliza kuhusu gari wakati wowote unaokufaa.",
  "standard.3.title": "Tupo Dar es Salaam",
  "standard.3.body": "Tutumie ujumbe ili upange kuliona gari lolote lililo kwenye orodha yetu.",

  "services.eyebrow": "Tunachofanya",
  "services.title": "Huduma Zetu",
  "services.subtitle":
    "Kuanzia kutafuta gari sahihi hadi kujibu maswali yako kwenye WhatsApp, hivi ndivyo tunavyoweza kukusaidia.",
  "services.proEyebrow": "Huduma za kitaalamu",
  "services.proTitle": "Huduma za Kitaalamu",
  "services.learn": "Jifunze zaidi",
  "services.readyTitle": "Uko tayari kupata gari lako lijalo?",
  "services.readyBody":
    "Tutumie ujumbe au tupigie kupitia WhatsApp. Tuko wazi saa 24 kwa siku, siku 7 kwa wiki.",
  "services.contactBtn": "Wasiliana nasi",
  "service.sales.title": "Uuzaji wa Magari",
  "service.sales.summary":
    "Uwasilishaji wa kipekee na wa faragha wa magari yaliyochaguliwa kwa historia, hali na ubora wake — kamwe si wingi.",
  "service.sourcing.title": "Kutafuta Magari",
  "service.sourcing.summary":
    "Agiza utafutaji. Tunapata magari adimu yenye vipimo maalum kupitia mtandao wetu wa siri wa wakusanyaji, wauzaji na wataalamu wa chapa.",
  "service.trade-in.title": "Tathmini ya Kubadilisha Gari",
  "service.trade-in.summary":
    "Tathmini za wazi zinazoungwa mkono na ukaguzi. Tunapitia historia, uhalisia na thamani halisi sokoni — kisha tunatoa ofa thabiti.",
  "service.financing.title": "Ufadhili Maalum",
  "service.financing.summary":
    "Mikopo kwa wateja binafsi iliyopangwa kulingana na gari, si kigezo cha soko la watu wengi. Chaguo za kukodi, muda na malipo ya mwisho.",
  "service.inspection.title": "Ukaguzi wa Gari",
  "service.inspection.summary":
    "Ukaguzi wa pointi 180 wa mitambo na muonekano, jaribio la barabarani na uchambuzi wa vimiminika. Kila gari tunalowakilisha lina ripoti hii.",
  "service.aftercare.title": "Huduma Baada ya Mauzo",
  "service.aftercare.summary":
    "Matengenezo, hifadhi, usafi na usafirishaji. Umiliki unaendelea muda mrefu baada ya funguo kukabidhiwa.",

  "contact.eyebrow": "Wasiliana nasi",
  "contact.title": "Mawasiliano",
  "contact.intro":
    "Tutumie ujumbe kwenye WhatsApp, tupigie, au tuma fomu iliyo hapa chini. Mtu halisi husoma kila ujumbe, na tuko wazi saa 24 kwa siku, siku 7 kwa wiki.",

  "gallery.all": "Zote",
  "gallery.Exterior": "Nje",
  "gallery.Interior": "Ndani",
  "gallery.Engine": "Injini",
  "gallery.Wheels": "Magurudumu",
  "gallery.categories": "Makundi ya picha",
  "gallery.fullscreen": "Fungua skrini nzima",
  "gallery.prev": "Picha iliyotangulia",
  "gallery.next": "Picha inayofuata",
  "gallery.show": "Onyesha picha {n}",
  "gallery.viewer": "Kitazamaji cha picha",
  "gallery.close": "Funga",

  "map.alt": "Ramani ya Tanzania inayoonyesha matawi yetu",
  "map.directions": "Pata maelekezo",
  "map.mbeya": "Century Plaza",
  "map.arusha": "NSSF, ghorofa ya 3",
  "map.mwanza": "Mongo House, Barabara ya Nyerere",
  "map.dodoma": "Hotel Tower, ghorofa ya 2",
  "map.bukoba": "NSSF Tower",
  "map.dar": "Manzese Tiptop",

  "nf.title": "Hatukuweza kupata ukurasa huo",
  "nf.body": "Gari au ukurasa uliouomba haupo tena.",
  "nf.home": "Rudi nyumbani",

  "legal.updatedLabel": "Imesasishwa mwisho:",
  "legal.updatedDate": "Oktoba 2026",
  "privacy.eyebrow": "Taarifa zako",
  "privacy.title": "Sera ya Faragha",
  "privacy.subtitle": "Tunachokusanya unapowasiliana nasi, kwa nini, na unachoweza kutuomba tufanye.",
  "terms.eyebrow": "Maandishi madogo",
  "terms.title": "Masharti ya Matumizi",
  "terms.subtitle": "Jinsi matangazo, bei na maswali yanavyofanya kazi kwenye tovuti hii.",

  "spec.Year": "Mwaka",
  "spec.Mileage": "Umbali uliotembea",
  "spec.Engine": "Injini",
  "spec.Fuel": "Mafuta",
  "spec.Transmission": "Mfumo wa gia",
  "spec.Drivetrain": "Mfumo wa kuendesha",
  "spec.Exterior Color": "Rangi ya nje",
  "spec.Interior Color": "Rangi ya ndani",
  "spec.Horsepower": "Nguvu ya injini",
  "spec.Torque": "Torque",
  "spec.0–100 km/h": "0–100 km/h",
  "spec.Top Speed": "Kasi ya juu",

  "val.Petrol": "Petroli",
  "val.Diesel": "Dizeli",
  "val.Hybrid": "Mseto",
  "val.Electric": "Umeme",
  "val.Automatic": "Otomatiki",
  "val.Manual": "Ya mkono",
  "val.Sedan": "Sedani",
  "val.Coupe": "Coupe",
  "val.SUV": "SUV",
  "val.Hatchback": "Hatchback",
  "val.Wagon": "Wagon",
  "val.Convertible": "Convertible",
  "val.Pickup": "Pickup",
  "val.Van": "Van",
  "val.Black": "Nyeusi",
  "val.White": "Nyeupe",
  "val.Silver": "Fedha",
  "val.Grey": "Kijivu",
  "val.Gray": "Kijivu",
  "val.Red": "Nyekundu",
  "val.Blue": "Buluu",
  "val.Green": "Kijani",
  "val.Brown": "Kahawia",
  "val.Beige": "Beige",
  "val.Gold": "Dhahabu",
  "val.Yellow": "Njano",
  "val.Orange": "Chungwa",
};

const dictionaries = { en, sw } as const;
export type TranslationKey = Key;

type Vars = Record<string, string | number>;

function translate(lang: Lang, key: Key, vars?: Vars): string {
  let text: string = dictionaries[lang][key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key, optionally filling {placeholders}. */
  t: (key: Key, vars?: Vars) => string;
  /**
   * Translate DATA that comes from the database (spec labels, fuel, colours...).
   * Unknown words are shown exactly as the dealer typed them, so nothing ever disappears.
   */
  tData: (prefix: "spec" | "val", raw: string) => string;
};

const defaultValue: I18nValue = {
  lang: "en",
  setLang: () => {},
  t: (key, vars) => translate("en", key, vars),
  tData: (prefix, raw) => (en as Record<string, string>)[`${prefix}.${raw}`] ?? raw,
};

const I18nContext = createContext<I18nValue>(defaultValue);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start in English so the server HTML and the first browser render match
  // (avoids a React "hydration mismatch"), then switch to the saved choice after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "sw" || saved === "en") setLangState(saved);
    } catch {
      /* localStorage can be blocked (private mode); the site just stays in English. */
    }
  }, []);

  // Keep <html lang="..."> correct for screen readers and browser translation tools.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      tData: (prefix, raw) =>
        (dictionaries[lang] as Record<string, string>)[`${prefix}.${raw}`] ?? raw,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
