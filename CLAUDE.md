# Vibe-to-Meal — Project Guide

React Native app (Expo + Supabase) that maps a user's mood/vibe to meal recommendations powered by Claude AI.

---

## Architecture

### Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo SDK 54 | Managed workflow, OTA updates |
| Routing | Expo Router (file-based) | Co-located routes, typed navigation |
| Backend | Supabase | Auth + Postgres + RLS + Edge Functions |
| AI | Claude (claude-haiku via Edge Function) | Meal recommendations |
| Language | TypeScript (strict) | End-to-end type safety |
| Builds | EAS (Expo Application Services) | iOS + Android production builds |

### Folder Structure
```
app/
  _layout.tsx            Root layout — auth routing, session listener
  (auth)/
    _layout.tsx          Auth stack
    sign-in.tsx          Sign in screen
    sign-up.tsx          Sign up screen
  (tabs)/
    _layout.tsx          Tab bar (Home, Explore, Profile)
    index.tsx            Home — vibe selector + ingredient input
    explore.tsx          Browse vibes directly
    profile.tsx          Saved meals + sign out
  results.tsx            Meal recommendations screen
  scan.tsx               Camera fridge scanner
lib/
  supabase.ts            Supabase client singleton
supabase/
  migrations/
    001_initial_schema.sql   profiles + meal_history tables with RLS
  functions/
    recommend-meals/index.ts   Edge Function — calls Claude, returns 3 meals
types/
  database.types.ts      Supabase schema types (update after schema changes)
eas.json                 EAS build profiles (dev, preview, production)
```

---

## Security Model

### Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` — client-safe, stored in `.env.local`
- `ANTHROPIC_API_KEY` — **server-side only**, set as Supabase Edge Function secret:
  ```bash
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  ```
- `SERVICE_ROLE` key must **never** appear in this codebase — it bypasses RLS entirely

### Session Storage
- Auth session JWTs stored via `expo-secure-store`:
  - iOS: Keychain Services (hardware-backed AES-256)
  - Android: Android Keystore System
- `detectSessionInUrl: false` prevents URL-based session hijack vectors

### Database Security
- RLS enabled on all tables (`profiles`, `meal_history`)
- All policies are owner-scoped: users can only read/write their own rows
- Input length constraints enforced at DB level (CHECK constraints)
- Auto-created `profiles` row on signup via trigger (SECURITY DEFINER)

### Rules
- Never hardcode credentials, tokens, or API keys
- Never use `SERVICE_ROLE` key client-side
- All user input validated in Edge Function before Claude call
- Ingredients list capped at 20 items, each max 50 chars

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
cp .env.example .env.local
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Apply database schema
npx supabase db push
# or run supabase/migrations/001_initial_schema.sql in Supabase SQL editor

# 4. Deploy Edge Function
npx supabase functions deploy recommend-meals
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 5. Start dev server
npx expo start
```

### EAS Builds
```bash
# Install EAS CLI
npm install -g eas-cli

# Preview build (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all
```

### Generate Supabase Types (after schema changes)
```bash
npx supabase gen types typescript \
  --project-id <your-project-ref> \
  --schema public \
  > types/database.types.ts
```

---

## User Flow
1. **Sign up / Sign in** → email + password auth
2. **Home tab** → pick a vibe (Cozy, Energetic, Happy, Comfort, Spicy, Healthy, Lazy, Romantic)
3. **Optional** → type ingredients or tap "Scan my fridge" to use camera
4. **Find My Meals** → calls `recommend-meals` Edge Function → Claude returns 3 meals
5. **Results screen** → tap a meal to expand recipe, tap "Save Meal" to store in history
6. **Explore tab** → jump directly to any vibe
7. **Profile tab** → view + delete saved meals, sign out
