import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../api';
import { Button, ErrorBox, Field } from '../components';
import { C, S } from '../styles';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('Patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrors([]);
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErrors(['Enter a valid 10-digit mobile number.']);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name, email, mobile_number: mobile, password, role,
        ...(role === 'Doctor' ? { specialization, hospital, experience, fee } : {}),
      };
      const data = await auth.register(payload);
      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user', JSON.stringify(data.user)],
      ]);
      navigation.replace(role === 'Doctor' ? 'DoctorDashboard' : 'Home');
    } catch (err) {
      setErrors(err.errors || ['Registration failed.']);
    } finally {
      setSubmitting(false);
    }
  };

  const RoleCard = ({ value, icon, title, text }) => (
    <Pressable
      onPress={() => setRole(value)}
      style={{
        flex: 1, minHeight: 135, borderRadius: 14, borderWidth: 2,
        borderColor: role === value ? '#d946ef' : C.slate200,
        backgroundColor: role === value ? '#fdf4ff' : C.white,
        alignItems: 'center', justifyContent: 'center', padding: 12,
      }}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', color: C.slate900, marginTop: 7 }}>{title}</Text>
      <Text style={{ fontSize: 11, color: C.slate500, textAlign: 'center', marginTop: 4 }}>{text}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={S.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={S.content} keyboardShouldPersistTaps="handled">
        <View style={[S.card, { borderColor: '#f5d0fe' }]}>
          <Text style={{ color: '#c026d3', fontWeight: '900', fontSize: 12 }}>👤 CREATE ACCOUNT</Text>
          <Text style={[S.title, { marginTop: 5, fontSize: 25 }]}>
            {role === 'Doctor' ? 'Create your Doctor account' : 'Create your Patient account'}
          </Text>
          <Text style={S.subtitle}>
            {role === 'Doctor' ? 'Join clp and start connecting with patients today' : 'Book appointments and track them in one place.'}
          </Text>

          <Text style={{ color: '#c026d3', fontWeight: '900', fontSize: 12, marginTop: 24, marginBottom: 10 }}>🎯 I WANT TO...</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <RoleCard value="Patient" icon="🧑" title="Patient" text="Find & book doctors" />
            <RoleCard value="Doctor" icon="🩺" title="Doctor" text="List my practice" />
          </View>

          <Text style={{ color: '#c026d3', fontWeight: '900', fontSize: 12, marginTop: 24, marginBottom: 10 }}>📋 PERSONAL INFO</Text>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" />
          <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
          <Field label="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} placeholder="10-digit number" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />

          {role === 'Doctor' && (
            <>
              <Text style={{ color: '#c026d3', fontWeight: '900', fontSize: 12, marginTop: 10, marginBottom: 10 }}>🏥 PRACTICE INFO</Text>
              <Field label="Specialization" value={specialization} onChangeText={setSpecialization} placeholder="e.g. General Physician" />
              <Field label="Hospital / Clinic" value={hospital} onChangeText={setHospital} placeholder="e.g. Manipal Hospital" />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Field label="Experience (yrs)" value={experience} onChangeText={setExperience} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><Field label="Consultation Fee (₹)" value={fee} onChangeText={setFee} keyboardType="numeric" /></View>
              </View>
            </>
          )}

          <ErrorBox errors={errors} />
          <Button title={submitting ? 'Creating account…' : 'Create Account'} onPress={handleSubmit} disabled={submitting || !name || !email || !mobile || !password} />

          <Text style={{ textAlign: 'center', marginTop: 20, color: C.slate500 }}>
            Already have an account?{' '}
            <Text style={{ color: '#c026d3', fontWeight: '800' }} onPress={() => navigation.navigate('Login')}>Log in</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
