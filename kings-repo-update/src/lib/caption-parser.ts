// Reads a pasted WhatsApp channel caption and guesses the Add-a-vehicle form values.
// Everything is a best guess: the admin always reviews the filled form before saving.

/** Optional text put into "Payment details" on every imported car. Edit it here once. */
export const DEFAULT_PAYMENT = "";

export type CaptionFields = Partial<
  Record<
    | "make"
    | "model"
    | "trim"
    | "year"
    | "price"
    | "mileage"
    | "body"
    | "fuel"
    | "transmission"
    | "drivetrain"
    | "engine"
    | "color"
    | "interiorColor"
    | "vin"
    | "description"
    | "paymentInfo",
    string
  >
>;

const MAKES = [
  "Land Rover", "Range Rover", "Mercedes-Benz", "Mercedes Benz", "Mercedes", "Toyota", "Subaru", "Nissan",
  "Honda", "Mazda", "Mitsubishi", "Suzuki", "Isuzu", "Lexus", "BMW", "Audi", "Volkswagen", "VW", "Ford",
  "Hyundai", "Kia", "Jeep", "Volvo", "Peugeot", "Daihatsu", "Porsche", "Renault", "Chevrolet", "Mini",
];

const BODY_BY_MODEL: Array<[RegExp, string]> = [
  [/forester|rav ?4|harrier|prado|land ?cruiser|vanguard|x-?trail|cx-?[0-9]+|crv|cr-v|kluger|rush|escudo|vitara|outlander|pajero|patrol|lx ?\d+|rx ?\d+|nx ?\d+|evoque|discovery|defender|tucson|sportage|sorento|santa ?fe|q[3-8]|x[1-7]|gle|glc|ml ?\d+|cayenne|macan|ecosport|escape|xv|crosstrek|c-?hr|venza|fortuner|ist/i, "SUV"],
  [/hilux|navara|l200|ranger|d-?max|amarok|triton|dyna|canter/i, "Pickup"],
  [/corolla|premio|allion|crown|camry|mark ?x|axio|altezza|c-?class|e-?class|s-?class|a[3-8]\b|3 series|5 series|accord|civic|sylphy|bluebird|teana|lancer|legacy|impreza|sedan/i, "Sedan"],
  [/vitz|passo|fit\b|swift|march|note|demio|aqua|prius|ractis|spade|porte|polo|golf|yaris|jazz|hatchback/i, "Hatchback"],
  [/fielder|caldina|wish|estima|ipsum|wagon|touring|avensis/i, "Wagon"],
  [/noah|voxy|alphard|vellfire|hiace|townace|liteace|sienta|serena|vanette|minivan|van\b|coaster/i, "Van"],
];

const COLOURS = "white|black|silver|grey|gray|blue|red|green|gold|brown|beige|maroon|orange|yellow|purple|champagne|bronze|burgundy|pearl|gunmetal";

// "Year: 2011" style lines. First matching key wins.
const KEYS: Array<[keyof CaptionFields, RegExp]> = [
  ["make", /^(make|brand)$/i],
  ["model", /^(model|model name)$/i],
  ["trim", /^(trim|variant|grade)$/i],
  ["year", /^(year|yom|year of manufacture|manufacture year|reg(istration)? year|first reg(istration)?)$/i],
  ["price", /^(price|cash price|bei|amount|tzs|tsh)$/i],
  ["mileage", /^(mileage|millage|milage|km|kms|odometer|odo|kilometers?)$/i],
  ["body", /^(body|body type|type)$/i],
  ["fuel", /^(fuel|fuel type)$/i],
  ["transmission", /^(transmission|trans|gear ?box|gear)$/i],
  ["drivetrain", /^(drive|drivetrain|drive type|wheel drive)$/i],
  ["engine", /^(engine|engine size|cc|capacity|engine capacity)$/i],
  ["color", /^(colou?r|exterior|exterior colou?r|body colou?r)$/i],
  ["interiorColor", /^(interior|interior colou?r|seats?)$/i],
  ["vin", /^(vin|chassis|chassis no\.?|chassis number|chassis no)$/i],
];

