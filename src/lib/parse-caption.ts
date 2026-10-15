// parse-caption.ts
// Turns a pasted WhatsApp car post into fields for the "Add a vehicle" form.
// WHY rule-based: it is free, instant, and predictable. Every field is optional,
// so a caption we can't fully read still pre-fills what it can and you fix the rest.

export type ParsedCar = {
  make: string; model: string; year: string; price: string; mileage: string;
  engine: string; fuel: string; transmission: string; drivetrain: string;
  color: string; bodyType: string; description: string; features: string[];
  missing: string[]; // fields we could not find, so the UI can highlight them
};

// Known makes. Multi-word makes first so "Land Rover" beats "Land".
const MAKES = ["Land Rover","Range Rover","Mercedes-Benz","Mercedes","Toyota","Nissan","Honda","Mazda","Subaru","Mitsubishi","Suzuki","Isuzu","Daihatsu","Lexus","BMW","Audi","Volkswagen","Ford","Hyundai","Kia","Volvo","Jeep","Peugeot","Porsche"];

// Model -> body type. Guessing saves a form field; user can still change it.
const BODY: Record<string, string> = {
  forester:"SUV", harrier:"SUV", "land cruiser":"SUV", prado:"SUV", rav4:"SUV", "cx-5":"SUV", "x-trail":"SUV",
  vanguard:"SUV", kluger:"SUV", escudo:"SUV", outlander:"SUV", cx5:"SUV", xtrail:"SUV", crv:"SUV", "cr-v":"SUV",
  hilux:"Pickup", "d-max":"Pickup", dmax:"Pickup", navara:"Pickup", ranger:"Pickup",
  noah:"Minivan", voxy:"Minivan", alphard:"Minivan", vellfire:"Minivan", sienta:"Minivan", "hiace":"Van", townace:"Van",
  premio:"Sedan", allion:"Sedan", camry:"Sedan", corolla:"Sedan", mark:"Sedan", crown:"Sedan", fuga:"Sedan", legacy:"Sedan",
  vitz:"Hatchback", passo:"Hatchback", fit:"Hatchback", swift:"Hatchback", demio:"Hatchback", ist:"Hatchback", wish:"Wagon", fielder:"Wagon",
};

const FUELS = ["petrol","diesel","hybrid","electric","gasoline"];
const COLORS = ["white","pearl white","silver","black","grey","gray","blue","red","green","gold","brown","beige","orange","yellow","maroon","champagne"];
const num = (s: string) => s.replace(/[^\d]/g, "");

export function parseCaption(raw: string): ParsedCar {
  const text = raw.replace(/\r/g, "").replace(/[*_~]/g, ""); // strip WhatsApp bold/italic marks
  const low = text.toLowerCase();

  // Features: everything after the first "||" (your caption convention), split on "||" or bullets.
  let head = text, features: string[] = [];
  const bar = text.indexOf("||");
  if (bar >= 0) {
    head = text.slice(0, bar);
    features = text.slice(bar).split(/\|\||\n\s*[-•✅✔️]\s*/).map(s => s.replace(/^[\s✅✔️•-]+/, "").trim()).filter(Boolean);
  }
  const headLow = head.toLowerCase();

  // Year: first plausible 4-digit year (1990..next year).
  const maxYear = new Date().getFullYear() + 1;
  const year = (head.match(/\b(19[9]\d|20[0-4]\d)\b/g) || []).find(y => +y <= maxYear) || "";

  // Make + model: model = words right after the make, stopping at year/number/separator.
  let make = "", model = "";
  for (const m of MAKES) {
    const i = headLow.indexOf(m.toLowerCase());
    if (i >= 0) {
      make = m === "Mercedes" ? "Mercedes-Benz" : m;
      const after = head.slice(i + m.length).split(/[|\n,]|\b(19|20)\d{2}\b|\d{1,3}[,.]\d{3}|price/i)[0] || "";
      model = after.replace(/[^\w\s-]/g, " ").replace(/^\s*benz\b/i, "").trim().split(/\s+/).slice(0, 3).join(" ");
      // ALL-CAPS captions ("HARRIER") look shouty on the site, so title-case them.
      if (model === model.toUpperCase() && model.length > 4) model = model.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  // Price: look for a labelled price first (TZS / Tsh / Price), else a large number with commas.
  let price = "";
  const pm = head.match(/(?:price|tzs|tsh|bei)[^\d]{0,10}([\d][\d,. ]{4,})/i)
          || head.match(/([\d][\d,. ]{6,})\s*(?:tzs|tsh|\/=)/i);
  if (pm) price = num(pm[1]);
  else { const big = head.match(/\b\d{1,3}(?:,\d{3}){2,}\b/); if (big) price = num(big[0]); }

  // Mileage: number next to km/kms/mileage, tolerating "85k km".
  let mileage = "";
  const mm = head.match(/(?:mileage|odo\w*)[^\d]{0,10}([\d][\d,. ]*)\s*(k)?/i) || head.match(/([\d][\d,. ]*)\s*(k)?\s*km/i);
  if (mm) { mileage = num(mm[1]); if (mm[2] && +mileage < 1000) mileage = String(+mileage * 1000); }

  // Engine: "2000cc", "2.0L", "1.5 litre".
  let engine = "";
  const em = head.match(/(\d{3,4})\s*cc/i) || null;
  const el = head.match(/\b(\d\.\d)\s*(?:l|ltr|litre|liter)\b/i);
  if (em) engine = `${em[1]}cc`; else if (el) engine = `${el[1]}L`;

  const fuel = (FUELS.find(f => headLow.includes(f)) || "").replace("gasoline","petrol");
  const fuelOut = fuel ? fuel[0].toUpperCase() + fuel.slice(1) : "";

  const transmission = /\b(cvt)\b/i.test(head) ? "CVT"
    : /\b(auto(matic)?|at)\b/i.test(head) ? "Automatic"
    : /\b(manual|mt)\b/i.test(head) ? "Manual" : "";

  const drivetrain = /\b(4wd|4x4|awd)\b/i.test(head) ? "4WD/AWD"
    : /\b2wd\b/i.test(head) ? "2WD"
    : /\bfwd\b/i.test(head) ? "FWD" : /\brwd\b/i.test(head) ? "RWD" : "";

  const colorHit = COLORS.find(c => new RegExp(`\\b${c}\\b`, "i").test(head)) || "";
  const color = colorHit ? colorHit.replace(/\b\w/g, c => c.toUpperCase()) : "";

  const modelKey = model.toLowerCase();
  const bodyType = Object.entries(BODY).find(([k]) => modelKey.includes(k))?.[1] || "";

  const description = features.length ? features.map(f => `• ${f}`).join("\n") : "";

  const out: ParsedCar = { make, model, year, price, mileage, engine, fuel: fuelOut, transmission, drivetrain, color, bodyType, description, features, missing: [] };
  for (const k of ["make","model","year","price","mileage","engine","fuel","transmission","drivetrain","color","bodyType"] as const)
    if (!out[k]) out.missing.push(k);
  return out;
}
