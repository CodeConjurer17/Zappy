import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { SERVER_URL } from '../config';

const AVATAR_COLORS = ['#7F77DD', '#D4537E', '#EF9F27', '#1D9E75', '#378ADD', '#D85A30'];

export default function ProfileScreen({ navigation, route }) {
  const { user, token } = route.params ?? {};
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color ?? '#7F77DD');

const handleSave = async () => {
    try {
      await fetch(`${SERVER_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName, username, bio, avatarColor }),
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.log('save profile error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>profile</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
            <Text style={styles.editBtn}>{editing ? 'save' : 'edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase()}</Text>
          </View>
          {editing && (
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>pick a color</Text>
              <View style={styles.colorPicker}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, avatarColor === c && styles.colorDotActive]}
                    onPress={() => setAvatarColor(c)}
                  />
                ))}
              </View>
            </View>
          )}
          {!editing && (
            <>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileUsername}>@{username}</Text>
              {bio ? <Text style={styles.profileBio}>{bio}</Text> : null}
            </>
          )}
        </View>

        {editing && (
          <View style={styles.form}>
            <Text style={styles.label}>display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor="#555"
              placeholder="your name"
            />
            <Text style={styles.label}>username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#555"
              placeholder="username"
              autoCapitalize="none"
            />
            <Text style={styles.label}>bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholderTextColor="#555"
              placeholder="say something about yourself"
              multiline
            />
          </View>
        )}

        {saved && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✓ profile saved</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>settings</Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('ChatList')}>
            <Text style={styles.settingIcon}>💬</Text>
            <Text style={styles.settingLabel}>chats</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>notifications</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingLabel}>privacy & security</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutText}>log out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#252540', borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  backBtn: { padding: 4 },
  backText: { color: '#aaa', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '500' },
  editBtn: { color: '#7F77DD', fontSize: 14, fontWeight: '500' },
  avatarSection: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: 'white', fontSize: 36, fontWeight: '600' },
  profileName: { color: 'white', fontSize: 20, fontWeight: '600' },
  profileUsername: { color: '#888', fontSize: 13 },
  profileBio: { color: '#aaa', fontSize: 13, marginTop: 4 },
  colorLabel: { color: '#888', fontSize: 12 },
  colorRow: { alignItems: 'center', gap: 8 },
  colorPicker: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: 'white' },
  form: { paddingHorizontal: 24, gap: 6 },
  label: { fontSize: 12, color: '#888', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#252540', borderRadius: 12, padding: 14, fontSize: 14, color: 'white' },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  savedBadge: { margin: 20, backgroundColor: '#0F6E56', borderRadius: 10, padding: 12, alignItems: 'center' },
  savedText: { color: '#9FE1CB', fontSize: 13 },
  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionTitle: { color: '#555', fontSize: 12, marginBottom: 12, textTransform: 'lowercase', letterSpacing: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  settingIcon: { fontSize: 18, width: 28 },
  settingLabel: { flex: 1, color: 'white', fontSize: 14 },
  settingArrow: { color: '#444', fontSize: 16 },
  logoutBtn: { margin: 24, marginTop: 32, backgroundColor: '#252540', borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 0.5, borderColor: '#E24B4A' },
  logoutText: { color: '#E24B4A', fontSize: 14, fontWeight: '500' },
});