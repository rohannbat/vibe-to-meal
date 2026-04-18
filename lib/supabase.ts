import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from '@/types/database.types';

// Secure storage adapter:
// - iOS: Keychain Services (hardware-backed AES-256)
// - Android: Android Keystore System
// - Web: Falls back gracefully (SecureStore unavailable in browser)
const SecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return Promise.resolve(null);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return Promise.resolve();
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') return Promise.resolve();
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly at startup — never allow a silently unconfigured client.
// The ANON_KEY is safe to expose in the client bundle: it enforces
// Row Level Security policies defined server-side. Never use SERVICE_ROLE
// key here — that bypasses RLS entirely.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
      'must be set in .env.local — see .env.example for required keys.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native has no browser URL bar; prevents URL-based session hijack vector
  },
});
