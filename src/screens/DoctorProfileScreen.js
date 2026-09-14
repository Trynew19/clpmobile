import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { Button, ErrorBox, Field, Loading, StatusBadge } from '../components';
import ReasonField from './ReasonField';
import { C, S } from '../styles';

const toDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toTimeString = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function DoctorProfileScreen({ navigation, route }) {
  const { id } = route.params || {};
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('datetime');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    api.doctors.get(id)
      .then(setDoctor)
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));

    AsyncStorage.getItem('user').then((raw) => {
      if (raw) {
        const user = JSON.parse(raw);
        setPatientName(user.name || '');
        setMobile(user.mobile_number || '');
      }
    });
  }, [id]);

  const validateDateTime = () => {
    const e = [];
    if (!date) e.push('Please select a date.');
    if (!time) e.push('Please select a time.');
    if (date && date < toDateString(new Date())) e.push('Date cannot be in the past.');
    return e;
  };

  const continueBooking = async () => {
    try {
      // Check whether user is logged in
      const token = await AsyncStorage.getItem('token');
      const rawUser = await AsyncStorage.getItem('user');

      if (!token || !rawUser) {
        navigation.navigate('Login', {
          from: 'DoctorProfile',
          doctorId: id,
        });
        return;
      }

      const e = validateDateTime();

      if (e.length) {
        setErrors(e);
        return;
      }

      setErrors([]);

      // Load user details again
      const user = JSON.parse(rawUser);

      setPatientName(user.name || '');
      setMobile(user.mobile_number || '');

      setStep('details');
    } catch (error) {
      console.log('Login check failed:', error);

      navigation.navigate('Login', {
        from: 'DoctorProfile',
        doctorId: id,
      });
    }
  };

  const confirmBooking = async () => {
    const e = [];
    if (!patientName.trim()) e.push('Patient name is required.');
    if (!/^\d{10}$/.test(mobile.trim())) e.push('Enter a valid 10-digit mobile number.');
    if (e.length) return setErrors(e);

    setErrors([]);
    setSubmitError('');
    setSubmitting(true);

    try {
      await api.appointments.create({
        patient_name: patientName.trim(),
        mobile_number: mobile.trim(),
        doctor_name: doctor.name,
        appointment_date: date,
        appointment_time: time,
        reason,
      });
      setStep('success');
    } catch (err) {
      if (err.status === 401) {
        navigation.navigate('Login', { from: 'DoctorProfile', doctorId: id });
        return;
      }
      setSubmitError(err.errors?.join(' ') || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading doctor..." />;
  if (!doctor) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }}><Text style={S.title}>Doctor not found</Text></View>;
  }

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.content}>
      <View style={S.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 27, fontWeight: '900', color: C.blue }}>
              {doctor.initials || doctor.name?.replace(/^Dr\.?\s*/i, '').charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <StatusBadge status="Available" />
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.slate900, marginTop: 7 }}>{doctor.name}</Text>
            <Text style={{ color: C.blue, fontWeight: '700', marginTop: 2 }}>{doctor.specialization}</Text>
            <Text style={{ color: C.slate500, fontSize: 13, marginTop: 3 }}>{doctor.hospital}{doctor.location ? ` · ${doctor.location}` : ''}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.slate100, marginTop: 18, paddingTop: 18 }}>
          <Text style={{ color: C.slate700 }}>{doctor.experience || 0}+ yrs</Text>
          <Text style={{ color: C.slate700 }}>★ {doctor.rating || 'New'}</Text>
          <Text style={{ fontWeight: '800', color: C.slate900 }}>₹{doctor.fee || 0}</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: C.slate900, marginTop: 20 }}>About</Text>
        <Text style={{ color: C.slate600, lineHeight: 21, marginTop: 7 }}>{doctor.about || 'Professional medical consultation.'}</Text>
      </View>

      <View style={[S.card, { marginTop: 16 }]}>
        <Text style={S.sectionTitle}>Book Appointment</Text>
        <Text style={S.muted}>{doctor.name} · {doctor.hospital}</Text>

        {step === 'success' ? (
          <View style={{ alignItems: 'center', paddingVertical: 25 }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.greenBg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 28, color: C.green }}>✓</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', marginTop: 12, color: C.slate900 }}>Appointment booked!</Text>
            <Text style={{ color: C.slate500, marginTop: 5 }}>{date} at {time} with {doctor.name}</Text>
            <Button title="View My Appointments" onPress={() => navigation.replace('MyAppointments')} style={{ marginTop: 16, width: '100%' }} />
          </View>
        ) : (
          <>
            <Text style={[S.label, { marginTop: 20 }]}>Select Date</Text>
            <Button title={date || 'Choose date'} variant="outline" onPress={() => setShowDate(true)} />
            {showDate && (
              <DateTimePicker
                value={date ? new Date(`${date}T12:00:00`) : new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, selected) => {
                  setShowDate(false);
                  if (selected) setDate(toDateString(selected));
                }}
              />
            )}

            <Text style={[S.label, { marginTop: 15 }]}>Select Time</Text>
            <Button title={time || 'Choose time'} variant="outline" onPress={() => setShowTime(true)} />
            {showTime && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour
                onChange={(event, selected) => {
                  setShowTime(false);
                  if (selected) setTime(toTimeString(selected));
                }}
              />
            )}

            {step === 'datetime' ? (
              <Button title="Continue" onPress={continueBooking} style={{ marginTop: 18 }} />
            ) : null}

            {step === 'details' ? (
              <View style={{ borderTopWidth: 1, borderTopColor: C.slate100, marginTop: 18, paddingTop: 18 }}>
                <Field label="Patient Name" value={patientName} onChangeText={setPatientName} placeholder="e.g. Priya Sharma" />
                <Field label="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} placeholder="10-digit number" />
                <Text style={S.label}>Reason for Visit (optional)</Text>
                <ReasonField value={reason} onChange={setReason} />
                {submitError ? <Text style={{ color: C.red, marginTop: 8, fontSize: 12 }}>{submitError}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <Button title="Back" variant="outline" onPress={() => setStep('datetime')} style={{ flex: 1 }} />
                  <Button title={submitting ? 'Booking…' : 'Confirm Booking'} onPress={confirmBooking} disabled={submitting} style={{ flex: 1 }} />
                </View>
              </View>
            ) : null}

            <ErrorBox errors={errors} />
          </>
        )}
      </View>
    </ScrollView>
  );
}
