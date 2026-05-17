import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Image, StatusBar as RNStatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useCallback, useEffect } from 'react';
import { SERVER_URL } from '../config';
import { getSocket } from '../socket';
import { LinearGradient } from 'expo-linear-gradient';

const SWIPE_THRESHOLD = 60;

function PatternOverlay({ pattern }) {
  const c = '#ffffff10';
  if (pattern === 'dots') return (
    <View style={StyleSheet.absoluteFill}>
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(row =>
        [0,1,2,3,4,5,6,7].map(col => (
          <View key={`${row}-${col}`} style={{ position:'absolute', top:row*48+24, left:col*48+24, width:4, height:4, borderRadius:2, backgroundColor:c }} />
        ))
      )}
    </View>
  );
  if (pattern === 'hearts') return (
    <View style={StyleSheet.absoluteFill}>
      {[0,1,2,3,4,5,6,7,8,9].map(row =>
        [0,1,2,3,4].map(col => (
          <Text key={`${row}-${col}`} style={{ position:'absolute', top:row*60+20, left:col*80+((row%2)*40), fontSize:14, color:'#ffffff15' }}>♥</Text>
        ))
      )}
    </View>
  );
  if (pattern === 'stars') return (
    <View style={StyleSheet.absoluteFill}>
      {[0,1,2,3,4,5,6,7,8,9].map(row =>
        [0,1,2,3,4].map(col => (
          <Text key={`${row}-${col}`} style={{ position:'absolute', top:row*60+20, left:col*80+((row%2)*40), fontSize:12, color:'#ffffff15' }}>★</Text>
        ))
      )}
    </View>
  );
  if (pattern === 'bubbles') return (
    <View style={StyleSheet.absoluteFill}>
      {[{t:40,l:20,r:40},{t:100,l:180,r:60},{t:200,l:60,r:30},{t:300,l:240,r:50},{t:420,l:30,r:45},{t:500,l:150,r:35},{t:600,l:280,r:55},{t:680,l:80,r:42}].map((b,i) => (
        <View key={i} style={{ position:'absolute', top:b.t, left:b.l, width:b.r, height:b.r, borderRadius:b.r/2, backgroundColor:'#ffffff08', borderWidth:0.5, borderColor:'#ffffff15' }} />
      ))}
    </View>
  );
  if (pattern === 'waves') return (
    <View style={StyleSheet.absoluteFill}>
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
        <View key={i} style={{ position:'absolute', top:i*50, left:-10, right:-10, height:20, borderRadius:10, backgroundColor:'#ffffff06' }} />
      ))}
    </View>
  );
  if (pattern === 'grid') return (
    <View style={StyleSheet.absoluteFill}>
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <View key={`h${i}`} style={{ position:'absolute', top:i*60, left:0, right:0, height:0.5, backgroundColor:'#ffffff12' }} />
      ))}
      {[0,1,2,3,4,5,6,7].map(i => (
        <View key={`v${i}`} style={{ position:'absolute', left:i*50, top:0, bottom:0, width:0.5, backgroundColor:'#ffffff12' }} />
      ))}
    </View>
  );
  return null;
}

function MessageBubble({ item, onReply }) {
  if (item.sender === 'system') {
    return (
      <View style={styles.systemMsg}>
        <Text style={styles.systemMsgText}>{item.text}</Text>
      </View>
    );
  }

  const isMe = item.sender === 'me';
  const translateX = useRef(new Animated.Value(0)).current;
  const replyTriggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 2;
        const correctDirection = isMe ? g.dx < 0 : g.dx > 0;
        return isHorizontal && correctDirection;
      },
      onMoveShouldSetPanResponderCapture: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2;
        const correctDirection = isMe ? g.dx < 0 : g.dx > 0;
        return isHorizontal && correctDirection;
      },
      onPanResponderGrant: () => {
        replyTriggered.current = false;
      },
      onPanResponderMove: (_, g) => {
        const direction = isMe ? Math.min(0, g.dx) : Math.max(0, g.dx);
        translateX.setValue(direction);
        if (Math.abs(direction) >= SWIPE_THRESHOLD && !replyTriggered.current) {
          replyTriggered.current = true;
          onReply(item);
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start(() => {
          replyTriggered.current = false;
        });
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          replyTriggered.current = false;
        });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.msgRow,
        isMe ? styles.msgRowMe : styles.msgRowThem,
        { transform: [{ translateX }] },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {item.replyTo && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyText} numberOfLines={1}>{item.replyTo.text}</Text>
          </View>
        )}
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.msgImage} resizeMode="cover" />
          : <Text style={styles.msgText}>{item.text}</Text>
        }
        <Text style={styles.msgTime}>{item.time}{isMe ? ' ✓✓' : ''}</Text>
      </View>
    </Animated.View>
  );
}

