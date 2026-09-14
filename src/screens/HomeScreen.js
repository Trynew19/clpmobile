import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FindDoctorsScreen from './src/screens/FindDoctorsScreen';
import DoctorProfileScreen from './src/screens/DoctorProfileScreen';
import MyAppointmentsScreen from './src/screens/MyAppointmentsScreen';
import DoctorDashboardScreen from './src/screens/DoctorDashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  // Load logged-in user when app starts
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem('user');

      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Failed to load user:', error);
      setUser(null);
    } finally {
      setReady(true);
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <NavigationContainer
      onStateChange={() => {
        // Refresh user after login/logout/navigation changes
        loadUser();
      }}
    >
      <StatusBar style="dark" />

      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTintColor: '#0f172a',

          headerTitleStyle: {
            fontWeight: '800',
          },

          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: '#ffffff',
          },

          contentStyle: {
            backgroundColor: '#f8fafc',
          },

          // Show profile icon for logged-in users
          headerRight:
            user &&
              !['Login', 'Register', 'Profile'].includes(route.name)
              ? () => (
                <Pressable
                  onPress={() => navigation.navigate('Profile')}
                  style={({ pressed }) => ({
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 21,
                    }}
                  >
                    👤
                  </Text>
                </Pressable>
              )
              : undefined,
        })}
      >
        {/* Home */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'CLP',
          }}
        />

        {/* Profile */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'My Profile',
          }}
        />

        {/* Doctors */}
        <Stack.Screen
          name="FindDoctors"
          component={FindDoctorsScreen}
          options={{
            title: 'Find Doctors',
          }}
        />

        <Stack.Screen
          name="DoctorProfile"
          component={DoctorProfileScreen}
          options={{
            title: 'Doctor Profile',
          }}
        />

        {/* Appointments */}
        <Stack.Screen
          name="MyAppointments"
          component={MyAppointmentsScreen}
          options={{
            title: 'My Appointments',
          }}
        />

        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Log In',
          }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Create Account',
          }}
        />

        {/* Doctor */}
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={{
            title: 'Doctor Dashboard',
          }}
        />

        {/* Admin */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}