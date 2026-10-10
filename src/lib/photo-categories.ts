/**
 * The groups a car's photos can belong to (the tabs on the car page: Exterior / Interior / ...).
 * Lives in its own tiny file so the admin form, the server check and the gallery all share
 * ONE list and can never disagree.
 */
export const PHOTO_CATEGORIES = ["Exterior", "Interior", "Engine", "Wheels"] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

/** photo URL -> category, chosen by the dealer in the admin form. */
export type PhotoCategoryMap = Record<string, PhotoCategory>;

/**
 * Fallback for photos nobody tagged: the demo photos have telling file names
 * (interior.jpg, wheel.jpg ...). Uploaded photos have random names, so they land in "Exterior".
 */
export function guessCategory(src: string): PhotoCategory {
  const file = src.toLowerCase();
  if (file.includes("interior") || file.includes("seats")) return "Interior";
  if (file.includes("engine")) return "Engine";
  if (file.includes("wheel")) return "Wheels";
  return "Exterior";
}

/** The dealer's choice wins; otherwise guess from the file name. */
export function categoryOf(src: string, tags?: PhotoCategoryMap): PhotoCategory {
  return tags?.[src] ?? guessCategory(src);
}
