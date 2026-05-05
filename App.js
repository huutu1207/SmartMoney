import React, { useState, useEffect, useContext } from 'react'; // 1. Thêm useContext
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  adaptNavigationTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {
  NavigationContainer,
  createNavigationContainerRef,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

// Firebase & Notifications
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

// Screens
import Dashboard from './src/screens/Dashboard';
import Settings from './src/screens/Setting';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import UserProfileScreen from './src/screens/UserProfile';
import AddTransactionScreen from './src/screens/AddTransactions';
import AddCategories from './src/screens/AddCategories';
import ScanPreviewScreen from './src/screens/ScanPreview';
import StatisticsScreen from './src/screens/Statistics';
import ChangePasswordScreen from './src/screens/ChangePassword';
import ForgotPasswordScreen from './src/screens/ForgotPassword';
// --- IMPORT CONTEXT ---
import { ThemeContext, ThemeProvider } from './src/context/ThemeContext'; // 2. Thêm ThemeProvider

export const navigationRef = createNavigationContainerRef();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const customLightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...LightTheme.colors, primary: '#5856D6' }
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...DarkTheme.colors, primary: '#BB86FC' }
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Trang chủ' ? 'view-dashboard' : route.name === 'Thống kê' ? 'chart-pie' : 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5856D6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Trang chủ" component={Dashboard} />
      <Tab.Screen name="Thống kê" component={StatisticsScreen} />
      <Tab.Screen name="Cài đặt" component={Settings} />
    </Tab.Navigator>
  );
}


function AppContent() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const { isDarkMode } = useContext(ThemeContext);

  const theme = isDarkMode ? customDarkTheme : customLightTheme;

  useEffect(() => {
    registerForPushNotificationsAsync();
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.isReady()) navigationRef.navigate(screen);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return () => { unsubscribe(); subscription.remove(); };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5856D6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef} theme={theme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen name="MainApp" component={MainTabs} />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                <Stack.Screen name="AddCategories" component={AddCategories} />
                <Stack.Screen name="ScanPreview" component={ScanPreviewScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}