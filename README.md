<p align="center">
<img width="250" height="250" alt="logo" src="https://github.com/user-attachments/assets/57426cb2-3e99-45ba-918c-8d79126c6571" />
</p>

# simpleBudget

[![Made with Supabase](https://supabase.com/badge-made-with-supabase.svg)](https://supabase.com)

A simple, mobile-first budget app for tracking income and expenses. Installable as a PWA on iOS and Android.

**Live:** [simplebudget.vercel.app](https://simplebudget.vercel.app/)

## Features

- Create and manage multiple budgets
- Organize spending with sections and categories
- Track transactions with split-transaction support
- Share budgets with other users via QR code
- Analytics with pie charts for income and expense breakdown
- Export data to CSV
- Dark/light theme
- Offline-capable PWA with auto-update prompts
- Works great on mobile — designed for daily use

## Tech Stack

- **React 19** with TypeScript
- **Vite** for builds and dev server
- **MUI 7** (Material UI) for components
- **Zustand** for state management
- **Supabase** for auth, database, and real-time
- **react-router-dom v7** for routing
- **vite-plugin-pwa** for service worker and installability
- **Vitest** for unit testing

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Run tests
npm test

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables (optional)

The app works out of the box with the default Supabase project. To use your own:

```bash
cp .env.example .env.local
```

Then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in `.env.local`.

## Project Structure

```
src/
├── components/
│   ├── modals/          # Dialog components (AddTransaction, EditCategory, etc.)
│   ├── subcomponents/   # Shared UI (AppToolbar, AreYouSure, UpdatePrompt, etc.)
│   └── extras/          # Utilities (api_functions, GrabBudgetData, etc.)
├── store/               # Zustand stores (globalStore, modalStore, tableStore)
├── lib/                 # Supabase client
└── test/                # Unit tests
```

## Deployment

Deployed on [Vercel](https://vercel.com). Push to the main branch to trigger a deploy.

## License

See [LICENSE](LICENSE).
