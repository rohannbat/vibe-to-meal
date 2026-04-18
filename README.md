<div align="center">

# 🍽️ Vibe-to-Meal

**Tell the app how you feel. Get a meal that matches.**

A mood-based meal recommendation app powered by Claude AI.

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku-CC785C?style=flat)](https://anthropic.com)

</div>

---

## What is it?

Vibe-to-Meal maps your current mood to a meal recommendation. Pick a vibe — Cozy, Energetic, Spicy, Romantic — optionally scan your fridge or list what ingredients you have, and Claude suggests three meals that fit perfectly.

No endless scrolling through recipes. Just your vibe, and dinner.

---

## Features

- **8 vibes** — Cozy, Energetic, Happy, Comfort, Spicy, Healthy, Lazy, Romantic
- **Fridge scanner** — take a photo and list what you see, ingredients pass straight to the recommendation engine
- **AI-powered meals** — Claude Haiku generates 3 tailored meal ideas with full recipes
- **Save meals** — store your favourites, revisit them anytime from your profile
- **Browse by vibe** — Explore tab lets you jump straight to any mood
- **Secure auth** — email + password, sessions stored in device keychain (never localStorage)
- **Dark UI** — clean, minimal interface designed for one-handed use

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Backend | Supabase (Auth + Postgres + Edge Functions) |
| AI | Claude Haiku via Supabase Edge Function |
| Language | TypeScript (strict mode) |
| Session storage | expo-secure-store (iOS Keychain / Android Keystore) |
| Builds | EAS (Expo Application Services) |

---

## Architecture

```
User picks vibe
      │
      ▼
Home screen (React Native)
      │
      ├── Optional: Scan fridge → camera capture → type ingredients
      │
      ▼
router.push('/results')
      │
      ▼
Results screen calls Supabase Edge Function
      │
      ▼
Edge Function: recommend-meals (Deno)
  ├── Verify JWT (auth.getUser)
  ├── Validate + sanitise inputs
  └── Call Claude Haiku API (server-side, key never leaves Edge Function)
      │
      ▼
3 meal cards returned → user can save to meal_history
```

**Security highlights:**
- `ANTHROPIC_API_KEY` lives only in Supabase Secrets — never in client code
- Row Level Security on every table — users can only access their own rows
- Input length-capped and validated in Edge Function before Claude call
- Auth sessions stored in device-native encrypted storage

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Supabase account](https://supabase.com) (free tier works)
- [Anthropic API key](https://console.anthropic.com)
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Clone and install

```bash
git clone https://github.com/rohannbat/vibe-to-meal.git
cd vibe-to-meal
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project → **Settings → API**.

### 3. Set up the database

In your Supabase project → **SQL Editor**, run:

```sql
-- Copy and paste the contents of:
supabase/migrations/001_initial_schema.sql
```

This creates the `profiles` and `meal_history` tables with Row Level Security enabled.

### 4. Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy recommend-meals
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key
```

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS Simulator.

---

## Database Schema

```sql
profiles          -- auto-created on signup
  id uuid (FK → auth.users)
  email text
  created_at timestamptz

meal_history      -- saved meal recommendations
  id uuid
  user_id uuid (FK → auth.users)
  meal_name text
  description text
  ingredients text[]
  instructions text
  vibe text
  emoji text
  saved_at timestamptz
```

RLS policies ensure every query is scoped to the authenticated user.

---

## Production Builds

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Preview build (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production
eas build --profile production --platform all
eas submit --platform all
```

Store your production Supabase credentials as EAS Secrets — never in the repo.

---

## Project Structure

```
app/
  (auth)/          Sign in + sign up screens
  (tabs)/          Main tab navigation
    index.tsx      Home — vibe selector
    explore.tsx    Browse all vibes
    profile.tsx    Saved meals + account
  results.tsx      Meal recommendation results
  scan.tsx         Fridge camera scanner
lib/
  supabase.ts      Supabase client singleton
supabase/
  functions/
    recommend-meals/   Edge Function (Claude API call)
  migrations/
    001_initial_schema.sql
types/
  database.types.ts    Supabase schema types
```

---

## Built by

**Rohan Batra** — Security Analyst & builder

[rohannbat.github.io](https://rohannbat.github.io) · [GitHub](https://github.com/rohannbat) · [LinkedIn](https://www.linkedin.com/in/rohan-batra-3142b9239/)

---

<div align="center">
<sub>Built with Expo, Supabase, and Claude AI</sub>
</div>
