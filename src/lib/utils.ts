import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prices are stored as plain numbers in Tanzanian shillings (TZS).
 * Why en-US grouping and a hand-written "TZS" prefix: it prints identically on every
 * phone/browser ("TZS 45,000,000"), whereas Intl's currency symbol for TZS varies.
 */
export function formatPrice(value: number) {
  return `TZS ${new Intl.NumberFormat("en-US").format(Math.round(value))}`;
}

export function formatKm(value: number) {
  return `${new Intl.NumberFormat("en-US").format(Math.round(value))} km`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
