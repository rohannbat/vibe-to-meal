import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';

const VIBE_CARDS = [
  { vibe: 'cozy',      emoji: '🛋️',  label: 'Cozy',      desc: 'Warm, hearty dishes for a relaxed evening',     color: '#FF8C42' },
  { vibe: 'energetic', emoji: '⚡',   label: 'Energetic', desc: 'Light, power-packed meals to fuel your day',     color: '#FFD600' },
  { vibe: 'happy',     emoji: '😊',   label: 'Happy',     desc: 'Fun, colourful food that puts a smile on',        color: '#4CAF50' },
  { vibe: 'sad',       emoji: '😔',   label: 'Comfort',   desc: 'Soul food to lift your spirits',                  color: '#5C6BC0' },
  { vibe: 'spicy',     emoji: '🔥',   label: 'Spicy',     desc: 'Bold, fiery dishes for the adventurous',          color: '#F44336' },
  { vibe: 'healthy',   emoji: '🌿',   label: 'Healthy',   desc: 'Clean, nutritious options your body will love',   color: '#26A69A' },
  { vibe: 'lazy',      emoji: '😴',   label: 'Lazy',      desc: 'Minimal effort, maximum deliciousness',           color: '#AB47BC' },
  { vibe: 'romantic',  emoji: '🕯️',  label: 'Romantic',  desc: 'Elegant meals perfect for a special occasion',    color: '#EC407A' },
];

export default function ExploreScreen() {
  const router = useRouter();

  function goToVibe(vibe: string) {
    router.push({
      pathname: '/results' as any,
      params: { vibe, ingredients: '[]' },
    });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Vibes</Text>
      <Text style={styles.subtitle}>Jump straight into a mood</Text>

      {VIBE_CARDS.map((card) => (
        <TouchableOpacity
          key={card.vibe}
          style={[styles.card, { borderLeftColor: card.color }]}
          onPress={() => goToVibe(card.vibe)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
            <Text style={styles.cardDesc}>{card.desc}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 28 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardEmoji: { fontSize: 28 },
  cardText: { flex: 1, backgroundColor: 'transparent' },
  cardLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 12, color: '#555', lineHeight: 17 },
  arrow: { color: '#333', fontSize: 16 },
});
