-- ============================================================
-- Vibe-to-Meal: Initial Schema
-- Run via: supabase db push
-- ============================================================

-- PROFILES
-- Auto-created for every auth user via trigger below.
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- MEAL HISTORY
-- Stores meals the user saves after getting recommendations.
CREATE TABLE IF NOT EXISTS meal_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name    TEXT NOT NULL CHECK (char_length(meal_name) <= 200),
  description  TEXT CHECK (char_length(description) <= 1000),
  ingredients  TEXT[],
  instructions TEXT CHECK (char_length(instructions) <= 2000),
  vibe         TEXT NOT NULL CHECK (char_length(vibe) <= 100),
  emoji        TEXT CHECK (char_length(emoji) <= 10),
  saved_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_history: owner read"
  ON meal_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "meal_history: owner insert"
  ON meal_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_history: owner delete"
  ON meal_history FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast profile lookups
CREATE INDEX IF NOT EXISTS meal_history_user_id_idx ON meal_history(user_id);
CREATE INDEX IF NOT EXISTS meal_history_saved_at_idx ON meal_history(saved_at DESC);
