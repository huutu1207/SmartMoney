import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

// Firebase logic
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';

// Notification Service
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

// Tạo Ref để điều hướng từ bên ngoài component (dành cho thông báo)
export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          // Logic chọn icon theo tên route
          if (route.name === 'Trang chủ') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Thống kê') {
            iconName = 'chart-pie';
          } else if (route.name === 'Cài đặt') {
            iconName = 'cog';
          }
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

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Cài đặt thông báo
    const setupNotifications = async () => {
      await registerForPushNotificationsAsync();
    };
    setupNotifications();

    // 2. Lắng nghe khi người dùng nhấn vào thông báo
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.isReady()) {
        // Chuyển hướng đến màn hình AddTransaction nếu được set trong data của thông báo
        navigationRef.navigate(screen);
      }
    });

    // 3. Lắng nghe trạng thái đăng nhập
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return () => {
      unsubscribe();
      subscription.remove(); // Cleanup listener thông báo
    };
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
      <PaperProvider>
        {/* Truyền ref vào NavigationContainer */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen name="MainApp" component={MainTabs} />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                <Stack.Screen name="AddCategories" component={AddCategories} />
                <Stack.Screen name="ScanPreview" component={ScanPreviewScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}