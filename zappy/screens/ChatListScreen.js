import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SERVER_URL } from '../config';
import { getSocket, connectSocket } from '../socket';

const AVATAR_COLORS = ['#7F77DD', '#D4537E', '#EF9F27', '#1D9E75', '#378ADD', '#D85A30'];

export default function ChatListScreen({ navigation, route }) {
  const { user, token } = route.params ?? {};
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
      fetchPendingCount();
    }, [])
  );

  useEffect(() => {
    const socket = connectSocket(user.id);

    socket.on('friend_request_received', () => {
      fetchPendingCount();
    });

    socket.on('friend_accepted', () => {
      fetchFriends();
    });

    return () => {
      socket.off('friend_request_received');
      socket.off('friend_accepted');
    };
  }, []);
  
  const fetchFriends = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/friends/list/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFriends(data);
    } catch (e) {
      console.log('fetch friends error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/friends/pending/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPending(data.length);
    } catch (e) {}
  };

  const getColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zappy</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('PendingRequests', { user, token })}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
            {pending > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AddFriend', { user, token })}
          >
            <Text style={styles.iconBtnText}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { user, token })}>
            <View style={[styles.headerAvatar, { backgroundColor: getColor(user?.id ?? 0) }]}>
              <Text style={styles.headerAvatarText}>{user?.displayName?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#7F77DD" size="large" />
        </View>
      )}

      {!loading && friends.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>no friends yet</Text>
          <Text style={styles.emptySubText}>tap ➕ to add someone!</Text>
        </View>
      )}

      <FlatList
        data={friends}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => navigation.navigate('Message', {
              name: item.display_name,
              color: getColor(item.id),
              userId: user.id,
              toUserId: item.id,
              token,
            })}
          >
            <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
              <Text style={styles.avatarText}>{item.display_name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.display_name}</Text>
              <Text style={styles.chatMsg}>@{item.username}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { backgroundColor: '#252540', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  title: { color: 'white', fontSize: 20, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconBtnText: { fontSize: 18 },
  badge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#D4537E', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '600' },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: 'white', fontSize: 14, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: 'white', fontSize: 16, fontWeight: '500' },
  emptySubText: { color: '#666', fontSize: 13 },
  chatRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '600' },
  chatInfo: { flex: 1 },
  chatName: { color: 'white', fontSize: 14, fontWeight: '500' },
  chatMsg: { color: '#888', fontSize: 12, marginTop: 2 },
  arrow: { color: '#444', fontSize: 16 },
});