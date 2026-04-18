import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing authorization' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Unauthorized' }, 401);

  // ── Input validation ───────────────────────────────────────────────────────
  let body: { vibe?: unknown; ingredients?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { vibe, ingredients } = body;

  if (!vibe || typeof vibe !== 'string' || vibe.trim().length === 0 || vibe.length > 100) {
    return json({ error: 'Invalid vibe parameter' }, 400);
  }

  const safeIngredients: string[] = Array.isArray(ingredients)
    ? (ingredients as unknown[])
        .filter((i): i is string => typeof i === 'string')
        .slice(0, 20)
        .map((i) => i.slice(0, 50))
    : [];

  // ── Claude call ────────────────────────────────────────────────────────────
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'Service misconfigured' }, 500);

  const anthropic = new Anthropic({ apiKey });

  const ingredientContext = safeIngredients.length > 0
    ? `They have these ingredients available: ${safeIngredients.join(', ')}.`
    : 'They have no specific ingredients in mind — suggest anything that fits.';

  const prompt = `The user is feeling "${vibe.trim()}". ${ingredientContext}

Suggest exactly 3 meal ideas that perfectly match this vibe.

Respond ONLY with a raw JSON array — no markdown, no explanation, no code fences. Each element must have:
- "name": string (meal name, max 60 chars)
- "emoji": string (single emoji representing the meal)
- "description": string (1-2 sentences explaining why it matches the vibe)
- "ingredients": string[] (list of ingredients, max 10 items)
- "instructions": string (2-3 short steps to make it)`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    // Strip any accidental markdown fences before parsing
    const cleaned = content.text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    const meals = JSON.parse(cleaned);

    if (!Array.isArray(meals) || meals.length === 0) throw new Error('Invalid meals array');

    return json({ meals });
  } catch (err) {
    console.error('Claude error:', err);
    return json({ error: 'Failed to generate meal recommendations' }, 500);
  }
});
