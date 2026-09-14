import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { Button, ErrorBox, Field, Loading, SectionHeader, StatusBadge } from '../components';
import { C, S } from '../styles';

export default function AdminDashboardScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', mobile_number: '', specialization: '',
  });

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [a, d, s] = await Promise.all([
        api.admin.listAppointments(),
        api.admin.listDoctors(),
        api.admin.stats(),
      ]);
      setAppointments(a.appointments || []);
      setDoctors(d.doctors || []);
      setStats(s);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        Alert.alert('Access denied', 'Admin access is required.');
        navigation.replace('Home');
      } else {
        setError(err.errors?.join(', ') || 'Failed to load admin data.');
      }
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => { load(); }, [load]);

  const addDoctor = async () => {
    setError('');
    try {
      await api.admin.addDoctor(form);
      setForm({ name: '', email: '', password: '', mobile_number: '', specialization: '' });
      setShowAdd(false);
      load();
    } catch (err) {
      setError(err.errors?.join(', ') || 'Failed to add doctor.');
    }
  };

  const removeDoctor = (id, name) => {
    Alert.alert('Remove doctor', `Remove ${name}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await api.admin.removeDoctor(id); load(); }
        catch (err) { setError(err.errors?.join(', ') || 'Failed to remove doctor.'); }
      }},
    ]);
  };

  const startEdit = (doc) => {
    setEditId(doc.id || doc._id);
    setEditForm({
      name: doc.name || '',
      email: doc.email || '',
      mobile_number: doc.mobile_number || '',
      specialization: doc.specialization || '',
      hospital: doc.hospital || '',
      experience: String(doc.experience || ''),
      fee: String(doc.fee || ''),
    });
  };

  const saveEdit = async () => {
    try {
      await api.admin.updateDoctor(editId, editForm);
      setEditId(null);
      setEditForm({});
      load();
    } catch (err) {
      setError(err.errors?.join(', ') || 'Failed to update doctor.');
    }
  };

  const today = stats?.todayCount ?? stats?.daily?.[0]?.count ?? 0;
  const week = stats?.thisWeekCount ?? stats?.weekly?.[0]?.count ?? 0;
  const month = stats?.thisMonthCount ?? stats?.monthly?.[0]?.count ?? 0;
  const year = stats?.thisYearCount ?? stats?.yearly?.[0]?.count ?? 0;

  if (loading) return <Loading text="Loading admin dashboard..." />;

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={S.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <Text style={S.title}>Admin Dashboard</Text>
      <Text style={S.subtitle}>Manage doctors and track appointment activity.</Text>

      <ErrorBox errors={error ? [error] : []} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
        {[
          ['Doctors', stats?.doctorCount ?? doctors.length],
          ['Today', today],
          ['This Week', week],
          ['This Month', month],
          ['This Year', year],
        ].map(([label, value]) => (
          <View key={label} style={[S.card, { width: '48%', padding: 14 }]}>
            <Text style={{ color: C.slate500, fontSize: 12, fontWeight: '700' }}>{label}</Text>
            <Text style={{ fontSize: 25, fontWeight: '900', color: C.slate900, marginTop: 4 }}>{value}</Text>
          </View>
        ))}
      </View>

      {stats ? (
        <View style={{ marginTop: 22 }}>
          <SectionHeader title="Booking Breakdown" />
          <Breakdown title="Last 30 days" rows={stats.daily} formatter={(r) => r._id} />
          <Breakdown title="Last 12 weeks" rows={stats.weekly} formatter={(r) => `${r._id?.year} · W${r._id?.week}`} />
          <Breakdown title="Last 12 months" rows={stats.monthly} formatter={(r) => r._id} />
          <Breakdown title="Last 12 years" rows={stats.yearly} formatter={(r) => r._id} />
        </View>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <Button title={showAdd ? 'Close Add Doctor' : '+ Add Doctor'} onPress={() => setShowAdd((v) => !v)} />
      </View>

      {showAdd && (
        <View style={[S.card, { marginTop: 14 }]}>
          <Text style={S.sectionTitle}>Add a doctor</Text>
          <View style={{ marginTop: 14 }}>
            <Field label="Full name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <Field label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
            <Field label="Mobile number" value={form.mobile_number} onChangeText={(v) => setForm({ ...form, mobile_number: v })} keyboardType="phone-pad" />
            <Field label="Specialization" value={form.specialization} onChangeText={(v) => setForm({ ...form, specialization: v })} />
            <Button title="Add doctor" onPress={addDoctor} disabled={!form.name || !form.email || !form.password || !form.mobile_number} />
          </View>
        </View>
      )}

      <View style={{ marginTop: 25 }}>
        <SectionHeader title="Doctors" right={<Text style={S.muted}>{doctors.length} total</Text>} />
        {doctors.map((doc) => {
          const id = doc.id || doc._id;
          if (editId === id) {
            return (
              <View key={id} style={[S.card, { marginBottom: 12, backgroundColor: '#f0fdfa' }]}>
                <Field value={editForm.name} onChangeText={(v) => setEditForm({ ...editForm, name: v })} placeholder="Name" />
                <Field value={editForm.email} onChangeText={(v) => setEditForm({ ...editForm, email: v })} placeholder="Email" />
                <Field value={editForm.mobile_number} onChangeText={(v) => setEditForm({ ...editForm, mobile_number: v })} placeholder="Mobile" />
                <Field value={editForm.specialization} onChangeText={(v) => setEditForm({ ...editForm, specialization: v })} placeholder="Specialization" />
                <Field value={editForm.hospital} onChangeText={(v) => setEditForm({ ...editForm, hospital: v })} placeholder="Hospital" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}><Field value={editForm.experience} onChangeText={(v) => setEditForm({ ...editForm, experience: v })} placeholder="Exp (yrs)" keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><Field value={editForm.fee} onChangeText={(v) => setEditForm({ ...editForm, fee: v })} placeholder="Fee (₹)" keyboardType="numeric" /></View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button title="Save" onPress={saveEdit} style={{ flex: 1 }} />
                  <Button title="Cancel" variant="outline" onPress={() => { setEditId(null); setEditForm({}); }} style={{ flex: 1 }} />
                </View>
              </View>
            );
          }

          return (
            <View key={id} style={[S.card, { marginBottom: 12 }]}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: C.slate900 }}>{doc.name}</Text>
              <Text style={{ color: C.blue, marginTop: 3, fontWeight: '700' }}>{doc.specialization || 'No specialization set'}</Text>
              <Text style={{ color: C.slate500, marginTop: 3 }}>{doc.hospital || 'No hospital set'}</Text>
              <Text style={{ color: C.slate500, marginTop: 5 }}>{doc.email}</Text>
              <Text style={{ color: C.slate500, marginTop: 2 }}>{doc.mobile_number}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button title="Edit" variant="outline" onPress={() => startEdit(doc)} style={{ flex: 1 }} />
                <Button title="Remove" variant="outline" onPress={() => removeDoctor(id, doc.name)} style={{ flex: 1, borderColor: '#fecaca' }} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 12 }}>
        <SectionHeader title="All Appointments" right={<Text style={S.muted}>{appointments.length} total</Text>} />
        {appointments.map((a) => (
          <View key={a.id || a._id} style={[S.card, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.slate900 }}>{a.patient_name}</Text>
                <Text style={{ color: C.slate500, marginTop: 3 }}>📱 {a.mobile_number}</Text>
              </View>
              <StatusBadge status={a.status} />
            </View>
            <Text style={{ color: C.slate700, fontWeight: '700', marginTop: 10 }}>Dr. {a.doctor_name}</Text>
            <Text style={{ color: C.slate500, marginTop: 4 }}>📅 {a.appointment_date} · {a.appointment_time}</Text>
            {a.reason ? <Text style={{ color: C.slate500, marginTop: 4 }}>Reason: {a.reason}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Breakdown({ title, rows = [], formatter }) {
  return (
    <View style={[S.card, { marginBottom: 10 }]}>
      <Text style={{ fontWeight: '800', color: C.slate700 }}>{title}</Text>
      {!rows.length ? <Text style={{ color: C.slate400, marginTop: 10 }}>No bookings yet</Text> : rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: C.slate100, paddingVertical: 9 }}>
          <Text style={{ color: C.slate500 }}>{formatter(r)}</Text>
          <Text style={{ color: C.slate800, fontWeight: '800' }}>{r.count}</Text>
        </View>
      ))}
    </View>
  );
}
