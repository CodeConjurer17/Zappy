import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { SERVER_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password) {
      setError('please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'login failed');
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
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.appName}>Zappy</Text>
        <Text style={styles.tagline}>chat with your people</Text>
      </View>

      <View style={styles.form}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>username</Text>
        <TextInput
          style={styles.input}
          placeholder="your username"
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>password</Text>
        <TextInput
          style={styles.input}
          placeholder="your password"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.loginBtnText}>log in</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupText}>don't have an account? <Text style={styles.signupLink}>sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, backgroundColor: '#7F77DD' },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 28, fontWeight: '600', color: 'white', letterSpacing: 2 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  form: { padding: 28, gap: 8 },
  errorBox: { backgroundColor: '#3d1a1a', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#E24B4A' },
  errorText: { color: '#F09595', fontSize: 13 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#252540', borderRadius: 12, padding: 14, fontSize: 14, color: '#fff' },
  loginBtn: { backgroundColor: '#7F77DD', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 20 },
  loginBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  signupText: { textAlign: 'center', color: '#666', fontSize: 13, marginTop: 16 },
  signupLink: { color: '#7F77DD' },
});