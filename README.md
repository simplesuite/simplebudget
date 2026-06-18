<p align="center">
  <img src="public/simplebudget.png" alt="simpleBudget screenshot" width="250" />
</p>

<h1 align="center">simpleBudget</h1>

<p align="center">
  A simple, open-source budgeting app built with React, TypeScript, and Supabase. Track expenses, share budgets, and manage your money.
</p>

<p align="center">
  <a href="https://github.com/simplesuite/simplebudget/blob/main/LICENSE"><img src="https://img.shields.io/github/license/simplesuite/simplebudget" alt="License" /></a>
  <a href="https://github.com/simplesuite/simplebudget/stargazers"><img src="https://img.shields.io/github/stars/simplesuite/simplebudget" alt="Stars" /></a>
  <a href="https://github.com/simplesuite/simplebudget/issues"><img src="https://img.shields.io/github/issues/simplesuite/simplebudget" alt="Issues" /></a>
  <a href="https://supabase.com"><img src="https://supabase.com/badge-made-with-supabase.svg" alt="Made with Supabase" /></a>
</p>

---

## What is simpleBudget?

simpleBudget is a free, open-source alternative to YNAB and Mint for personal budgeting. It's a mobile-first progressive web app (PWA) you can install on iOS, Android, or desktop — or self-host with Docker.

Built for people who want a straightforward way to manage their money without subscriptions or ads.

## Features

- **Multiple budgets** — Create and switch between separate budgets
- **Sections & categories** — Organize spending however you want
- **Transaction tracking** — Log income and expenses with split-transaction support
- **Budget sharing** — Share budgets with other users via QR code
- **Analytics** — Pie charts for income and expense breakdown
- **Copy budgets** — Duplicate a month's budget outline to another month
- **CSV export** — Download your data anytime
- **Notifications** — Daily browser reminders for upcoming transactions
- **Dark & light mode** — Respects your preference
- **Offline support** — Works without internet, syncs when reconnected
- **Installable PWA** — Add to home screen on any device
- **Self-hostable** — Run on your own server via [simplesuite-selfhost](https://github.com/simplesuite/simplesuite-selfhost)

## An Open-Source Alternative To

- EveryDollar
- YNAB (You Need a Budget)
- Mint
- Goodbudget
- Copilot Money

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| UI | MUI 7 (Material UI) |
| State | Zustand |
| Backend | Supabase (auth, database, real-time) |
| Routing | react-router-dom v7 |
| PWA | vite-plugin-pwa |
| Testing | Vitest |
| Deployment | Vercel |

## Getting Started

### Quick Start (Development)

```bash
# Clone the repo
git clone https://github.com/simplesuite/simplebudget.git
cd simplebudget

# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

## Self-Hosting

To self-host simpleBudget (along with the other simpleSuite apps and the Supabase backend), see the **[simplesuite-selfhost](https://github.com/simplesuite/simplesuite-selfhost)** repository. It has everything needed to run each frontend and the backend on your own infrastructure.

### Environment Variables

The app works out of the box with the default Supabase project. To connect your own:

```bash
cp .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in `.env.local`.

## Project Structure

```
src/
├── components/
│   ├── modals/          # Dialog components (AddTransaction, EditCategory, etc.)
│   ├── subcomponents/   # Shared UI (AppToolbar, BudgetSection, etc.)
│   └── extras/          # Utilities (api_functions, GrabBudgetData, etc.)
├── store/               # Zustand stores (globalStore, tableStore, notificationStore)
├── lib/                 # Supabase client, notifications, offline sync
└── test/                # Unit tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [GNU AGPL v3](LICENSE).
