import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { PublicVehicle, Vehicle } from "@/data/types";
import { PhotoTile } from "@/components/curator/photo-tile";
import { createVehicle, updateVehicle, uploadVehiclePhoto } from "@/lib/api";
import type { PhotoCategoryMap } from "@/lib/photo-categories";
import { firstIssue, vehicleInputSchema } from "@/lib/vehicle-input";
import { uniqueSorted } from "@/lib/vehicles";

// "missing" = the Quick add reader did not find it; "guessed" = it filled a best guess, please check.
export type FieldFlag = "missing" | "guessed";
export type FieldFlags = Partial<Record<string, FieldFlag>>;

type Props = {
  existing: PublicVehicle[]; // used to suggest spellings that already exist (keeps filters tidy)
  onCreated: (vehicle: Vehicle) => void;
  onCancel: () => void;
  // Optional, used by Quick add to pre-fill the form. The normal "Add a vehicle" button passes none of these.
  initial?: Partial<Record<string, string>>;
  initialImages?: string[];
  initialFlags?: FieldFlags;
  // Set when editing a car that is already in the inventory.
  editing?: Vehicle;
};

export function AddVehicleForm({ existing, onCreated, onCancel, initial, initialImages, initialFlags, editing }: Props) {
  const [images, setImages] = useState<string[]>(initialImages ?? editing?.images ?? []);
  // What each photo shows (Exterior / Interior / Engine / Wheels). Missing = Exterior.
  const [categories, setCategories] = useState<PhotoCategoryMap>(editing?.imageCategories ?? {});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flags, setFlags] = useState<FieldFlags>(initialFlags ?? {});
  const fileInput = useRef<HTMLInputElement>(null);

  const start = editing ? vehicleToInitial(editing) : initial;
  const v = (key: string) => start?.[key];

  // Typing in a highlighted field clears its highlight.
  function clearFlag(event: React.FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (name && flags[name]) setFlags(({ [name]: _cleared, ...rest }) => rest);
  }

  // <datalist> suggestions: typing "SU" offers the existing "SUV", so "Suv"/"suv" variants
  // don't create duplicate entries in the public search filters.
  const suggest = (pick: (v: PublicVehicle) => string) => uniqueSorted(existing.map(pick));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    // One at a time: simpler error reporting and keeps the server's memory use low.
    for (const file of Array.from(files)) {
      try {
        const url = await uploadVehiclePhoto(file);
        setImages((prev) => [...prev, url]);
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = ""; // allow re-picking the same file
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const str = (key: string) => String(data.get(key) ?? "");
    const badge = str("badge");

    const parsed = vehicleInputSchema.safeParse({
      make: str("make"),
      model: str("model"),
      trim: str("trim"),
      year: str("year"),
      price: str("price"),
      mileage: str("mileage"),
      body: str("body"),
      fuel: str("fuel"),
      transmission: str("transmission"),
      drivetrain: str("drivetrain"),
      engine: str("engine"),
      color: str("color"),
      interiorColor: str("interiorColor"),
      vin: editing?.vin ?? "",
      status: str("status"),
      badge: badge === "new" || badge === "reserved" ? badge : undefined,
      featured: data.get("featured") === "on",
      description: str("description"),
      paymentInfo: str("paymentInfo"),
      potentialUse: str("potentialUse"),
      // Cars saved before the Technical details box was removed keep their old values when edited.
      ...(editing
        ? {
            horsepower: techValue(editing, "Horsepower"),
            torque: techValue(editing, "Torque"),
            zeroToSixty: techValue(editing, "0–100 km/h"),
            topSpeed: techValue(editing, "Top Speed"),
          }
        : {}),
      images,
      imageCategories: categories,
    });
    if (!parsed.success) {
      toast.error(firstIssue(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const vehicle = editing
        ? await updateVehicle(editing.id, parsed.data)
        : await createVehicle(parsed.data);
      toast.success(
        editing
          ? `${vehicle.year} ${vehicle.name} saved.`
          : `${vehicle.year} ${vehicle.name} added to the inventory.`,
      );
      onCreated(vehicle);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editing
            ? "Could not save the changes."
            : "Could not add the vehicle.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onInput={clearFlag} className="mt-8 rounded-2xl bg-surface p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">{editing ? "Edit vehicle" : "Add a vehicle"}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <datalist id="dl-make">{suggest((v) => v.make).map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="dl-body">{suggest((v) => v.body).map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="dl-fuel">{suggest((v) => v.fuel).map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="dl-trans">{suggest((v) => v.transmission).map((x) => <option key={x} value={x} />)}</datalist>

      <fieldset className="mt-6">
        <legend className="text-micro font-semibold tracking-mark text-muted uppercase">Photos</legend>
        <p className="mt-1 text-xs text-muted">JPG, PNG or WebP. Big phone photos are shrunk automatically. The first photo is the main one. Pick what each photo shows (Exterior, Interior, Engine, Wheels) and it appears under that tab on the car page.</p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((src, index) => (
            <PhotoTile
              key={src}
              src={src}
              isMain={index === 0}
              category={categories[src] ?? "Exterior"}
              onCategory={(category) => setCategories((prev) => ({ ...prev, [src]: category }))}
              onMakeMain={() => setImages((prev) => [src, ...prev.filter((x) => x !== src)])}
              onRemove={() => {
                setImages((prev) => prev.filter((x) => x !== src));
                setCategories(({ [src]: _removed, ...rest }) => rest);
              }}
            />
          ))}
          <button
            type="button"
            disabled={uploading || images.length >= 12}
            onClick={() => fileInput.current?.click()}
            className="grid aspect-4/3 place-items-center rounded-lg text-xs text-muted ring-1 ring-line ring-dashed hover:bg-canvas disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "+ Add photos"}
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => void onFiles(event.target.files)}
        />
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Make *" flag={flags.make}><Input name="make" list="dl-make" required maxLength={60} placeholder="Toyota" defaultValue={v("make")} /></Field>
        <Field label="Model *" flag={flags.model}><Input name="model" required maxLength={60} placeholder="Land Cruiser" defaultValue={v("model")} /></Field>
        <Field label="Trim / variant" flag={flags.trim}><Input name="trim" maxLength={60} placeholder="V8 ZX" defaultValue={v("trim")} /></Field>
        <Field label="Year *" flag={flags.year}><Input name="year" type="number" required min={1950} max={new Date().getFullYear() + 1} placeholder="2023" defaultValue={v("year")} /></Field>
        <Field label="Price (TZS) *" flag={flags.price}><Input name="price" type="number" required min={1} step="any" placeholder="45000000" defaultValue={v("price")} /></Field>
        <Field label="Mileage (km) *" flag={flags.mileage}><Input name="mileage" type="number" required min={0} placeholder="80000" defaultValue={v("mileage")} /></Field>
        <Field label="Body type *" flag={flags.body}><Input name="body" list="dl-body" required maxLength={40} placeholder="SUV" defaultValue={v("body")} /></Field>
        <Field label="Fuel *" flag={flags.fuel}><Input name="fuel" list="dl-fuel" required maxLength={40} placeholder="Diesel" defaultValue={v("fuel")} /></Field>
        <Field label="Transmission *" flag={flags.transmission}><Input name="transmission" list="dl-trans" required maxLength={60} placeholder="Automatic" defaultValue={v("transmission")} /></Field>
        <Field label="Drivetrain" flag={flags.drivetrain}><Input name="drivetrain" maxLength={60} placeholder="4WD" defaultValue={v("drivetrain")} /></Field>
        <Field label="Engine" flag={flags.engine}><Input name="engine" maxLength={80} placeholder="3.3L V6 Twin-Turbo" defaultValue={v("engine")} /></Field>
        <Field label="Exterior colour *" flag={flags.color}><Input name="color" required maxLength={60} placeholder="Pearl White" defaultValue={v("color")} /></Field>
        <Field label="Interior colour" flag={flags.interiorColor}><Input name="interiorColor" maxLength={60} placeholder="Black leather" defaultValue={v("interiorColor")} /></Field>
        <Field label="Status *">
          <Select name="status" defaultValue={editing?.status ?? "available"}>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
          </Select>
        </Field>
        <Field label="Badge">
          <Select name="badge" defaultValue={editing?.badge ?? ""}>
            <option value="">None</option>
            <option value="new">New arrival</option>
            <option value="reserved">Reserved</option>
          </Select>
        </Field>
        <label className="flex items-end gap-2 pb-3 text-sm text-ink">
          <input type="checkbox" name="featured" defaultChecked={editing?.featured} className="size-4 accent-[var(--color-accent)]" />
          Show on the homepage (featured)
        </label>
      </div>

      <div className={`mt-4 ${flagClass(flags.description)}`}>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" required maxLength={3000} placeholder="Condition, history, standout features…" defaultValue={v("description")} />
        <FlagHint flag={flags.description} />
      </div>

      <div className="mt-4">
        <Label htmlFor="paymentInfo">Payment details (optional)</Label>
        <Textarea id="paymentInfo" name="paymentInfo" maxLength={2000} placeholder="Cash, bank transfer, instalment plan, deposit needed, trade-in accepted…" defaultValue={v("paymentInfo")} />
      </div>

      <div className="mt-4">
        <Label htmlFor="potentialUse">Potential use (optional)</Label>
        <Textarea id="potentialUse" name="potentialUse" maxLength={2000} placeholder="Family car, safari trips, farm work, taxi or business use…" defaultValue={v("potentialUse")} />
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add to inventory"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Turns a saved car back into the text values the form boxes expect.
function vehicleToInitial(car: Vehicle): Record<string, string> {
  return {
    make: car.make,
    model: car.model,
    trim: car.trim ?? "",
    year: String(car.year),
    price: String(car.price),
    mileage: String(car.mileage),
    body: car.body,
    fuel: car.fuel,
    transmission: car.transmission,
    drivetrain: car.drivetrain ?? "",
    engine: car.engine ?? "",
    color: car.color,
    interiorColor: car.specs.find((row) => row.label === "Interior Color")?.value ?? "",
    vin: car.vin,
    description: car.description,
    paymentInfo: car.paymentInfo ?? "",
    potentialUse: car.potentialUse ?? "",
  };
}

function techValue(car: Vehicle, label: string) {
  return car.technical.find((row) => row.label === label)?.value ?? "";
}

function flagClass(flag?: FieldFlag) {
  if (flag === "missing") return "rounded-lg bg-amber-50 p-2 ring-2 ring-amber-400";
  if (flag === "guessed") return "rounded-lg bg-sky-50 p-2 ring-2 ring-sky-300";
  return "";
}

function FlagHint({ flag }: { flag?: FieldFlag }) {
  if (flag === "missing") return <span className="mt-1 block text-[11px] text-amber-700">Not found in the caption, please fill in</span>;
  if (flag === "guessed") return <span className="mt-1 block text-[11px] text-sky-700">Best guess, please check</span>;
  return null;
}

// A wrapping <label> ties the text to its input for screen readers and makes the label clickable.
function Field({ label, flag, children }: { label: string; flag?: FieldFlag; children: React.ReactNode }) {
  return (
    <label className={`block ${flagClass(flag)}`}>
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted">{label}</span>
      {children}
      <FlagHint flag={flag} />
    </label>
  );
}
