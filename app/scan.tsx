import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';

export default function ScanScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingredientText, setIngredientText] = useState('');

  async function handleScan() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission required',
        'Please enable camera access in your device settings to scan your fridge.'
      );
      return;
    }

    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    setLoading(false);

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handleUseIngredients() {
    const trimmed = ingredientText.trim();
    router.replace({
      pathname: '/(tabs)',
      params: { ingredients: trimmed },
    });
  }

  if (photoUri) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />

        <Text style={styles.label}>What ingredients do you see?</Text>
        <Text style={styles.hint}>Type them below separated by commas</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. eggs, cheese, spinach, tomatoes"
          placeholderTextColor="#444"
          value={ingredientText}
          onChangeText={setIngredientText}
          multiline
          autoFocus
        />

        <TouchableOpacity style={styles.useBtn} onPress={handleUseIngredients}>
          <Text style={styles.useBtnText}>Use These Ingredients →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhotoUri(null)}>
          <Text style={styles.retakeBtnText}>Retake Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.fullCenter}>
      <TouchableOpacity style={styles.backRowAbs} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>Scan My Fridge</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.scanHint}>Take a photo of your fridge or ingredients</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  fullCenter: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backRowAbs: { position: 'absolute', top: 56, left: 24 },
  backRow: { marginBottom: 20 },
  backText: { color: '#6C47FF', fontSize: 15, fontWeight: '500' },
  scanButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#6C47FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  scanIcon: { fontSize: 52, marginBottom: 8 },
  scanText: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  scanHint: { color: '#444', fontSize: 13, marginTop: 20, textAlign: 'center' },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 24,
  },
  label: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  hint: { fontSize: 13, color: '#555', marginBottom: 14 },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    minHeight: 80,
    marginBottom: 16,
  },
  useBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  useBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  retakeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  retakeBtnText: { color: '#555', fontSize: 14 },
});
