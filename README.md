# Open CoreBank — Frontend

Single-page application for the Open CoreBank digital banking platform. Built with React 18 and TypeScript, deployed at [app.open-corebank.xyz](https://app.open-corebank.xyz).

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Routing | React Router DOM v6 |
| HTTP client | Axios |
| Icons | Lucide React |
| Styling | Plain CSS (per-component files) |
| Deployment | Vercel |

## Features

- **Authentication** — Login, registration, logout, JWT + refresh token handling, CSRF protection
- **Two-factor authentication** — Email-based OTP with countdown timer
- **Email verification** — Automatic verification via link (`?token=`) or manual code entry
- **Password recovery** — Forgot password and reset password flows
- **Dashboard** — Account overview with balances and recent activity
- **Accounts** — View accounts, deposit, withdraw, check limits
- **Transfers** — Send money by alias or account number, with fee preview and receipt
- **Transaction history** — Paginated list with filters and detail modal
- **Profile** — Personal info editing with avatar selection
- **Security** — Change password, toggle 2FA, deactivate account

## Project Structure

```
src/
├── pages/          # One file per route (LoginPage, DashboardPage, ...)
├── components/
│   ├── layout/     # DashboardLayout, Sidebar, Header, Footer
│   └── shared/     # ProtectedRoute, modals
├── context/        # AuthContext (global auth state)
├── services/       # API calls (authService, accountService, ...)
├── types/          # TypeScript interfaces matching the backend DTOs
└── styles/         # CSS files, one per page/component
```

## Routes

| Path | Access | Description |
|---|---|---|
| `/login` | Public | Login and registration |
| `/confirm-account` | Public | Email verification (auto or manual) |
| `/verify-2fa` | Public | Two-factor authentication |
| `/forgot-password` | Public | Request password reset |
| `/reset-password` | Public | Reset password via token |
| `/loading` | Public | Post-login loading screen |
| `/dashboard` | Protected | Account overview |
| `/accounts` | Protected | Account management |
| `/transactions` | Protected | Transaction history |
| `/transfers` | Protected | Money transfers |
| `/payments` | Protected | Payments |
| `/profile` | Protected | Personal information |
| `/profile/security` | Protected | Security settings |

## Getting Started

### Prerequisites

- Node.js 18+
- The [Open CoreBank backend](https://github.com/your-org/core-bank-backend) running locally on port `8080`

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file at the root:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

For production, set `VITE_API_URL` to your backend's public URL in Vercel's environment variable settings.

### Development

```bash
npm run dev
```

The dev server proxies `/api/*` requests to `http://localhost:8080` automatically (configured in `vite.config.ts`).

### Build

```bash
npm run build
```

Output is in `dist/`. TypeScript errors will fail the build (`tsc && vite build`).

### Other commands

```bash
npm run lint      # ESLint (zero warnings policy)
npm run preview   # Preview the production build locally
```

## Authentication Flow

The app uses **JWT Bearer tokens** stored in `localStorage`, with **httpOnly refresh tokens** managed via cookies.

1. Login → backend returns `{ token, ...user }` → stored in `localStorage`
2. Every request attaches `Authorization: Bearer <token>` via an Axios interceptor
3. On 401 → the interceptor automatically calls `POST /auth/refresh` once and retries the original request
4. On refresh failure → clears storage and redirects to `/login`
5. XSRF token is read from the `XSRF-TOKEN` cookie and forwarded as `X-XSRF-TOKEN` on every request

## Email Verification Flow

After registration, the backend sends an email containing:
- A **clickable link**: `https://app.open-corebank.xyz/confirm-account?token=<token>`
- The **raw token** for manual entry as a fallback

When the user clicks the link, the frontend reads `?token=` from the URL and automatically calls `POST /auth/verify-email` on mount — no user interaction required.

## Deployment

The app is deployed on Vercel. Set the following environment variable in the Vercel project settings:

```
VITE_API_URL=https://<your-backend-url>/api/v1
```

Since Vite inlines env vars at build time, any change to `VITE_API_URL` requires a new deployment.
