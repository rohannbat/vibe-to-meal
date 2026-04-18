import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

type Meal = {
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  instructions: string;
};

export default function ResultsScreen() {
  const { vibe, ingredients } = useLocalSearchParams<{ vibe: string; ingredients: string }>();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/(auth)/sign-in' as any);
      return;
    }

    const parsedIngredients: string[] = (() => {
      try { return JSON.parse(ingredients ?? '[]'); }
      catch { return []; }
    })();

    const { data, error: fnError } = await supabase.functions.invoke('recommend-meals', {
      body: { vibe, ingredients: parsedIngredients },
    });

    setLoading(false);

    if (fnError || !data?.meals) {
      setError('Could not get recommendations. Please try again.');
      return;
    }

    setMeals(data.meals);
  }

  async function saveMeal(meal: Meal, index: number) {
    if (saved.has(index)) return;
    setSaving(index);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('meal_history').insert({
      user_id: session.user.id,
      meal_name: meal.name,
      description: meal.description,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      vibe: vibe ?? '',
      emoji: meal.emoji,
    });

    setSaving(null);

    if (error) {
      Alert.alert('Error', 'Could not save meal. Please try again.');
    } else {
      setSaved((prev) => new Set(prev).add(index));
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Finding your {vibe} meals…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchMeals}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Your {vibe} meals ✨</Text>
      <Text style={styles.subheading}>Tap a card to see the recipe</Text>

      {meals.map((meal, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => setExpanded(expanded === i ? null : i)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <View style={styles.cardTitle}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDesc}>{meal.description}</Text>
            </View>
          </View>

          {expanded === i && (
            <View style={styles.cardBody}>
              <Text style={styles.recipeLabel}>Ingredients</Text>
              {meal.ingredients.map((ing, j) => (
                <Text key={j} style={styles.ingredient}>• {ing}</Text>
              ))}

              <Text style={[styles.recipeLabel, { marginTop: 16 }]}>Instructions</Text>
              <Text style={styles.instructions}>{meal.instructions}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saved.has(i) && styles.saveBtnDone]}
            onPress={() => saveMeal(meal, i)}
            disabled={saved.has(i) || saving === i}
          >
            {saving === i ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {saved.has(i) ? '✓ Saved' : '+ Save Meal'}
              </Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  centered: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: '#666', marginTop: 16, fontSize: 15 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  retryBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: { padding: 12 },
  backRow: { marginBottom: 24 },
  backText: { color: '#6C47FF', fontSize: 15, fontWeight: '500' },
  heading: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4, textTransform: 'capitalize' },
  subheading: { fontSize: 13, color: '#555', marginBottom: 28 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'transparent',
  },
  mealEmoji: { fontSize: 36 },
  cardTitle: { flex: 1, backgroundColor: 'transparent' },
  mealName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  mealDesc: { fontSize: 13, color: '#777', lineHeight: 18 },
  cardBody: { marginTop: 16, backgroundColor: 'transparent' },
  recipeLabel: {
    fontSize: 11,
    color: '#6C47FF',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ingredient: { color: '#bbb', fontSize: 13, marginBottom: 4 },
  instructions: { color: '#bbb', fontSize: 13, lineHeight: 20 },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#6C47FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDone: { backgroundColor: '#2A2A2A' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
