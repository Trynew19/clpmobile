import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { Button, Loading, SectionHeader, StatusBadge } from '../components';
import { C, S } from '../styles';

export default function MyAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('All');
  const [isDoctor, setIsDoctor] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setLoading(false);
      navigation.replace('Login', { from: 'MyAppointments' });
      return;
    }

    try {
      const raw = await api.appointments.list();
      setAppointments(raw || []);
      const userRaw = await AsyncStorage.getItem('user');
      setIsDoctor(userRaw ? JSON.parse(userRaw)?.role === 'Doctor' : false);
    } catch (err) {
      if (err.status === 401) {
        await AsyncStorage.removeItem('token');
        navigation.replace('Login', { from: 'MyAppointments' });
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => tab === 'All' ? appointments : appointments.filter((a) => a.status === tab),
    [appointments, tab]
  );

  const updateStatus = async (id, status) => {
    try {
      const { appointment } = await api.appointments.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === appointment.id ? appointment : a));
    } catch (err) {
      Alert.alert('Error', err.errors?.join(' ') || 'Action failed.');
    }
  };

  const deleteAppointment = (id) => {
    Alert.alert('Delete appointment', 'Delete this appointment permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.appointments.remove(id);
          setAppointments((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
          Alert.alert('Error', err.errors?.join(' ') || 'Delete failed.');
        }
      }},
    ]);
  };

  if (loading) return <Loading text="Loading appointments..." />;

  const tabs = [['All', 'All'], ['Pending', 'Scheduled'], ['Completed', 'Completed'], ['Cancelled', 'Cancelled']];

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={S.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <Text style={S.title}>My Appointments</Text>
      <Text style={S.subtitle}>View and manage your appointments.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18, marginBottom: 14 }}>
        {tabs.map(([key, label]) => (
          <Button
            key={key}
            title={label}
            variant={tab === key ? 'primary' : 'outline'}
            onPress={() => setTab(key)}
            style={{ minHeight: 40, marginRight: 8, paddingHorizontal: 13 }}
          />
        ))}
      </ScrollView>

      {!filtered.length ? (
        <View style={[S.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <Text style={{ color: C.slate500 }}>No appointments in this category.</Text>
        </View>
      ) : filtered.map((appt) => (
        <View key={appt.id || appt._id} style={[S.card, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: C.slate900 }}>{appt.patient_name}</Text>
              <Text style={{ color: C.slate500, marginTop: 3 }}>{appt.doctor_name}</Text>
            </View>
            <StatusBadge status={appt.status} />
          </View>

          <View style={{ backgroundColor: C.slate50, borderRadius: 10, padding: 12, marginTop: 13 }}>
            <Text style={{ color: C.slate700, fontWeight: '700' }}>📅 {appt.appointment_date}</Text>
            <Text style={{ color: C.slate700, fontWeight: '700', marginTop: 6 }}>🕐 {appt.appointment_time}</Text>
            <Text style={{ color: C.slate500, marginTop: 6 }}>📱 {appt.mobile_number}</Text>
            {appt.reason ? <Text style={{ color: C.slate500, marginTop: 6 }}>Reason: {appt.reason}</Text> : null}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 }}>
            {isDoctor && appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
              <Button title="Complete" onPress={() => updateStatus(appt.id, 'Completed')} style={{ minHeight: 40, backgroundColor: C.green }} />
            )}
            {!isDoctor && appt.status === 'Pending' && (
              <Button title="Cancel" onPress={() => updateStatus(appt.id, 'Cancelled')} style={{ minHeight: 40, backgroundColor: C.amber }} />
            )}
            <Button title="Delete" onPress={() => deleteAppointment(appt.id)} variant="outline" style={{ minHeight: 40, borderColor: '#fecaca' }} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
