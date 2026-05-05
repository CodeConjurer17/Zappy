import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUNDS = [
  { id: 'default', label: 'default', type: 'solid', value: '#1a1a2e' },
  { id: 'midnight', label: 'midnight', type: 'solid', value: '#0d0d1a' },
  { id: 'forest', label: 'forest', type: 'solid', value: '#0d1f0d' },
  { id: 'wine', label: 'wine', type: 'solid', value: '#1a0d14' },
  { id: 'ocean', label: 'ocean', type: 'solid', value: '#0d1a2e' },
  { id: 'sand', label: 'sand', type: 'solid', value: '#1f1a0d' },
  { id: 'bubbles', label: 'bubbles', type: 'pattern', value: 'bubbles' },
  { id: 'dots', label: 'dots', type: 'pattern', value: 'dots' },
  { id: 'stars', label: 'stars', type: 'pattern', value: 'stars' },
  { id: 'hearts', label: 'hearts', type: 'pattern', value: 'hearts' },
  { id: 'waves', label: 'waves', type: 'pattern', value: 'waves' },
  { id: 'grid', label: 'grid', type: 'pattern', value: 'grid' },
];

function PatternPreview({ pattern, bgColor = '#1a1a2e', size = 60 }) {
  const s = size;
  const c = '#ffffff18';
  const patterns = {
    bubbles: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[{t:8,l:8,r:18},{t:28,l:24,r:12},{t:14,l:40,r:14},{t:38,l:6,r:10},{t:44,l:36,r:16}].map((b,i) => (
          <View key={i} style={{ position:'absolute', top:b.t, left:b.l, width:b.r, height:b.r, borderRadius:b.r/2, backgroundColor:c }} />
        ))}
      </View>
    ),
    dots: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <View key={`${row}-${col}`} style={{ position:'absolute', top:row*16+8, left:col*16+8, width:4, height:4, borderRadius:2, backgroundColor:c }} />
        )))}
      </View>
    ),
    stars: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[{t:8,l:12},{t:20,l:36},{t:36,l:18},{t:48,l:44},{t:14,l:50},{t:44,l:6}].map((s2,i) => (
          <Text key={i} style={{ position:'absolute', top:s2.t, left:s2.l, fontSize:8, color:'#ffffff40' }}>★</Text>
        ))}
      </View>
    ),
    hearts: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[{t:6,l:10},{t:22,l:32},{t:38,l:12},{t:46,l:42},{t:14,l:48}].map((h,i) => (
          <Text key={i} style={{ position:'absolute', top:h.t, left:h.l, fontSize:10, color:'#ffffff30' }}>♥</Text>
        ))}
      </View>
    ),
    waves: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={{ position:'absolute', top:i*14+4, left:-4, right:-4, height:6, borderRadius:3, backgroundColor:c }} />
        ))}
      </View>
    ),
    grid: (
      <View style={{ width: s, height: s, backgroundColor: bgColor, overflow: 'hidden' }}>
        {[0,1,2,3,4].map(i => (
          <View key={`h${i}`} style={{ position:'absolute', top:i*14, left:0, right:0, height:0.5, backgroundColor:c }} />
        ))}
        {[0,1,2,3,4].map(i => (
          <View key={`v${i}`} style={{ position:'absolute', left:i*14, top:0, bottom:0, width:0.5, backgroundColor:c }} />
        ))}
      </View>
    ),
  };
  return patterns[pattern] ?? <View style={{ width: s, height: s, backgroundColor: bgColor }} />;
}

export default function BackgroundPickerScreen({ navigation, route }) {
  const { currentBg, onSelect, chatName } = route.params ?? {};

  const handleSelect = (bg) => {
    if (onSelect) onSelect(bg);
    navigation.goBack();
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
          {BACKGROUNDS.filter(b => b.type === 'solid').map(bg => (
            <TouchableOpacity
              key={bg.id}
              style={styles.item}
              onPress={() => handleSelect(bg)}
            >
              <View style={[
                styles.preview,
                { backgroundColor: bg.value },
                currentBg?.id === bg.id && styles.previewActive
              ]} />
              <Text style={styles.itemLabel}>{bg.label}</Text>
              {currentBg?.id === bg.id && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>patterns</Text>
        <View style={styles.grid}>
          {BACKGROUNDS.filter(b => b.type === 'pattern').map(bg => (
            <TouchableOpacity
              key={bg.id}
              style={styles.item}
              onPress={() => handleSelect(bg)}
            >
              <View style={[styles.preview, currentBg?.id === bg.id && styles.previewActive, { overflow: 'hidden', padding: 0 }]}>
                <PatternPreview pattern={bg.value} size={72} />
              </View>
              <Text style={styles.itemLabel}>{bg.label}</Text>
              {currentBg?.id === bg.id && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
});