import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { Button, Loading, SectionHeader } from '../components';
import DoctorCard from './DoctorCard';

export default function HomeScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([
      api.doctors
        .list()
        .then(setDoctors)
        .catch(() => setDoctors([])),

      AsyncStorage.getItem('user').then((raw) =>
        setUser(raw ? JSON.parse(raw) : null)
      ),
    ]).finally(() => setLoading(false));
  }, []);

  const openAppointments = () => {
    if (!user) {
      navigation.navigate('Login', {
        from: 'MyAppointments',
      });
    } else {
      navigation.navigate('MyAppointments');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <View
        style={{
          padding: 20,
          paddingTop: 30,
        }}
      >
        {/* Hero Section */}
        <View
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: 22,
            padding: 24,
          }}
        >
          <Text
            style={{
              color: '#1d4ed8',
              fontWeight: '800',
              fontSize: 12,
            }}
          >
            TRUSTED BY PATIENTS
          </Text>

          <Text
            style={{
              color: '#0f172a',
              fontWeight: '900',
              fontSize: 32,
              lineHeight: 38,
              marginTop: 10,
            }}
          >
            Book your appointment, in under a minute
          </Text>

          <Text
            style={{
              color: '#64748b',
              fontSize: 15,
              lineHeight: 22,
              marginTop: 12,
            }}
          >
            Find the right doctor, pick a time that works for you,
            and confirm instantly.
          </Text>

          <View style={{ marginTop: 20 }}>
            {/* Find Doctor */}
            <Button
              title="Find a Doctor"
              onPress={() =>
                navigation.navigate('FindDoctors')
              }
            />

            {/* My Appointments */}
            <Button
              title="View My Appointments"
              variant="outline"
              onPress={openAppointments}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>

        {/* Popular Doctors */}
        <View style={{ marginTop: 30 }}>
          <SectionHeader
            title="Popular Doctors"
            right={
              <Text
                onPress={() =>
                  navigation.navigate('FindDoctors')
                }
                style={{
                  color: '#2563eb',
                  fontWeight: '700',
                }}
              >
                See all →
              </Text>
            }
          />

          {loading ? (
            <Loading text="Loading doctors..." />
          ) : doctors.length ? (
            doctors
              .slice(0, 3)
              .map((doctor) => (
                <DoctorCard
                  key={doctor.id || doctor._id}
                  doctor={doctor}
                  navigation={navigation}
                />
              ))
          ) : (
            <Text
              style={{
                color: '#64748b',
              }}
            >
              No doctors available.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}