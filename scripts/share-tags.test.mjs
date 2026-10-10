// Regression tests: the head injector must NOT wipe a page's own share tags.
// Run with:  node --test scripts/share-tags.test.mjs   (or npm test)
import assert from "node:assert/strict";
import { test } from "node:test";
import { injectGrokPwaHead, renderWebManifest } from "./grok-pwa-shared.mjs";

const HOST = "kingsellers.co.tz";
const carPage = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><title>2024 S 580 | King $eller$</title>
<meta property="og:title" content="2024 S 580 - TZS 293,500,000 | King $eller$"/>
<meta property="og:description" content="TZS 293,500,000 · 7,744 km"/>
<meta property="og:url" content="https://kingsellers.co.tz/inventory/s580"/>
<meta property="og:image" content="https://kingsellers.co.tz/images/vehicles/s580-hero.jpg"/>
<meta name="twitter:card" content="summary_large_image"/></head><body>x</body></html>`;
const plainPage = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><title>Not found</title></head><body>x</body></html>`;

test("a page with its own og:title keeps ALL of its share tags (per-car WhatsApp preview)", () => {
  const out = injectGrokPwaHead(carPage, { host: HOST, cwd: process.cwd() });
  for (const wanted of [
    'og:title" content="2024 S 580 - TZS 293,500,000 | King $eller$"',
    'og:description" content="TZS 293,500,000 · 7,744 km"',
    'og:url" content="https://kingsellers.co.tz/inventory/s580"',
    'og:image" content="https://kingsellers.co.tz/images/vehicles/s580-hero.jpg"',
  ]) {
    assert.ok(out.includes(wanted), `missing: ${wanted}`);
  }
  assert.equal((out.match(/property="og:title"/g) ?? []).length, 1, "og:title must not be duplicated");
  assert.equal((out.match(/property="og:image"/g) ?? []).length, 1, "og:image must not be duplicated");
});

test("a page with no share tags still gets the generic fallback card", () => {
  const out = injectGrokPwaHead(plainPage, { host: HOST, cwd: process.cwd() });
  assert.match(out, /property="og:title"/);
  assert.match(out, /name="twitter:card"/);
});

test("the 'Created with Grok' script is NOT loaded unless explicitly enabled", () => {
  const saved = process.env.VITE_GROK_EXTENSIONS;
  try {
    delete process.env.VITE_GROK_EXTENSIONS;
    assert.ok(!/grok-app-builder\/extensions\.js/.test(injectGrokPwaHead(plainPage, { host: HOST, cwd: process.cwd() })));
    process.env.VITE_GROK_EXTENSIONS = "1";
    assert.ok(/grok-app-builder\/extensions\.js/.test(injectGrokPwaHead(plainPage, { host: HOST, cwd: process.cwd() })));
  } finally {
    if (saved === undefined) delete process.env.VITE_GROK_EXTENSIONS;
    else process.env.VITE_GROK_EXTENSIONS = saved;
  }
});

test("installed-app manifest is King $eller$ branded with installable icons", () => {
  const manifest = JSON.parse(renderWebManifest(HOST));
  assert.equal(manifest.name, "King $eller$");
  assert.equal(manifest.theme_color, "#0B1727");
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192") && sizes.includes("512x512"), "Chrome needs 192 and 512 icons");
});
