import { Select } from "@/components/ui/input";
import { PHOTO_CATEGORIES, type PhotoCategory } from "@/lib/photo-categories";

/**
 * One uploaded photo in the "Add vehicle" form: thumbnail, main/remove buttons, and a
 * dropdown that says what the photo shows. That choice becomes the tab on the car page.
 */
export function PhotoTile({
  src,
  isMain,
  category,
  onCategory,
  onMakeMain,
  onRemove,
}: {
  src: string;
  isMain: boolean;
  category: PhotoCategory;
  onCategory: (category: PhotoCategory) => void;
  onMakeMain: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-line">
      <div className="relative">
        <img src={src} alt="" className="aspect-4/3 w-full object-cover" />
        {isMain ? (
          <span className="absolute top-1 left-1 rounded bg-navy px-1.5 py-0.5 text-[0.6rem] text-inverse">
            Main
          </span>
        ) : (
          <button
            type="button"
            onClick={onMakeMain}
            className="absolute top-1 left-1 rounded bg-surface/90 px-1.5 py-0.5 text-[0.6rem] text-ink hover:bg-surface"
          >
            Make main
          </button>
        )}
        <button
          type="button"
          aria-label="Remove photo"
          onClick={onRemove}
          className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-surface/90 text-xs text-ink hover:bg-surface"
        >
          ✕
        </button>
      </div>
      <Select
        aria-label="What does this photo show?"
        value={category}
        onChange={(event) => onCategory(event.target.value as PhotoCategory)}
        className="h-9 rounded-none text-xs ring-0"
      >
        {PHOTO_CATEGORIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}
