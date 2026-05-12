# simpleBudget Marketing Site

Static marketing site built with [Astro](https://astro.build).

## Pages

- `/` — Landing page
- `/pricing` — Pricing & FAQ
- `/about` — About page
- `/privacy` — Privacy policy
- `/terms` — Terms of service

## Development

```bash
cd marketing
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build    # outputs to dist/
npm run preview  # preview the build locally
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

### Vercel Setup

If deploying alongside the main app:
- Marketing site: root domain (`simplebudget.com`) → this project
- App: subdomain (`app.simplebudget.com`) → the Vite SPA

In Vercel, create a separate project pointing to the `marketing/` directory with:
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
