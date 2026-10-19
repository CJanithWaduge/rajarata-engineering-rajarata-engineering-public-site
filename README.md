# Rajarata Engineering

Static marketing site for Rajarata Engineering, an electrical engineering and
contracting company working across MV/LV distribution, industrial
installations, testing and commissioning, and ELV/automation.

Astro pre-renders five public pages to plain HTML, CSS and JavaScript. Firebase
Hosting serves that output from `dist/client/`. There is no server runtime and
no database.

## Stack

- [Astro](https://astro.build/) 7 with `output: 'static'`
- [Tailwind CSS 4](https://tailwindcss.com/) through `@tailwindcss/vite` —
  CSS-first `@theme`, so there is no `tailwind.config.js`
- TypeScript for the two shared browser behaviours
- Firebase Hosting (Spark plan) serving `dist/client/`

No client-side UI framework is used.

## Requirements

- Node.js 22.12 or newer
- npm

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL Astro prints (normally `http://localhost:4321`). `dev`,
`preview`, `build:spark` and `deploy:spark` load `.env` when one exists.
`.env.example` is a template only and is never loaded; keep `.env` local and
never commit it.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static site into `dist/client/` |
| `npm run preview` | Preview the built site locally |
| `npm run check` | Run Astro and TypeScript diagnostics |
| `npm run test:spark` | Verify the Hosting config, direct-contact links, and absence of form markup |
| `npm run test:whatsapp` | Validate WhatsApp number handling and `wa.me` link generation |
| `npm run test:phone` | Validate international phone number handling and `tel:` link generation |
| `npm run test:site` | `check` + `build` + `test:spark` + `test:whatsapp` + `test:phone` |
| `npm run build:spark` | Check, build, and audit the static artifact for Firebase Hosting |
| `npm run deploy:spark -- --project <id> --confirm-static-hosting-deploy` | Deploy Hosting only, after the audit passes |

## Pages

| URL | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/services` | `src/pages/services.astro` |
| `/about-us` | `src/pages/about-us.astro` |
| `/projects` | `src/pages/projects.astro` |
| `/contact` | `src/pages/contact.astro` |

Each page composes sections from `src/components/` and uses the shared layout,
header, and footer. Every page sets `export const prerender = true`.

## Structure

```text
src/
  pages/                 # the five routes
  layouts/Base.astro     # document head, fonts, global styles, page scripts
  components/
    ui/                  # button, card, chip, field, and icon primitives
    home/ services/ about/ projects/ contact/
  lib/
    cardTilt.ts          # progressive card pointer interaction
    scrollReveal.ts      # viewport reveal and replay behaviour
    publicContact.ts     # contact action generation
    phone.ts whatsapp.ts # number parsing and link building
  styles/global.css      # Tailwind import, design tokens, shared styles
public/                  # static assets served from the site root
scripts/
  build-spark.mjs        # build and audit the static artifact
  deploy-spark.mjs       # guarded Hosting-only deploy
tests/
  spark-hosting.test.mjs
  whatsapp.test.mjs
  phone.test.mjs
firebase.json            # plain static Hosting configuration
firebase.spark.json      # Spark Hosting configuration used by deploy:spark
```

## Styling and design

`UI-UX-design/` is the approved design source of truth, with
`UI-UX-design/precision_industrial_engineering/DESIGN.md` holding the tokens and
prose spec. It is read-only input.

The shared palette, typography, radii, shadows, and interaction styles live in
the `@theme` block of `src/styles/global.css`. Keep page styling in Tailwind
utility classes and shared styles in `global.css`; do not reintroduce hex values
into components.

Scroll reveals and card interactions are initialised by `src/layouts/Base.astro`.
Reveals replay as elements leave and re-enter the viewport. Motion respects
`prefers-reduced-motion`, and page content stays visible without JavaScript.

## Contact details

`PUBLIC_WHATSAPP_NUMBER` and `PUBLIC_CONTACT_PHONE` are read from the build
environment and baked into the static HTML. Copy `.env.example` to `.env` and set
the confirmed values — use digits-only international format for WhatsApp and an
international number with a leading `+` for the phone. Both values appear on the
published Contact page, so they are public, not secret.

The public Contact page has no inquiry form and no email submission. It offers
direct WhatsApp and phone links plus a location card. Because no verified
business address has been supplied, the card states that location details are to
be confirmed and does not link to a map.

## Content status

The code owns every string on the site. Section copy lives in the component that
renders it. Before a real launch, the owner must confirm or replace:

- the WhatsApp number and phone number in the build environment, which are
  currently placeholders;
- the business address, which is unset, so the Contact card shows a
  "to be confirmed" notice;
- the sector cards on Home and Projects, which describe the scope of work per
  sector rather than named client engagements and present no client names,
  dates, or performance metrics;
- the About page narrative, service scope wording, and any capability claim.

Only the owner can supply these facts. Do not fill them in with invented
certifications, client names, project metrics, or years in business.

## Build and deploy

```sh
npm run build      # writes dist/client/
npm run build:spark   # check + build + audit dist/client/
```

`npm run build:spark` fails when required routes are missing, when `[REPLACE:`
markers, temporary prototype image URLs, credential patterns, or source maps
reach `dist/client/`, or when the direct WhatsApp and telephone links are absent
from the Contact page. It is the gate before any Hosting deploy.

`firebase.json` is the plain static Hosting configuration. `firebase.spark.json`
adds `noindex` and security headers and is the config used by the deploy script.
Neither configures rewrites or backend services.

To deploy Hosting only, name the project and confirm explicitly:

```sh
npm run deploy:spark -- --project <firebase-project-id> --confirm-static-hosting-deploy
```

The command rebuilds and re-audits first, then runs
`firebase deploy --only hosting --config firebase.spark.json`. It refuses to run
without both arguments. Confirm the project and its plan before running it. Do
not enable billing or deploy server-side services as part of this procedure.