const title = (s: string) => s.replace(/\s+/g, " ").trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function moneyToNumber(raw: string): number | null {
  const text = raw.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
  const m = text.match(/(\d+(?:\.\d+)?)\s*(m\b|mil|million|k\b)?/);
  if (!m) return null;
  let n = Number(m[1]);
  if (m[2] === "m" || m[2] === "mil" || m[2] === "million") n *= 1_000_000;
  else if (m[2] === "k") n *= 1_000;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function extractFields(input: string): CaptionFields {
  const out: CaptionFields = {};
  const year = new Date().getFullYear();

  // Clean the paste: drop links, phone numbers, "follow our channel" style lines, empty lines.
  const lines = input
    .replace(/\r/g, "")
    .split("\n")
    .map((l) =>
      l
        .replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu, "")
        .replace(/^[\s*_~>•·\-–—]+/, "")
        .replace(/[*_~]+/g, "")
        .trim(),
    )
    .filter(
      (l) =>
        l &&
        !/https?:\/\/|www\.|(?:\+255|\b0)[\s-]?[67]\d[\s-]?\d{3}[\s-]?\d{3,4}|follow (the|our)|channel|whatsapp|call us|contact us|dm us|inbox/i.test(l),
    );

  const used = new Set<number>();

  // 1) "Label: value" lines
  lines.forEach((line, i) => {
    const m = line.match(/^([A-Za-z][A-Za-z .\/]{1,30}?)\s*[:=\-–]\s*(.+)$/);
    if (!m) return;
    const label = m[1].trim();
    for (const [field, test] of KEYS) {
      if (test.test(label) && !out[field]) {
        out[field] = m[2].trim();
        used.add(i);
        break;
      }
    }
  });

  // 2) Title line: first line that wasn't a "label: value" line and has a known make
  const titleIdx = lines.findIndex((l, i) => !used.has(i) && l.length < 90);
  const titleLine = titleIdx >= 0 ? lines[titleIdx] : "";
  if (titleLine) used.add(titleIdx);
  const text = lines.join("\n");

  if (!out.make) {
    const found = MAKES.find((mk) => new RegExp(`\\b${mk.replace(/[-\s]/g, "[-\\s]?")}\\b`, "i").test(titleLine || text));
    if (found) out.make = found === "VW" ? "Volkswagen" : found === "BMW" ? "BMW" : found;
  }
  if (!out.model && titleLine && out.make) {
    const after = titleLine.replace(new RegExp(out.make.replace(/[-\s]/g, "[-\\s]?"), "i"), "");
    const cut = after.split(/\b(?:19|20)\d{2}\b|\d{4,}|\b(?:petrol|diesel|hybrid|electric|automatic|auto|manual|cvt|awd|4wd|2wd|fwd|rwd|km|kms)\b/i)[0];
    const cleaned = title(cut.replace(/[|,]+/g, " "));
    if (cleaned) out.model = cleaned;
  }
  if (!out.make && titleLine) {
    const [first, ...rest] = title(titleLine.replace(/\b(19|20)\d{2}\b/g, "")).split(" ");
    out.make = cap(first ?? "");
    if (!out.model && rest.length) out.model = rest.join(" ");
  }

  // 3) Year
  if (out.year) {
    const y = out.year.match(/\b(19[5-9]\d|20\d{2})\b/);
    out.year = y ? y[1] : "";
  } else {
    const y = text.match(/\b(19[5-9]\d|20[0-4]\d)\b/g)?.map(Number).find((n) => n <= year + 1);
    if (y) out.year = String(y);
  }
  if (!out.year) delete out.year;

  // 4) Price
  if (out.price) {
    const n = moneyToNumber(out.price);
    if (n) out.price = String(n);
    else delete out.price;
  } else {
    const keyed = text.match(/(?:price|bei|cash|tzs|tsh)[^\n\d]{0,12}([\d][\d,.\s]*\s*(?:m\b|mil\w*|million|k\b)?)/i);
    const n = keyed ? moneyToNumber(keyed[1]) : null;
    if (n && n >= 100_000) out.price = String(n);
    else {
      const big = [...text.matchAll(/\b\d{1,3}(?:,\d{3}){2,}\b|\b\d{7,9}\b/g)]
        .map((x) => Number(x[0].replace(/,/g, "")))
        .filter((v) => v >= 1_000_000)
        .sort((a, b) => b - a)[0];
      const mm = text.match(/\b(\d+(?:\.\d+)?)\s*(?:m\b|million)\b/i);
      if (big) out.price = String(big);
      else if (mm) out.price = String(Math.round(Number(mm[1]) * 1_000_000));
    }
  }

  // 5) Mileage
  if (out.mileage) {
    const n = Number(out.mileage.replace(/[^\d.]/g, ""));
    if (n >= 0 && Number.isFinite(n)) out.mileage = String(Math.round(n));
    else delete out.mileage;
  } else {
    const m = text.match(/(\d[\d,.\s]{1,9})\s*(?:km|kms|kilomet)/i) ?? text.match(/(?:mileage|millage|odo(?:meter)?)[^\d\n]{0,8}(\d[\d,]*)/i);
    if (m) out.mileage = String(Number(m[1].replace(/[,\s]/g, "")));
  }

  // 6) Fuel, transmission, drivetrain, engine
  if (!out.fuel) {
    const f = text.match(/\b(petrol|gasoline|diesel|hybrid|electric|lpg)\b/i)?.[1];
    if (f) out.fuel = /gasoline/i.test(f) ? "Petrol" : cap(f);
  } else out.fuel = cap(out.fuel);
  if (!out.transmission) {
    const t = text.match(/\b(automatic|auto\b|manual|cvt|tiptronic)\b/i)?.[1];
    if (t) out.transmission = /^auto\b/i.test(t) ? "Automatic" : /cvt/i.test(t) ? "CVT" : cap(t);
  } else if (/^auto\b/i.test(out.transmission)) out.transmission = "Automatic";
  if (!out.drivetrain) {
    const d = text.match(/\b(awd|4wd|4x4|2wd|fwd|rwd)\b/i)?.[1];
    if (d) out.drivetrain = d.toUpperCase();
  }
  if (!out.engine) {
    const e = text.match(/\b([A-Z]{1,3}\d{1,2}[A-Z]{0,2})?[\s-]*(\d[\d,.]{2,5}\s?cc)\b/i);
    if (e) out.engine = title(`${e[1] ?? ""} ${e[2]}`);
  }

  // 7) Colours
  if (!out.color) {
    const c = text.match(new RegExp(`\\b((?:metallic|pearl|dark|light|deep)\\s+)?(?:${COLOURS})(?:\\s+(?:metallic|pearl|mica))?\\b`, "i"));
    if (c) out.color = title(c[0]).replace(/\b\w/g, (x) => x.toUpperCase());
  }

  // 8) Chassis / VIN
  if (!out.vin) {
    const v = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/) ?? text.match(/\b[A-Z]{2,5}\d{0,2}-\d{5,8}\b/);
    if (v) out.vin = v[0];
  }
  if (out.vin) out.vin = out.vin.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, 20);

  // 9) Body type from the model name or text
  if (!out.body) {
    const hay = `${out.model ?? ""} ${titleLine}`;
    const hit = BODY_BY_MODEL.find(([re]) => re.test(hay));
    if (hit) out.body = hit[1];
  }

  // 10) Description = everything not already used as a field, with "||" turned into commas
  const SPEC_ONLY = new RegExp(
    [
      "petrol|gasoline|diesel|hybrid|electric|lpg|automatic|auto|manual|cvt|tiptronic|awd|4wd|4x4|2wd|fwd|rwd",
      "\\d[\\d,. ]*\\s?(?:cc|km|kms|kilometers?)",
      "(?:price|bei|cash|tzs|tsh|mileage|millage|odo|odometer|chassis|vin|year|colou?r|engine)\\b",
      "[\\d,.]+\\s?(?:m|mil\\w*|million|k|/=)?",
      "(?:metallic|pearl|dark|light|deep|mica)",
      COLOURS,
      "[A-Z]{2,5}\\d{0,2}-\\d{5,8}",
    ].join("|"),
    "gi",
  );
  const rest = lines.filter((line, i) => !used.has(i) && line.replace(SPEC_ONLY, "").replace(/[\s|,.:;\-–/]+/g, "").length >= 3);
  const segments = rest
    .join("||")
    .split(/\s*\|{1,}\s*/)
    .map((x) => x.replace(/\s{2,}/g, " ").replace(/^[,.\s•-]+|[,.\s]+$/g, ""))
    .filter(Boolean);
  if (segments.length === 1) out.description = segments[0].slice(0, 3000);
  else if (segments.length > 1) out.description = segments.map((x) => `• ${x}`).join("\n").slice(0, 3000);

  if (DEFAULT_PAYMENT) out.paymentInfo = DEFAULT_PAYMENT;
  return out;
}

