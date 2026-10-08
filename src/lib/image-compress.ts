/**
 * Shrinks a photo in the browser BEFORE it is uploaded.
 *
 * Why: a phone camera photo is typically 3-8 MB. Ten of those per car would make the
 * listing painfully slow on mobile data (and can hit the 8 MB upload limit). A 1600 px
 * wide JPEG at ~80% quality looks identical on a phone/laptop screen and is ~200-400 KB.
 *
 * Safety first: if anything goes wrong (old browser, odd file) we return the ORIGINAL
 * file untouched, so uploading never gets worse than before.
 */

const MAX_EDGE = 1600; // longest side in pixels
const QUALITY = 0.8;
const SKIP_BELOW_BYTES = 250 * 1024; // already small enough, don't re-encode (avoids quality loss)

export async function compressImage(file: File): Promise<File> {
  try {
    if (!file.type.startsWith("image/") || file.size < SKIP_BELOW_BYTES) return file;

    // "from-image" applies the phone's rotation flag, otherwise portrait photos can come out sideways.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // JPEG has no transparency: paint white first so transparent PNGs don't turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    // Keep the original if re-encoding somehow made it bigger.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
