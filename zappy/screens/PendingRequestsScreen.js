import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { SERVER_URL } from '../config';

export default function PendingRequestsScreen({ navigation, route }) {
  const { user, token } = route.params ?? {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/friends/pending/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.log('fetch pending error:', e);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (friendshipId, status) => {
    setResponding(prev => ({ ...prev, [friendshipId]: status }));
    try {
      await fetch(`${SERVER_URL}/friends/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendshipId, status }),
      });
      setRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
    } catch (e) {
      console.log('respond error:', e);
    } finally {
      setResponding(prev => ({ ...prev, [friendshipId]: null }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>friend requests</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#7F77DD" />
        </View>
      )}

      {!loading && requests.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>no pending requests</Text>
        </View>
      )}

      <FlatList
        data={requests}
        keyExtractor={item => item.friendship_id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.requestRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.display_name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => respond(item.friendship_id, 'accepted')}
              >
                {responding[item.friendship_id] === 'accepted'
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.acceptText}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => respond(item.friendship_id, 'declined')}
              >
                {responding[item.friendship_id] === 'declined'
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.declineText}>✕</Text>}
              </TouchableOpacity>
            </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: 14 },
  list: { padding: 16, gap: 10 },
  requestRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252540', borderRadius: 14, padding: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '600' },
  userInfo: { flex: 1 },
  displayName: { color: 'white', fontSize: 14, fontWeight: '500' },
  username: { color: '#888', fontSize: 12, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: 'white', fontSize: 16 },
  declineBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#993C1D', alignItems: 'center', justifyContent: 'center' },
  declineText: { color: 'white', fontSize: 14 },
});