export type FieldKey = keyof CaptionFields;

/** What the Quick add page gets back: values for the form, plus which boxes to flag. */
export type ParsedCaption = {
  values: CaptionFields;
  /** Required boxes the post did not contain (shown orange). */
  missing: FieldKey[];
  /** Boxes we filled by guessing (shown blue). */
  guessed: FieldKey[];
};

/** Spellings already used in your inventory, so "suv" becomes your existing "SUV". */
export type KnownLists = {
  make?: string[];
  body?: string[];
  fuel?: string[];
  transmission?: string[];
};

/** Form fields that must be filled before saving. */
export const REQUIRED_FIELDS: FieldKey[] = [
  "make", "model", "year", "price", "mileage", "body", "fuel", "transmission", "color", "description",
];

const snap = (value: string | undefined, list?: string[]) => {
  if (!value || !list?.length) return value;
  return list.find((x) => x.trim().toLowerCase() === value.trim().toLowerCase()) ?? value;
};

export function parseCaption(raw: string, known: KnownLists = {}): ParsedCaption {
  const values = extractFields(raw);
  values.make = snap(values.make, known.make);
  values.body = snap(values.body, known.body);
  values.fuel = snap(values.fuel, known.fuel);
  values.transmission = snap(values.transmission, known.transmission);
  for (const key of Object.keys(values) as FieldKey[]) if (!values[key]) delete values[key];

  const labelled = (re: RegExp) => re.test(raw);
  const guessed: FieldKey[] = [];
  if (values.body) guessed.push("body");
  if (values.color && !labelled(/^\W*(colou?r|exterior)\s*[:=-]/im)) guessed.push("color");
  if (values.price && !labelled(/(price|bei|tzs|tsh|cash)/i)) guessed.push("price");
  if (values.model && !labelled(/^\W*model\s*[:=-]/im)) guessed.push("model");

  const missing = REQUIRED_FIELDS.filter((key) => !values[key]);
  return { values, missing, guessed };
}
