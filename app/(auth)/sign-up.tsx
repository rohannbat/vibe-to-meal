import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter your password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Verify your email before signing in.',
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start discovering meals for your vibe</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#555"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <Link href={'/(auth)/sign-in' as any} asChild>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F0F0F' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#777', marginBottom: 36 },
  input: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { marginTop: 24 },
  linkText: { color: '#777', fontSize: 14 },
  linkHighlight: { color: '#6C47FF', fontWeight: '600' },
});
