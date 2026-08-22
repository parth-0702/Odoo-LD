# GlobeTrotter Local Development

## Technology stack

GlobeTrotter is a full-stack TypeScript application built with **React 19**, **Vite 7**, **Tailwind CSS 4**, **Express 4**, and **tRPC 11**. It uses **Drizzle ORM** with a MySQL-compatible database, **Manus OAuth** for authenticated workspaces, **Google Maps** for destination search and route visualization, and **Vitest** for unit tests. The interface uses Radix/shadcn-style primitives, Lucide icons, Framer Motion, and Wouter routing.

## Use pnpm, not npm

This repository is intentionally configured for **pnpm 10.4.1** and includes a `pnpm-lock.yaml` file. Its dependency structure uses pnpm-linked packages and patches, which npm does not handle reliably in an existing checkout. The tested local workflow is therefore:

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm dev
```

The development server starts through the `dev` script. Open the local address that the command prints. For additional workflows, use the following commands.

| Goal | Command |
| --- | --- |
| Type-check the project | `pnpm check` |
| Run unit tests | `pnpm test` |
| Build for production | `pnpm build` |
| Start a completed production build | `pnpm start` |
| Generate and apply database migrations | `pnpm db:push` |

## Browser-local demo mode

When the managed OAuth variables are unavailable, the landing-page **Start a plan** button opens the fully functional browser-local travel desk at `/local`. It provides the PDF-specified planning experience without a database or external service: local signup/login at `/auth`, multi-city trip creation and editing, city and activity discovery, timelines and calendars, budget breakdowns, a route sketch, share/copy flows, profile/preferences, and analytics at `/local-admin`.

Local mode saves its data in the browser under GlobeTrotter-specific `localStorage` keys. A public local itinerary route such as `/local/share/<trip-id>` works only in the browser where its trip was created. For account-backed sharing, database persistence, Maps search, and cloud storage across devices, configure the deployment environment variables and use the authenticated `/app` workspace.

## If npm has already been used

If you ran `npm install`, remove the npm artifacts before returning to the supported workflow:

```bash
rm -rf node_modules package-lock.json
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm dev
```

The observed npm 10.9.2 failure was `Cannot read properties of null (reading 'matches')` inside npm's Arborist dependency resolver. This is a package-manager compatibility problem rather than an application-code error. The project was verified with `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build`.

## Dependency build approval

On some systems pnpm may report that it ignored dependency build scripts for `esbuild` and `@tailwindcss/oxide`. If the application does not start or build, run:

```bash
pnpm approve-builds
pnpm rebuild
```

Approve only the named project dependencies you recognize.
