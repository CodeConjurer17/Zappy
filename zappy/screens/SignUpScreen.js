import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { SERVER_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!username.trim() || !displayName.trim() || !password || !confirm) {
      setError('please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setError('passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          displayName: displayName.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'signup failed');
        return;
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      navigation.reset({
        index: 0,
        routes: [{ name: 'ChatList', params: { user: data.user, token: data.token } }],
      });
    } catch (e) {
      setError('cannot reach server — check your WiFi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.appName}>Zappy</Text>
          <Text style={styles.tagline}>create your account</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>display name</Text>
          <TextInput style={styles.input} placeholder="how people see you" placeholderTextColor="#555" value={displayName} onChangeText={setDisplayName} />

          <Text style={styles.label}>username</Text>
          <TextInput style={styles.input} placeholder="unique username" placeholderTextColor="#555" value={username} onChangeText={setUsername} autoCapitalize="none" />

          <Text style={styles.label}>password</Text>
          <TextInput style={styles.input} placeholder="at least 6 characters" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>confirm password</Text>
          <TextInput style={styles.input} placeholder="repeat your password" placeholderTextColor="#555" value={confirm} onChangeText={setConfirm} secureTextEntry />

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp} disabled={loading}>
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.signupBtnText}>create account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={styles.loginText}>already have an account? <Text style={styles.loginLink}>log in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { flexGrow: 1 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 32, backgroundColor: '#D4537E' },
  backBtn: { position: 'absolute', top: 16, left: 16 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 26, fontWeight: '600', color: 'white', letterSpacing: 2 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  form: { padding: 28, gap: 6 },
  errorBox: { backgroundColor: '#3d1a1a', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#E24B4A' },
  errorText: { color: '#F09595', fontSize: 13 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#252540', borderRadius: 12, padding: 14, fontSize: 14, color: '#fff' },
  signupBtn: { backgroundColor: '#D4537E', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 20 },
  signupBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  loginText: { color: '#666', fontSize: 13 },
  loginLink: { color: '#D4537E' },
});