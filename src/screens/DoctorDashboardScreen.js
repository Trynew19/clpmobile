import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { api } from '../api';
import { Button, Loading, StatusBadge } from '../components';
import { C, S } from '../styles';

export default function DoctorDashboardScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await api.appointments.list();
        setAppointments(data || []);
      } catch (err) {
        if (err.status === 401) {
          navigation.replace('Login');
        } else {
          Alert.alert(
            'Error',
            err.errors?.join(' ') ||
            'Failed to load appointments.'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigation]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Complete appointment
  const complete = async (id) => {
    try {
      const { appointment } =
        await api.appointments.updateStatus(
          id,
          'Completed'
        );

      setAppointments((prev) =>
        prev.map((a) =>
          (a.id || a._id) ===
            (appointment.id || appointment._id)
            ? appointment
            : a
        )
      );

      Alert.alert(
        'Success',
        'Appointment marked as completed.'
      );
    } catch (err) {
      if (err.status === 401) {
        navigation.replace('Login');
      } else {
        Alert.alert(
          'Error',
          err.errors?.join(' ') ||
          'Failed to update appointment.'
        );
      }
    }
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.appointments.remove(id);

              // Remove appointment from current list
              setAppointments((prev) =>
                prev.filter(
                  (a) => (a.id || a._id) !== id
                )
              );

              Alert.alert(
                'Deleted',
                'Appointment deleted successfully.'
              );
            } catch (err) {
              if (err.status === 401) {
                navigation.replace('Login');
              } else {
                Alert.alert(
                  'Error',
                  err.errors?.join(' ') ||
                  'Failed to delete appointment.'
                );
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Loading text="Loading your appointments..." />
    );
  }

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={S.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
        />
      }
    >
      {/* Header */}
      <Text style={S.title}>Doctor Dashboard</Text>

      <Text style={S.subtitle}>
        Manage your patient appointments.
      </Text>

      {/* Total Appointments */}
      <View
        style={{
          backgroundColor: '#eff6ff',
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color: C.blue,
            fontWeight: '900',
            fontSize: 13,
          }}
        >
          TOTAL APPOINTMENTS
        </Text>

        <Text
          style={{
            fontSize: 32,
            fontWeight: '900',
            color: C.slate900,
            marginTop: 4,
          }}
        >
          {appointments.length}
        </Text>
      </View>

      {/* No appointments */}
      {!appointments.length ? (
        <View style={S.card}>
          <Text
            style={{
              color: C.slate500,
              textAlign: 'center',
            }}
          >
            No appointments yet.
          </Text>
        </View>
      ) : (
        appointments.map((a) => {
          const appointmentId = a.id || a._id;

          return (
            <View
              key={appointmentId}
              style={[
                S.card,
                {
                  marginBottom: 12,
                },
              ]}
            >
              {/* Patient + Status */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    paddingRight: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '900',
                      color: C.slate900,
                    }}
                  >
                    {a.patient_name}
                  </Text>

                  <Text
                    style={{
                      color: C.slate500,
                      marginTop: 4,
                    }}
                  >
                    📱 {a.mobile_number}
                  </Text>
                </View>

                <StatusBadge status={a.status} />
              </View>

              {/* Date + Time */}
              <Text
                style={{
                  marginTop: 13,
                  color: C.slate700,
                  fontWeight: '700',
                }}
              >
                📅 {a.appointment_date} ·{' '}
                {a.appointment_time}
              </Text>

              {/* Reason */}
              {a.reason ? (
                <Text
                  style={{
                    color: C.slate500,
                    marginTop: 6,
                  }}
                >
                  Reason: {a.reason}
                </Text>
              ) : null}

              {/* Actions */}
              <View style={{ marginTop: 14 }}>
                {/* Pending → Complete */}
                {a.status === 'Pending' && (
                  <Button
                    title="Complete"
                    onPress={() =>
                      complete(appointmentId)
                    }
                    style={{
                      backgroundColor: C.green,
                    }}
                  />
                )}

                {/* Delete → All statuses */}
                <Button
                  title="Delete"
                  variant="outline"
                  onPress={() =>
                    deleteAppointment(appointmentId)
                  }
                  style={{
                    marginTop:
                      a.status === 'Pending' ? 10 : 0,
                    backgroundColor: C.redBg,
                    borderColor: '#fecaca',
                  }}
                />
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}