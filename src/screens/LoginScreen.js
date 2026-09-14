import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../api';
import { Button, ErrorBox, Field } from '../components';
import { C, S } from '../styles';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrors([]);
    setSubmitting(true);

    try {
      const data = await auth.login({
        email,
        password,
      });

      // Save login information
      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user', JSON.stringify(data.user)],
      ]);

      // ==========================================
      // REDIRECT AFTER LOGIN
      // ==========================================

      // User came from My Appointments
      if (route.params?.from === 'MyAppointments') {
        navigation.replace('MyAppointments');

        // User came from Doctor Profile
      } else if (route.params?.from === 'DoctorProfile') {
        navigation.replace('DoctorProfile', {
          id: route.params.doctorId,
        });

        // User came from Find Doctors
      } else if (route.params?.from === 'FindDoctors') {
        navigation.replace('FindDoctors');

        // Admin login
      } else if (data.user.role === 'Admin') {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'AdminDashboard' },
          ],
        });

        // Doctor login
      } else if (data.user.role === 'Doctor') {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'DoctorDashboard' },
          ],
        });

        // Normal Patient login
      } else {
        navigation.replace('Home');
      }

    } catch (err) {
      setErrors(
        err.errors || ['Login failed.']
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={S.card}>

          {/* Title */}
          <Text style={S.title}>
            Welcome back
          </Text>

          <Text style={S.subtitle}>
            Log in to view and manage your appointments.
          </Text>

          <View style={{ marginTop: 24 }}>

            {/* Email */}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />

            {/* Password */}
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Your password"
            />

            {/* Errors */}
            <ErrorBox errors={errors} />

            {/* Login Button */}
            <Button
              title={
                submitting
                  ? 'Logging in…'
                  : 'Log In'
              }
              onPress={handleSubmit}
              disabled={
                submitting ||
                !email ||
                !password
              }
            />

          </View>

          {/* Register */}
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: C.slate500,
            }}
          >
            Don't have an account?{' '}

            <Text
              style={{
                color: C.blue,
                fontWeight: '800',
              }}
              onPress={() =>
                navigation.navigate('Register')
              }
            >
              Register
            </Text>
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}