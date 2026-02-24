# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (runs `tsc && vite build`)
- **Lint:** `npm run lint`
- **Preview production build:** `npm run preview`

## Architecture

React 18 + TypeScript SPA using Vite, with react-router-dom v6 for routing and lucide-react for icons. No state management library — state is local to components. No test framework is configured. Plain CSS (no CSS modules or preprocessors) — each page/component has a corresponding `.css` file.

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

### Routing structure

Routes are defined in `src/App.tsx`. Two route groups:
- **Public routes** (flat): `/`, `/login`, `/verify-2fa`, `/confirm-account`, `/loading`
- **Authenticated routes** (nested under `<DashboardLayout>`): `/dashboard`, `/accounts`, `/transfers`, `/payments`, `/investments`, `/profile/*`

`DashboardLayout` (`src/components/layout/DashboardLayout.tsx`) wraps authenticated pages with Sidebar + Header + Footer and renders child routes via `<Outlet />`.

### File conventions

- **Pages:** `src/pages/<Name>Page.tsx` with styles in `src/styles/<Name>Page.css`
- **Layout components:** `src/components/layout/<Name>.tsx` with co-located `<Name>.css`
- Global styles in `src/styles/index.css`

### TypeScript config

Strict mode enabled with `noUnusedLocals` and `noUnusedParameters` — unused variables/imports will cause build failures.
