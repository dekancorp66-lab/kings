# King $eller$ — car dealership website

Website for **King $eller$**, a car dealership in Dar es Salaam, Tanzania. Visitors browse the stock, look through
photo galleries, and contact the dealer on WhatsApp or by phone. Staff manage the stock from a private dealer desk.

## Features

- Inventory with search/filters and a detail page per car (photo gallery, specs, price in TZS, mileage in km)
- WhatsApp and call buttons for every business number, with the car's name and price pre-filled in the message
- Enquiry form with spam protection (hidden bot trap + rate limit)
- Dealer desk at `/curator/login`: add cars with photos, see enquiries and appointments
- Photos are shrunk in the browser before upload, so phone photos stay fast
- SEO: per-page titles, WhatsApp/Facebook link previews (photo, name, price), `sitemap.xml`, `robots.txt`
- Privacy and Terms pages (starting-point text, see "Before launch")

## Tech

React + TanStack Start (Vite), Tailwind CSS, TypeScript. An optional FastAPI backend (`backend/`) is used if it is
running on `127.0.0.1:8000`; otherwise the site serves everything itself.

## Run it locally

```bash
npm install
copy .env.example .env      # Windows (use "cp" on Mac/Linux), then fill in the 3 required values
npm run dev                 # http://localhost:8080
```

Restart `npm run dev` after changing `.env` (it is only read at startup).

## Environment variables (`.env`)

| Name                      | Required          | What it is                                                                                                                    |
| ------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `MERIDIAN_SECRET`         | yes               | Random text, 32+ characters. Signs the admin login cookie.                                                                    |
| `MERIDIAN_ADMIN_EMAIL`    | yes               | Admin (dealer desk) email.                                                                                                    |
| `MERIDIAN_ADMIN_PASSWORD` | yes               | Admin password, 8+ characters. If empty, admin login is switched off.                                                         |
| `SITE_URL`                | for the live site | Public address, e.g. `https://yourdomain.co.tz` (no trailing slash). Used for link previews, the sitemap and canonical links. |

Make a secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
Never commit `.env`. On a host, set the same names in its environment settings instead.

## Everyday jobs

- **Change phone numbers, email, address or opening hours:** edit `src/config/business.ts`. The whole site updates.
- **Add a car:** sign in at `/curator/login` → Inventory → Add vehicle. Enter price in **TZS** and mileage in **km**.
- **Where cars and photos are saved:** `data/vehicles.json` and `data/uploads/`. This folder is not in git. **Back it up.**

## Deploying

Cars and photos are stored as files, so the host needs a **disk that keeps its files** (a VPS or a platform with a
persistent volume). Hosts with a read-only or temporary disk, such as Vercel serverless, will lose cars and photos.
For those, move the stock to a database and the photos to object storage first.

On the host: set the four environment variables above, run `npm run build`, and start the built server.

## Before launch

- Replace the 12 demo cars with real stock. To start with an EMPTY inventory, put a file `data/vehicles.json` that
  contains just `[]`, then restart. (Deleting the file does the opposite: it brings the demo cars back.)
- Read `src/routes/privacy.tsx` and `src/routes/terms.tsx`, edit anything not true for your business, and have them
  reviewed by a lawyer.
- Check the services text (`src/data/catalog.ts`) describes what you really offer.

## Security notes

- The admin password and session secret live only in environment variables, never in the code or the browser.
- Admin API routes verify the session on every request. Login and the public forms are rate limited.
- Rate limits are kept in server memory: exact on a single server, softer on serverless hosts.

## Tests

`npm test` runs the project's checks. `npm run typecheck` and `npm run lint` check the code.
`scripts/share-tags.test.mjs` guards the WhatsApp link previews.

## Map of the code

- `src/config/business.ts` business details · `src/routes/` pages and API routes · `src/components/` UI
- `src/lib/seo.ts` page titles and share tags · `src/lib/security.server.ts` secrets, login check, rate limits
- `src/data/catalog.ts` demo stock and page text · `backend/` optional FastAPI service
