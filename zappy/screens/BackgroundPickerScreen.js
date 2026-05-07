import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { getSocket } from '../socket';

const SOLID_BACKGROUNDS = [
  { id: 'default', label: 'default', type: 'solid', value: '#1a1a2e' },
  { id: 'slate', label: 'slate', type: 'solid', value: '#2c3e50' },
  { id: 'forest', label: 'forest', type: 'solid', value: '#1a3a2a' },
  { id: 'wine', label: 'wine', type: 'solid', value: '#3a1a2a' },
  { id: 'ocean', label: 'ocean', type: 'solid', value: '#1a2a4a' },
  { id: 'sand', label: 'sand', type: 'solid', value: '#3a3020' },
];

const GRADIENT_BACKGROUNDS = [
  { id: 'sunset', label: 'sunset', type: 'gradient', value: ['#c0392b', '#e67e22'] },
  { id: 'aurora', label: 'aurora', type: 'gradient', value: ['#1abc9c', '#2980b9'] },
  { id: 'dusk', label: 'dusk', type: 'gradient', value: ['#8e44ad', '#3498db'] },
  { id: 'ember', label: 'ember', type: 'gradient', value: ['#e74c3c', '#f39c12'] },
  { id: 'mint', label: 'mint', type: 'gradient', value: ['#27ae60', '#1abc9c'] },
  { id: 'violet', label: 'violet', type: 'gradient', value: ['#9b59b6', '#8e44ad'] },
];

const PATTERN_BACKGROUNDS = [
  { id: 'dots', label: 'dots', type: 'pattern', value: 'dots' },
  { id: 'stars', label: 'stars', type: 'pattern', value: 'stars' },
  { id: 'hearts', label: 'hearts', type: 'pattern', value: 'hearts' },
  { id: 'waves', label: 'waves', type: 'pattern', value: 'waves' },
  { id: 'grid', label: 'grid', type: 'pattern', value: 'grid' },
  { id: 'bubbles', label: 'bubbles', type: 'pattern', value: 'bubbles' },
];

function PatternPreview({ pattern, size = 72 }) {
  const bg = '#1a1a2e';
  const c = '#ffffff22';
  const s = size;

  if (pattern === 'dots') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
        <View key={`${row}-${col}`} style={{
          position: 'absolute',
          top: row * (s/5) + (s/10) - 2,
          left: col * (s/5) + (s/10) - 2,
          width: 4, height: 4, borderRadius: 2,
          backgroundColor: c
        }} />
      )))}
    </View>
  );

  if (pattern === 'stars') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[{t:0.1,l:0.15},{t:0.3,l:0.5},{t:0.55,l:0.2},{t:0.7,l:0.65},{t:0.15,l:0.7},{t:0.45,l:0.85},{t:0.8,l:0.4},{t:0.6,l:0.05}].map((p,i) => (
        <Text key={i} style={{ position:'absolute', top:p.t*s, left:p.l*s, fontSize:s*0.12, color:'#ffffff35' }}>★</Text>
      ))}
    </View>
  );

  if (pattern === 'hearts') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[{t:0.05,l:0.1},{t:0.3,l:0.45},{t:0.55,l:0.15},{t:0.7,l:0.6},{t:0.15,l:0.65},{t:0.5,l:0.8},{t:0.8,l:0.35}].map((p,i) => (
        <Text key={i} style={{ position:'absolute', top:p.t*s, left:p.l*s, fontSize:s*0.14, color:'#ffffff30' }}>♥</Text>
      ))}
    </View>
  );

  if (pattern === 'waves') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[0,1,2,3,4,5].map(i => (
        <View key={i} style={{
          position: 'absolute',
          top: i * (s/6) + s/12 - 3,
          left: 0, right: 0,
          height: s * 0.08,
          borderRadius: s * 0.04,
          backgroundColor: c
        }} />
      ))}
    </View>
  );

  if (pattern === 'grid') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[0,1,2,3,4,5].map(i => (
        <View key={`h${i}`} style={{ position:'absolute', top: i*(s/5), left:0, right:0, height:0.5, backgroundColor: c }} />
      ))}
      {[0,1,2,3,4,5].map(i => (
        <View key={`v${i}`} style={{ position:'absolute', left: i*(s/5), top:0, bottom:0, width:0.5, backgroundColor: c }} />
      ))}
    </View>
  );

  if (pattern === 'bubbles') return (
    <View style={{ width: s, height: s, backgroundColor: bg, overflow: 'hidden' }}>
      {[{t:0.1,l:0.1,r:0.25},{t:0.4,l:0.5,r:0.2},{t:0.15,l:0.6,r:0.18},{t:0.6,l:0.15,r:0.22},{t:0.65,l:0.6,r:0.28},{t:0.35,l:0.25,r:0.15}].map((b,i) => (
        <View key={i} style={{
          position:'absolute',
          top: b.t*s, left: b.l*s,
          width: b.r*s, height: b.r*s,
          borderRadius: b.r*s/2,
          backgroundColor: '#ffffff0a',
          borderWidth: 0.5, borderColor: '#ffffff20'
        }} />
      ))}
    </View>
  );

  return <View style={{ width: s, height: s, backgroundColor: bg }} />;
}

