import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Firebase logic
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';

// Screens
import Dashboard from './src/screens/Dashboard';
import Settings from './src/screens/Setting';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import UserProfileScreen from './src/screens/UserProfile';

import AddTransactionScreen from './src/screens/AddTransactions';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- NHÓM MÀN HÌNH CHÍNH (Sau khi đăng nhập) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Trang chủ' ? 'view-dashboard' : 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5856D6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Trang chủ" component={Dashboard} />
      <Tab.Screen name="Cài đặt" component={Settings} />
    </Tab.Navigator>
  );
}

// --- COMPONENT CHÍNH ---
export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Lắng nghe trạng thái đăng nhập từ Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null; // Có thể thêm màn hình Loading ở đây

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              // Nếu ĐÃ đăng nhập: Vào thẳng Dashboard
              <>
              <Stack.Screen name="MainApp" component={MainTabs} />
              <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />

              </>
            ) : (
              <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register}/></>
              
              

            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}