export default function MessageScreen({ route, navigation }) {
  const { name, color, userId, toUserId, token } = route.params ?? {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [background, setBackground] = useState({ id: 'default', type: 'solid', value: '#1a1a2e' });
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const prevSentImage = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    }

    fetchMessages();
    fetchBackground();

    const socket = getSocket();
    socketRef.current = socket;

    const handleMessage = (message) => {
      setMessages(prev => [message, ...prev]);
    };

    const handleBackgroundChanged = ({ background: newBg, changerName }) => {
      setBackground(newBg);
      setMessages(prev => [{
        id: Date.now().toString(),
        text: `${changerName} changed the background`,
        sender: 'system',
        time: '',
        replyTo: null,
      }, ...prev]);
    };

    if (socket.connected) {
      socket.on('receive_message', handleMessage);
      socket.on('background_changed', handleBackgroundChanged);
    } else {
      socket.on('connect', () => {
        socket.on('receive_message', handleMessage);
        socket.on('background_changed', handleBackgroundChanged);
      });
    }

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('background_changed', handleBackgroundChanged);
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(false);
        RNStatusBar.setBackgroundColor('#252540');
      }
    };
  }, []);

  const fetchBackground = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/messages/background/${userId}/${toUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.background) setBackground(data.background);
    } catch (e) {
      console.log('fetch background error:', e);
    }
  };

  const saveBackground = async (bg) => {
    try {
      await fetch(`${SERVER_URL}/messages/background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, otherUserId: toUserId, background: bg }),
      });
    } catch (e) {
      console.log('save background error:', e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/messages/${userId}/${toUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const formatted = data.reverse().map(m => ({
        id: m.id.toString(),
        text: m.text || '',
        image: m.image || null,
        sender: m.from_user_id === userId ? 'me' : 'them',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: m.reply_to || null,
      }));
      setMessages(formatted);
      await fetch(`${SERVER_URL}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, otherUserId: toUserId }),
      });
    } catch (e) {
      console.log('fetch messages error:', e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyingTo ? { text: replyingTo.text } : null,
    };
    setMessages(prev => [newMsg, ...prev]);
    setInput('');
    setReplyingTo(null);

    try {
      const res = await fetch(`${SERVER_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserId: userId,
          toUserId,
          text: newMsg.text,
          replyTo: newMsg.replyTo,
        }),
      });
      const saved = await res.json();
      socketRef.current?.emit('send_message', {
        toUserId: toUserId.toString(),
        message: {
          id: saved.id.toString(),
          text: saved.text || '',
          image: saved.image || null,
          sender: 'them',
          time: new Date(saved.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          replyTo: saved.reply_to || null,
        }
      });
    } catch (e) {
      console.log('send error:', e);
    }
  };

  const handleReply = useCallback((item) => {
    setReplyingTo(item);
    inputRef.current?.blur();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble item={item} onReply={handleReply} />
  ), [handleReply]);

  const sentImage = route.params?.sentImage;
  if (sentImage && sentImage !== prevSentImage.current) {
    prevSentImage.current = sentImage;
    const imgMsg = {
      id: Date.now().toString(),
      text: '',
      image: sentImage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: null,
    };
    setMessages(prev => [imgMsg, ...prev]);
  }

  return (
    <View style={styles.container}>
      {background.type === 'gradient' && (
        <LinearGradient colors={background.value} style={StyleSheet.absoluteFill} />
      )}
      {background.type === 'solid' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: background.value }]} />
      )}
      {background.type === 'pattern' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a2e' }]} />
      )}

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.onlineText}>online</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('BackgroundPicker', {
            currentBg: background,
            chatName: name,
            userId,
            toUserId,
            token,
            onSelect: (bg) => {
              setBackground(bg);
              saveBackground(bg);
              setMessages(prev => [{
                id: Date.now().toString(),
                text: `you changed the background`,
                sender: 'system',
                time: '',
                replyTo: null,
              }, ...prev]);
            },
          })}
          style={styles.bgBtn}
        >
          <Text style={styles.bgBtnIcon}>🎨</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <View style={{ flex: 1 }}>
          {background.type === 'pattern' && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <PatternOverlay pattern={background.value} />
            </View>
          )}
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            inverted
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          />
        </View>

        {replyingTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyBarInner}>
              <Text style={styles.replyBarLabel}>replying to</Text>
              <Text style={styles.replyBarText} numberOfLines={1}>{replyingTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={styles.replyCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => navigation.navigate('Camera', { userId, toUserId, token })}
          >
            <Text style={styles.cameraBtnIcon}>📷</Text>
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="message..."
            placeholderTextColor="#555"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { backgroundColor: '#252540', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 10, borderBottomWidth: 0.5, borderBottomColor: '#2a2a4a' },
  backBtn: { padding: 4 },
  backArrow: { color: '#aaa', fontSize: 22 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 14, fontWeight: '600' },
  headerName: { color: 'white', fontSize: 14, fontWeight: '500' },
  onlineText: { color: '#1D9E75', fontSize: 11 },
  bgBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bgBtnIcon: { fontSize: 18 },
  messageList: { padding: 14, gap: 10 },
  msgRow: { marginVertical: 4 },
  msgRowMe: { alignItems: 'flex-end' },
  msgRowThem: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 10 },
  bubbleMe: { backgroundColor: '#7F77DD', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#252540', borderBottomLeftRadius: 4 },
  replyPreview: { borderLeftWidth: 2, borderLeftColor: '#ffffff55', paddingLeft: 8, marginBottom: 6 },
  replyText: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  msgText: { color: 'white', fontSize: 14 },
  msgImage: { width: 200, height: 200, borderRadius: 12 },
  msgTime: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  systemMsg: { alignItems: 'center', marginVertical: 8 },
  systemMsgText: { color: '#555', fontSize: 11, backgroundColor: '#252540', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  replyBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252540', borderTopWidth: 0.5, borderTopColor: '#2a2a4a', padding: 10, gap: 10 },
  replyBarInner: { flex: 1, borderLeftWidth: 2, borderLeftColor: '#7F77DD', paddingLeft: 8 },
  replyBarLabel: { color: '#7F77DD', fontSize: 11 },
  replyBarText: { color: '#ccc', fontSize: 12 },
  replyCancel: { color: '#666', fontSize: 16, padding: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252540', padding: 12, gap: 10, borderTopWidth: 0.5, borderTopColor: '#2a2a4a' },
  cameraBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  cameraBtnIcon: { fontSize: 24 },
  input: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: 'white', fontSize: 16, maxHeight: 120 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: 'white', fontSize: 16 },
});