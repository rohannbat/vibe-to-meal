import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

const VIBES = [
  { id: 'cozy',      emoji: '🛋️',  label: 'Cozy',      color: '#FF8C42' },
  { id: 'energetic', emoji: '⚡',   label: 'Energetic', color: '#FFD600' },
  { id: 'happy',     emoji: '😊',   label: 'Happy',     color: '#4CAF50' },
  { id: 'sad',       emoji: '😔',   label: 'Comfort',   color: '#5C6BC0' },
  { id: 'spicy',     emoji: '🔥',   label: 'Spicy',     color: '#F44336' },
  { id: 'healthy',   emoji: '🌿',   label: 'Healthy',   color: '#26A69A' },
  { id: 'lazy',      emoji: '😴',   label: 'Lazy',      color: '#AB47BC' },
  { id: 'romantic',  emoji: '🕯️',  label: 'Romantic',  color: '#EC407A' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ingredients?: string }>();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.ingredients) {
      setIngredients(params.ingredients);
    }
  }, [params.ingredients]);

  async function handleGetMeals() {
    if (!selectedVibe) {
      Alert.alert('Pick a vibe', 'Select a vibe to get meal recommendations.');
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/(auth)/sign-in' as any);
      return;
    }
    setLoading(false);

    const ingredientList = ingredients
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)
      .slice(0, 20);

    router.push({
      pathname: '/results' as any,
      params: {
        vibe: selectedVibe,
        ingredients: JSON.stringify(ingredientList),
      },
    });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vibe-to-Meal</Text>
      <Text style={styles.subtitle}>What's your vibe right now?</Text>

      <View style={styles.vibeGrid}>
        {VIBES.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.vibeCard,
              selectedVibe === v.id && { borderColor: v.color, borderWidth: 2 },
            ]}
            onPress={() => setSelectedVibe(v.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.vibeEmoji}>{v.emoji}</Text>
            <Text style={[styles.vibeLabel, selectedVibe === v.id && { color: v.color }]}>
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ingredientSection}>
        <Text style={styles.sectionLabel}>Ingredients you have (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. chicken, rice, garlic"
          placeholderTextColor="#444"
          value={ingredients}
          onChangeText={setIngredients}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />
        <TouchableOpacity
          style={styles.scanLink}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanLinkText}>📷  Scan my fridge instead</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.cta, !selectedVibe && styles.ctaDisabled, loading && styles.ctaDisabled]}
        onPress={handleGetMeals}
        disabled={!selectedVibe || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Find My Meals ✨</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F0F0F' },
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 28,
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  vibeCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    flexGrow: 1,
  },
  vibeEmoji: { fontSize: 26, marginBottom: 4 },
  vibeLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  ingredientSection: { marginBottom: 28, backgroundColor: 'transparent' },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    minHeight: 52,
  },
  scanLink: { marginTop: 10, alignSelf: 'flex-start' },
  scanLinkText: { color: '#6C47FF', fontSize: 14, fontWeight: '500' },
  cta: {
    backgroundColor: '#6C47FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
