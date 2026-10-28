/**
 * SINGLE SOURCE OF TRUTH for the branch list (map, globe and lender locations).
 * To change an address or add a branch, edit this file and rebuild.
 * A city can have more than one office: add another entry to its `places` list.
 */
export type Lang = "en" | "sw";

export type Place = {
  /** Short note shown above the address, e.g. "Main branch". Empty = none. */
  label: Record<Lang, string>;
  address: Record<Lang, string>;
  /** Text Google Maps searches for when someone taps the pin. */
  query: string;
  /**
   * Optional: paste the office's own Google Maps link here (Google Maps > Share > Copy link)
   * to open that exact spot instead of searching by the text above.
   */
  url?: string;
};

export type Branch = {
  id: string;
  city: string;
  /** [longitude, latitude] of the city, used to place the pin on the globe. */
  coords: [number, number];
  /** Which side of the pin the name is written on (stops neighbouring names overlapping). */
  side: "left" | "right";
  places: Place[];
};

const none = { en: "", sw: "" };

export const branches: Branch[] = [
  {
    id: "dar",
    city: "Dar es Salaam",
    coords: [39.28, -6.82],
    side: "right",
    places: [
      {
        label: { en: "Main branch", sw: "Tawi kuu" },
        address: { en: "Mwanga Tower", sw: "Mwanga Tower" },
        query: "Mwanga Tower Dar es Salaam Tanzania",
      },
      {
        label: none,
        address: { en: "Manzese Tiptop", sw: "Manzese Tiptop" },
        query: "Manzese Tiptop Dar es Salaam Tanzania",
      },
    ],
  },
  {
    id: "arusha",
    city: "Arusha",
    coords: [36.68, -3.37],
    side: "left",
    places: [
      {
        label: none,
        address: {
          en: "NSSF Building, 3rd floor (or Sokoine Road)",
          sw: "Jengo la NSSF, ghorofa ya 3 (au Barabara ya Sokoine)",
        },
        query: "NSSF Building Arusha Tanzania",
      },
    ],
  },
  {
    id: "moshi",
    city: "Moshi",
    coords: [37.34, -3.35],
    side: "right",
    places: [
      {
        label: { en: "Original Northern branch", sw: "Tawi la asili la Kaskazini" },
        address: { en: "New NSSF building, 2nd floor", sw: "NSSF mpya, ghorofa ya 2" },
        query: "NSSF Moshi Tanzania",
      },
    ],
  },
  {
    id: "mwanza",
    city: "Mwanza",
    coords: [32.9, -2.52],
    side: "left",
    places: [
      {
        label: none,
        address: { en: "Lumumba Road", sw: "Barabara ya Lumumba" },
        query: "Lumumba Road Mwanza Tanzania",
      },
      {
        label: none,
        address: { en: "Mongo House, Nyerere Road", sw: "Mongo House, Barabara ya Nyerere" },
        query: "Mongo House Nyerere Road Mwanza Tanzania",
      },
    ],
  },
  {
    id: "mbeya",
    city: "Mbeya",
    coords: [33.46, -8.91],
    side: "left",
    places: [
      {
        label: none,
        address: { en: "Century Plaza, 2nd floor", sw: "Century Plaza, ghorofa ya 2" },
        query: "Century Plaza Mbeya Tanzania",
      },
    ],
  },
  {
    id: "dodoma",
    city: "Dodoma",
    coords: [35.74, -6.17],
    side: "left",
    places: [
      {
        label: none,
        address: { en: "Hotel Tower, 2nd floor", sw: "Hotel Tower, ghorofa ya 2" },
        query: "Hotel Tower Dodoma Tanzania",
      },
    ],
  },
  {
    id: "bukoba",
    city: "Bukoba",
    coords: [31.81, -1.33],
    side: "right",
    places: [
      {
        label: none,
        address: { en: "NSSF Tower", sw: "NSSF Tower" },
        query: "NSSF Tower Bukoba Tanzania",
      },
    ],
  },
];

export const HQ_ID = "dar";
