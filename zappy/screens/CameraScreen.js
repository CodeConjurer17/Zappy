import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(null);
  const [brightness, setBrightness] = useState(0);
  const [activeFilter, setActiveFilter] = useState('none');
  const cameraRef = useRef(null);

  const filters = [
    { id: 'none', label: 'normal' },
    { id: 'warm', label: 'warm' },
    { id: 'cool', label: 'cool' },
    { id: 'fade', label: 'fade' },
  ];

  const filterStyle = {
    none: {},
    warm: { tintColor: null, overlayColor: 'rgba(255,140,0,0.15)' },
    cool: { overlayColor: 'rgba(0,120,255,0.15)' },
    fade: { overlayColor: 'rgba(255,255,255,0.2)' },
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>camera access needed</Text>
          <Text style={styles.permissionSub}>so you can take and share photos in Zappy</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>allow camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
            <Text style={styles.cancelText}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    setPhoto(result.uri);
  };

    const applyAndSend = async () => {
        if (!photo) return;
        setSaving('sending');
        try {
        const edited = await ImageManipulator.manipulateAsync(
            photo,
            [],
            {
            compress: 0.85,
            format: ImageManipulator.SaveFormat.JPEG,
            }
        );

        navigation.navigate('Message', {
            ...(route.params ?? {}),
            sentImage: edited.uri,
        });
        } catch (e) {
        console.log('send error:', e);
        setSaving(null);
        }
    };

  const saveToGallery = async () => {
    if (!photo) return;
    setSaving('saving');
    try {
      if (!mediaPermission?.granted) await requestMediaPermission();
      await MediaLibrary.saveToLibraryAsync(photo);
      setSaving('saved');
      setTimeout(() => setSaving(null), 2000);
    } catch (e) {
      setSaving(null);
    }
  };

  const retake = () => {
    setPhoto(null);
    setActiveFilter('none');
    setBrightness(0);
  };

  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={retake}>
            <Text style={styles.editHeaderBtn}>← retake</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>edit photo</Text>
          <TouchableOpacity onPress={applyAndSend}>
            {saving === 'sending'
              ? <ActivityIndicator color="#7F77DD" />
              : <Text style={styles.sendText}>send ➤</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.preview} resizeMode="cover" />
          {activeFilter !== 'none' && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: filterStyle[activeFilter].overlayColor, borderRadius: 16 }]} pointerEvents="none" />
          )}
        </View>

        <View style={styles.editTools}>
          <Text style={styles.toolLabel}>filters</Text>
          <View style={styles.filterRow}>
            {filters.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterBtn, activeFilter === f.id && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f.id)}
              >
                <Text style={[styles.filterLabel, activeFilter === f.id && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveToGallery}
          >
            {saving === 'saving'
              ? <ActivityIndicator color="white" />
              : <Text style={styles.saveBtnText}>
                  {saving === 'saved' ? '✓ saved to gallery!' : '↓ save to gallery'}
                </Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.editHeaderBtn}>✕ close</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
          <Text style={styles.editHeaderBtn}>⟳ flip</Text>
        </TouchableOpacity>
      </View>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />

      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permissionTitle: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  permissionSub: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  permissionBtn: { backgroundColor: '#7F77DD', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  permissionBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  cancelText: { color: '#666', fontSize: 13 },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  camera: { flex: 1, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden' },
  cameraControls: { padding: 32, alignItems: 'center' },
  shutterBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white' },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  editHeaderBtn: { color: '#aaa', fontSize: 14 },
  editTitle: { color: 'white', fontSize: 14, fontWeight: '500' },
  sendText: { color: '#7F77DD', fontSize: 15, fontWeight: '600' },
  photoContainer: { flex: 1, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  preview: { flex: 1 },
  editTools: { padding: 20, gap: 12 },
  toolLabel: { color: '#888', fontSize: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 0.5, borderColor: '#444' },
  filterBtnActive: { backgroundColor: '#7F77DD', borderColor: '#7F77DD' },
  filterLabel: { color: '#888', fontSize: 12 },
  filterLabelActive: { color: 'white' },
  saveBtn: { backgroundColor: '#252540', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: 'white', fontSize: 13 },
});