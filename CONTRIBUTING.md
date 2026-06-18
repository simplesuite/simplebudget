# Contributing to simpleTracker

Thanks for your interest in contributing! This document covers the basics for getting started.

## Getting Started

1. Fork the repository and clone your fork
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Run tests: `npm test`
5. Build for production: `npm run build`

You'll need Node.js 18+ and npm installed.

## Development Workflow

1. Create a branch from `main` for your work
2. Make your changes, keeping commits focused and well-described
3. Run `npm test` to make sure existing tests pass
4. If you're adding new logic in `src/lib/`, add tests alongside it in `src/lib/__tests__/`
5. Run `npm run build` to verify production builds succeed
6. Open a pull request against `main`

## Project Conventions

- **TypeScript** — All source files use TypeScript. Avoid `any` where possible.
- **React** — Functional components with hooks only. No class components.
- **State** — Zustand stores in `src/store/`. Keep store logic out of components.
- **UI** — MUI (Material UI) components. Follow existing patterns for styling with `sx` prop.
- **Offline-first** — Non-shared mutations go through the offline queue (`src/lib/offlineQueue.ts`). Shared items require connectivity.
- **Validation** — Input validation lives in `src/lib/validation.ts`. Use it in both UI and store layers.
- **Testing** — Vitest with happy-dom. Property-based tests use fast-check. Tests live in `__tests__/` directories next to the code they test.

## What to Contribute

- Bug fixes (check existing issues or file a new one using the bug report template)
- Feature requests (open an issue using the feature request template first to discuss)
- Performance improvements
- Accessibility improvements
- Documentation improvements
- Test coverage for uncovered logic

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Reference any related issues
- Make sure tests pass and the build succeeds
- Don't introduce new dependencies without discussion in an issue first

## Reporting Bugs

Use the [bug report template](https://github.com/jbrow4/simpletracker/issues/new?template=bug_report.md) to file issues. Include steps to reproduce, expected behavior, and screenshots if applicable.

## Code of Conduct

Be respectful and constructive. We're all here to build something useful together.

## License

By contributing, you agree that your contributions will be licensed under the [AGPL-3.0](LICENSE) license.
