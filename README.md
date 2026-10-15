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
copy env.example .env       # Windows (use "cp env.example .env" on Mac/Linux)
npm run dev                 # http://localhost:8080
```

Restart `npm run dev` after changing `.env` (it is only read at startup).

## Environment variables (`.env`)

| Name                      | Required          | What it is                                                                                                                    |
| ------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `MERIDIAN_SECRET`         | yes               | Random text, 32+ characters. Signs the admin login cookie.                                                                    |
| `MERIDIAN_ADMIN_EMAIL`    | yes               | Admin (dealer desk) email.                                                                                                    |
| `MERIDIAN_ADMIN_PASSWORD` | yes               | Admin password, at least 12 characters in production (8 locally).                                                            |
| `SITE_URL`                | for the live site | Public address, e.g. `https://yourdomain.co.tz` (no trailing slash). Used for link previews, the sitemap and canonical links. |
| `RESEND_API_KEY`          | no                | Optional Resend API key for email alerts when a customer sends an enquiry.                                                    |
| `NOTIFY_EMAIL`            | no                | Alert destination; defaults to the public business email.                                                                     |
| `NOTIFY_FROM`             | no                | Optional sender address verified with Resend.                                                                                 |

Make a secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
Never commit `.env`. On a host, set the same names in its environment settings instead.

## Everyday jobs

- **Change phone numbers, email, address or opening hours:** edit `src/config/business.ts`. The whole site updates.
- **Add a car:** sign in at `/curator/login` → Inventory → Add vehicle. Enter price in **TZS** and mileage in **km**.
- **Where cars and photos are saved:** `data/vehicles.json` and `data/uploads/`. This folder is not in git. **Back it up.**

## Deploying

### Recommended: persistent-volume Node host

This project stores inventory, enquiries, appointments, and uploaded photos in local files under `data/`, so deploy
to one Node server with a persistent disk. The production build and start commands are now:

```bash
npm ci && npm run build:node
npm start
```

On Render or another Node host, use Node 22+, mount persistent storage at `<project-root>/data`, and run only one
app instance. The file store and rate limits are local to that instance. Put the app behind the host's HTTPS proxy,
back up `data/` off-host, and set `MERIDIAN_SECRET` (32+ random characters), `MERIDIAN_ADMIN_EMAIL`, a unique
`MERIDIAN_ADMIN_PASSWORD` (12+ characters), and `SITE_URL` in the host's environment settings. Never commit `.env`.

For Render, create a Blueprint from this repository and use the included `render.yaml`. Enter the admin email and
password plus the public `SITE_URL` when prompted. The Blueprint creates a public Node service, generates the session
secret, mounts a persistent disk at `data/`, and deploys future commits automatically. The service and disk use a paid
Render plan; review the current price in Render before confirming deployment.

**Vercel is not safe for the current file-backed stores.** `npm run build` still creates the Vercel target, but its
functions do not provide durable writable storage. To use Vercel, first move records to a durable database and
photos to object storage; the existing `DATABASE_URL` helper does not yet back these stores.

After registering a domain, attach it in the host's domain settings, apply the DNS records the host provides, and
set `SITE_URL` to the final HTTPS URL.

## Before launch

- Confirm the phone numbers, business email, address, hours, and service claims in `src/config/business.ts` are real.
- Add verified stock in the dealer desk. The current starting inventory and sample customer records are empty.
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
