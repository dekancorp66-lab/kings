import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { AddVehicleForm, type FieldFlags } from "@/components/curator/add-vehicle-form";
import type { PublicVehicle, Vehicle } from "@/data/types";
import { uploadVehiclePhoto } from "@/lib/api";
import { REQUIRED_FIELDS, parseCaption, type ParsedCaption } from "@/lib/caption-parser";

type Props = {
  existing: PublicVehicle[];
  onCreated: (vehicle: Vehicle) => void;
  onCancel: () => void;
};

const MAX_PHOTOS = 12;

export function QuickAdd({ existing, onCreated, onCancel }: Props) {
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<{ parsed: ParsedCaption; images: string[] } | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  // Remember photos that were already uploaded, so going back and forward never uploads twice.
  const uploaded = useRef(new Map<File, string>());

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, MAX_PHOTOS));
    if (picker.current) picker.current.value = "";
  }

  async function onContinue() {
    if (!caption.trim()) {
      toast.error("Paste the WhatsApp caption first.");
      return;
    }
    const parsed = parseCaption(caption, {
      make: existing.map((x) => x.make),
      body: existing.map((x) => x.body),
      fuel: existing.map((x) => x.fuel),
      transmission: existing.map((x) => x.transmission),
    });

    setBusy(true);
    const images: string[] = [];
    // One at a time, same as the normal form: simpler errors, low server memory.
    for (const file of files) {
      const done = uploaded.current.get(file);
      if (done) {
        images.push(done);
        continue;
      }
      try {
        const url = await uploadVehiclePhoto(file);
        uploaded.current.set(file, url);
        images.push(url);
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
    }
    setBusy(false);
    setStep({ parsed, images });
  }

  if (step) {
    const { parsed, images } = step;
    const flags: FieldFlags = {};
    parsed.missing.forEach((k) => (flags[k] = "missing"));
    parsed.guessed.forEach((k) => (flags[k] = "guessed"));
    const found = REQUIRED_FIELDS.length - parsed.missing.length;

    return (
      <div>
        <div className="mt-8 rounded-2xl bg-surface p-5 text-sm text-ink shadow-card">
          <p className="font-medium">
            Read {found} of {REQUIRED_FIELDS.length} required details from the caption.
          </p>
          <p className="mt-1 text-xs text-muted">
            Orange boxes were not in the post: please fill them in. Blue boxes are best
            guesses: please check them. Then press “Add to inventory”.
            {images.length === 0 ? " No photos were added yet: use “+ Add photos” in the form." : ""}
          </p>
        </div>
        <AddVehicleForm
          existing={existing}
          onCreated={onCreated}
          onCancel={() => setStep(null)}
          initial={parsed.values}
          initialImages={images}
          initialFlags={flags}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">Quick add from WhatsApp</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="mt-6">
        <Label htmlFor="caption">WhatsApp caption</Label>
        <Textarea
          id="caption"
          rows={14}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder={"Paste the whole post here (copy it from WhatsApp)…"}
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-micro font-semibold tracking-mark text-muted uppercase">Photos</legend>
        <p className="mt-1 text-xs text-muted">Pick all the photos of the car at once. The first one is the main photo; you can change that on the next screen.</p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative aspect-4/3 overflow-hidden rounded-lg ring-1 ring-line">
              <img src={previews[index]} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={busy || files.length >= MAX_PHOTOS}
            onClick={() => picker.current?.click()}
            className="grid aspect-4/3 place-items-center rounded-lg text-xs text-muted ring-1 ring-line ring-dashed hover:bg-canvas disabled:opacity-50"
          >
            + Add photos
          </button>
        </div>
        <input
          ref={picker}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </fieldset>

      <div className="mt-8 flex gap-3">
        <Button type="button" disabled={busy} onClick={() => void onContinue()}>
          {busy ? "Uploading photos…" : "Read caption and continue"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
