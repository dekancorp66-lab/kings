/**
 * SINGLE SOURCE OF TRUTH for the dealership's public details.
 * Why one file: the name/phone/hours used to be copy-pasted across the header, footer,
 * contact page and home page. Change a value here and the whole site updates.
 *
 * This file is imported by pages, so only put PUBLIC information in it (never passwords).
 */

export type Phone = {
  /** How it is shown to people, e.g. "0770 492 593" */
  display: string;
  /** International format without "+" or spaces, which WhatsApp (wa.me) and tel: links need */
  intl: string;
};

export const business = {
  name: "King $eller$",
  tagline: "Quality vehicles in Dar es Salaam",
  city: "Dar es Salaam",
  country: "Tanzania",
  // The first number is the "main" one used by the floating WhatsApp button.
  phones: [
    { display: "0770 492 593", intl: "255770492593" },
    { display: "0743 482 593", intl: "255743482593" },
  ] satisfies Phone[],
  email: "kingsellerstz@gmail.com",
  address: ["Dar es Salaam", "Tanzania"],
  hours: ["Open 24 hours", "7 days a week"],
};

export const primaryPhone = business.phones[0];

/** Opens a WhatsApp chat with a ready-typed message. */
export function whatsappUrl(phone: Phone, message: string) {
  return `https://wa.me/${phone.intl}?text=${encodeURIComponent(message)}`;
}

/** Tap-to-call link for phones. */
export function telUrl(phone: Phone) {
  return `tel:+${phone.intl}`;
}
