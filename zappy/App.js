import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import ChatListScreen from './screens/ChatListScreen';
import MessageScreen from './screens/MessageScreen';
import CameraScreen from './screens/CameraScreen';
import SignUpScreen from './screens/SignUpScreen.js';
import ProfileScreen from './screens/ProfileScreen';
import BackgroundPickerScreen from './screens/BackgroundPickerScreen';
import AddFriendScreen from './screens/AddFriendScreen';
import PendingRequestsScreen from './screens/PendingRequestsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const [initialParams, setInitialParams] = useState({});

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          setInitialRoute('ChatList');
          setInitialParams({ token, user: JSON.parse(userStr) });
        }
      } catch (e) {
        console.log('auth check error:', e);
      } finally {
        setChecking(false);
      }
    };
    checkLogin();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7F77DD" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#7F77DD',
          background: '#1a1a2e',
          card: '#1a1a2e',
          text: 'white',
          border: '#2a2a4a',
          notification: '#7F77DD',
        },
      }}
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a2e' },
          sceneContainerStyle: { backgroundColor: '#1a1a2e' },
          detachPreviousScreen: false,
          gestureEnabled: false,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
          },
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [{
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              }],
            },
          }),
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} initialParams={initialParams} />
        <Stack.Screen name="Message" component={MessageScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BackgroundPicker" component={BackgroundPickerScreen} />
        <Stack.Screen name="AddFriend" component={AddFriendScreen} />
        <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}