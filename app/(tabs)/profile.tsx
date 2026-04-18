import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type MealRow = Database['public']['Tables']['meal_history']['Row'];

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setEmail(session.user.email ?? null);

    const { data, error } = await supabase
      .from('meal_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('saved_at', { ascending: false })
      .limit(50);

    setLoading(false);
    if (!error && data) setMeals(data);
  }

  async function deleteMeal(id: string) {
    Alert.alert('Remove meal', 'Remove this meal from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('meal_history').delete().eq('id', id);
          if (!error) setMeals((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C47FF" />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{email?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.mealCount}>{meals.length} meal{meals.length !== 1 ? 's' : ''} saved</Text>
      </View>

      <Text style={styles.sectionLabel}>Saved Meals</Text>

      {loading ? (
        <ActivityIndicator color="#6C47FF" style={{ marginTop: 32 }} />
      ) : meals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyText}>No saved meals yet.{'\n'}Go find something delicious!</Text>
        </View>
      ) : (
        meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealRow}>
              <Text style={styles.mealEmoji}>{meal.emoji ?? '🍴'}</Text>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
                <Text style={styles.mealVibe}>vibe: {meal.vibe}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteMeal(meal.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6C47FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  email: { fontSize: 15, color: '#aaa', marginBottom: 4 },
  mealCount: { fontSize: 13, color: '#555' },
  sectionLabel: {
    fontSize: 11,
    color: '#555',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  mealCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  mealEmoji: { fontSize: 28 },
  mealInfo: { flex: 1, backgroundColor: 'transparent' },
  mealName: { fontSize: 15, color: '#fff', fontWeight: '600' },
  mealVibe: { fontSize: 12, color: '#555', marginTop: 2, textTransform: 'capitalize' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#444', fontSize: 14 },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'transparent',
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  signOutBtn: {
    marginTop: 36,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: '#555', fontSize: 14, fontWeight: '600' },
});
