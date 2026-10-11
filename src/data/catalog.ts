import type { Appointment, Inquiry, Vehicle } from "./types";

/**
 * Starting stock. Intentionally EMPTY: real cars are added in the dealer desk
 * (/curator/login -> Inventory -> Add vehicle) and saved in data/vehicles.json.
 * Keeping this empty means demo cars can never reappear if data/vehicles.json is missing.
 */
export const vehicles: Vehicle[] = [];

export const services = [
  {
    id: "sales",
    title: "Vehicle Sales",
    image: "/images/services/sales.jpg",
    summary:
      "A private, invitation-grade presentation of motorcars selected for provenance, condition, and character — never volume.",
  },
  {
    id: "sourcing",
    title: "Vehicle Sourcing",
    image: "/images/services/source.jpg",
    summary:
      "Commission a search. We locate rare specification examples through a discreet network of collectors, houses, and marque specialists.",
  },
  {
    id: "trade-in",
    title: "Trade-In Evaluation",
    image: "/images/services/trade.jpg",
    summary:
      "Transparent, inspection-backed valuations. We assess history, originality, and market truth — then make a firm offer.",
  },
  {
    id: "financing",
    title: "Bespoke Financing",
    image: "/images/services/finance.jpg",
    summary:
      "Private-client lending structured around the motorcar, not a mass-market scorecard. Lease, term, and balloon options.",
  },
  {
    id: "inspection",
    title: "Vehicle Inspection",
    image: "/images/services/inspect.jpg",
    summary:
      "A 180-point mechanical and cosmetic audit, road test, and fluid analysis. Every motor we represent carries this report.",
  },
  {
    id: "aftercare",
    title: "After Sales Care",
    image: "/images/services/care.jpg",
    summary:
      "Concierge servicing, storage, detailing, and transport. Ownership continues long after the keys change hands.",
  },
];

export const standards = [
  {
    title: "Clear Pricing",
    body: "Every listing shows its price in TZS up front, so you know what to expect before you get in touch.",
  },
  {
    title: "Talk to a Real Person",
    body: "Message or call us on WhatsApp and speak to the team directly, no chatbots and no waiting.",
  },
  {
    title: "Open 24/7",
    body: "We are available 24 hours a day, 7 days a week, so you can ask about a car whenever suits you.",
  },
  {
    title: "Based in Dar es Salaam",
    body: "Message us to arrange a viewing of any car in our inventory.",
  },
];

export const pillars = [
  {
    title: "Honest Information",
    body: "We tell you what we know about each vehicle and answer your questions plainly.",
  },
  {
    title: "Clear, Upfront Pricing",
    body: "Prices are listed in TZS on every vehicle, so there are no surprises when you contact us.",
  },
  {
    title: "Always Reachable",
    body: "Message or call us any time of day. We are open 24 hours, 7 days a week.",
  },
];

// Demo enquiries and appointments removed so the dealer desk starts clean.
export const seedInquiries: Inquiry[] = [];

export const seedAppointments: Appointment[] = [];