export default function BackgroundPickerScreen({ navigation, route }) {
  const { currentBg, onSelect, chatName, userId, toUserId, token } = route.params ?? {};
  const [customColor, setCustomColor] = useState('');
  const [customError, setCustomError] = useState('');

  const handleSelect = (bg) => {
    if (onSelect) onSelect(bg);

    const socket = getSocket();
    if (socket) {
      socket.emit('background_change', {
        toUserId: toUserId?.toString(),
        background: bg,
        changerName: chatName,
      });
    }

    navigation.goBack();
  };

  const handleCustomColor = () => {
    const hex = customColor.trim();
    const valid = /^#([0-9A-Fa-f]{6})$/.test(hex);
    if (!valid) {
      setCustomError('enter a valid hex color (e.g. #1a2b3c)');
      return;
    }
    setCustomError('');
    handleSelect({ id: 'custom', label: 'custom', type: 'solid', value: hex });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {chatName ? `${chatName}'s background` : 'chat background'}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>solid colors</Text>
        <View style={styles.grid}>
          {SOLID_BACKGROUNDS.map(bg => (
            <TouchableOpacity key={bg.id} style={styles.item} onPress={() => handleSelect(bg)}>
              <View style={[styles.preview, { backgroundColor: bg.value }, currentBg?.id === bg.id && styles.previewActive]} />
              <Text style={styles.itemLabel}>{bg.label}</Text>
              {currentBg?.id === bg.id && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>gradients</Text>
        <View style={styles.grid}>
          {GRADIENT_BACKGROUNDS.map(bg => (
            <TouchableOpacity key={bg.id} style={styles.item} onPress={() => handleSelect(bg)}>
              <LinearGradient
                colors={bg.value}
                style={[styles.preview, currentBg?.id === bg.id && styles.previewActive]}
              />
              <Text style={styles.itemLabel}>{bg.label}</Text>
              {currentBg?.id === bg.id && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>patterns</Text>
        <View style={styles.grid}>
          {PATTERN_BACKGROUNDS.map(bg => (
            <TouchableOpacity key={bg.id} style={styles.item} onPress={() => handleSelect(bg)}>
              <View style={[styles.preview, currentBg?.id === bg.id && styles.previewActive, { overflow: 'hidden', padding: 0 }]}>
                <PatternPreview pattern={bg.value} size={72} />
              </View>
              <Text style={styles.itemLabel}>{bg.label}</Text>
              {currentBg?.id === bg.id && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>custom color</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="#1a2b3c"
            placeholderTextColor="#555"
            value={customColor}
            onChangeText={setCustomColor}
            autoCapitalize="none"
            maxLength={7}
          />
          <TouchableOpacity style={styles.customBtn} onPress={handleCustomColor}>
            <Text style={styles.customBtnText}>apply</Text>
          </TouchableOpacity>
        </View>
        {customError ? <Text style={styles.customError}>{customError}</Text> : null}
        {customColor.length === 7 && /^#([0-9A-Fa-f]{6})$/.test(customColor) && (
          <View style={[styles.customPreview, { backgroundColor: customColor }]} />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#252540', borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  backText: { color: '#aaa', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 15, fontWeight: '500' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionLabel: { color: '#555', fontSize: 12, letterSpacing: 1, marginBottom: 14, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  item: { alignItems: 'center', gap: 6, position: 'relative' },
  preview: { width: 72, height: 72, borderRadius: 14, borderWidth: 0.5, borderColor: '#333', overflow: 'hidden' },
  previewActive: { borderWidth: 2.5, borderColor: '#7F77DD' },
  itemLabel: { color: '#888', fontSize: 11 },
  checkBadge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center' },
  checkText: { color: 'white', fontSize: 10 },
  customRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  customInput: { flex: 1, backgroundColor: '#252540', borderRadius: 12, padding: 12, fontSize: 14, color: 'white' },
  customBtn: { backgroundColor: '#7F77DD', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  customBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
  customError: { color: '#E24B4A', fontSize: 12, marginBottom: 8 },
  customPreview: { width: '100%', height: 48, borderRadius: 14, marginTop: 4 },
});