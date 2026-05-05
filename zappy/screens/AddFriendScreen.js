import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { SERVER_URL } from '../config';

const AVATAR_COLORS = ['#7F77DD', '#D4537E', '#EF9F27', '#1D9E75', '#378ADD', '#D85A30'];

export default function AddFriendScreen({ navigation, route }) {
  const { user, token } = route.params ?? {};
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState({});
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${SERVER_URL}/friends/search?username=${encodeURIComponent(query.trim())}&userId=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setResults(data);
      if (data.length === 0) setError('no users found');
    } catch (e) {
      setError('could not search — check your connection');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (toUserId) => {
    try {
      const res = await fetch(`${SERVER_URL}/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId: user.id, receiverId: toUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSent(prev => ({ ...prev, [toUserId]: data.error || 'already sent' }));
        return;
      }
      setSent(prev => ({ ...prev, [toUserId]: 'sent' }));
    } catch (e) {
      setSent(prev => ({ ...prev, [toUserId]: 'error' }));
    }
  };

  const getColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>add a friend</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="search by username..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          {loading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={styles.searchBtnText}>search</Text>}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
              <Text style={styles.avatarText}>{item.display_name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            {sent[item.id] ? (
              <View style={styles.sentBadge}>
                <Text style={styles.sentText}>
                  {sent[item.id] === 'sent' ? '✓ sent' : sent[item.id]}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => sendRequest(item.id)}
              >
                <Text style={styles.addBtnText}>+ add</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#252540', borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  backText: { color: '#aaa', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 15, fontWeight: '500' },
  searchRow: { flexDirection: 'row', gap: 10, padding: 16 },
  input: { flex: 1, backgroundColor: '#252540', borderRadius: 12, padding: 12, fontSize: 14, color: 'white' },
  searchBtn: { backgroundColor: '#7F77DD', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
  errorText: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 8 },
  list: { padding: 16, gap: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252540', borderRadius: 14, padding: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '600' },
  userInfo: { flex: 1 },
  displayName: { color: 'white', fontSize: 14, fontWeight: '500' },
  username: { color: '#888', fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#7F77DD', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14 },
  addBtnText: { color: 'white', fontSize: 12, fontWeight: '500' },
  sentBadge: { backgroundColor: '#0F6E56', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14 },
  sentText: { color: '#9FE1CB', fontSize: 12 },
});