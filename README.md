# getBajaaj — GetBajaaj Mobile (Rider + Driver)

Expo (Expo Router, TypeScript) app. Phase 1: project scaffolding and a
single placeholder home screen only — no auth screens, no ride logic, no
database queries yet.

## Stack

- Expo SDK 57, Expo Router (file-based routing), TypeScript
- NativeWind v4 (Tailwind CSS v3 under the hood) — `dark:` variants follow
  the OS color scheme automatically
- Clerk (`@clerk/expo`) — provider wired with a SecureStore-backed token
  cache, no sign-in/sign-up UI yet
- TanStack React Query (`QueryClientProvider` wired in the root layout, no
  queries fired yet)

## Install

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in a real value:

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk dashboard](https://dashboard.clerk.com/~/api-keys) — same Clerk application as `bajaaj/` (the web app); one Clerk app, two client SDKs |

Expo only exposes env vars prefixed `EXPO_PUBLIC_` to client code — never
put a secret key in this app.

## Run

```bash
npx expo start        # then press `w` for web, or scan the QR code for
                       # a device/simulator via Expo Go
npx expo start --web  # web preview directly
```

The home screen shows the GetBajaaj brand, tagline, and a "Get Started"
button (no navigation wired yet), and responds to system light/dark mode.

## Notes on this stack (Expo SDK 57)

This repo pulled in a very recent Expo SDK with real breaking changes from
older tutorials/training data:

- **`src/app/`, not `app/`**: `create-expo-app`'s current default template
  roots Expo Router at `src/app/` (see `tsconfig.json`'s `@/*` → `./src/*`
  alias). Expo Router auto-detects this — no extra config needed.
- **Clerk package renamed**: `@clerk/clerk-expo` is deprecated in favor of
  `@clerk/expo` (Core 3). `publishableKey` must now be passed explicitly
  to `ClerkProvider` (not just read from env internally) — see
  `src/app/_layout.tsx`. The SecureStore token cache import moved to
  `@clerk/expo/token-cache`.
- **NativeWind v4 targets Tailwind CSS v3**, not v4 — `tailwindcss` is
  pinned to `^3.4.17` in `package.json` on purpose.

## Project structure

```
src/
  app/
    _layout.tsx   Root layout — Clerk, React Query, NativeWind CSS import
    index.tsx     Home screen
  global.css      Tailwind directives (loaded via metro.config.js)
babel.config.js    nativewind/babel + jsxImportSource
metro.config.js    withNativeWind(...)
tailwind.config.js content: ["./src/**/*.{js,jsx,ts,tsx}"], darkMode: "media"
```
