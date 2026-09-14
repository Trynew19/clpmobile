import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { api } from '../api';
import { C, S } from '../styles';
import DoctorCard from './DoctorCard';

export default function FindDoctorsScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('All');

  useEffect(() => {
    api.doctors.list()
      .then(setDoctors)
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false));
  }, []);

  const specializations = useMemo(
    () => ['All', ...new Set(doctors.map((d) => d.specialization).filter(Boolean))],
    [doctors]
  );

  const filtered = doctors.filter((d) => {
    const q = query.toLowerCase();
    return (
      ((d.name || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q)) &&
      (specialization === 'All' || d.specialization === specialization)
    );
  });

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.content}>
      <Text style={S.title}>Find a Doctor</Text>
      <Text style={S.subtitle}>Browse doctors and book an appointment in a few clicks.</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or specialization…"
        placeholderTextColor={C.slate400}
        style={[S.input, { marginTop: 20 }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 14 }}>
        {specializations.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSpecialization(s)}
            style={{
              backgroundColor: specialization === s ? C.slate900 : C.white,
              borderWidth: 1,
              borderColor: specialization === s ? C.slate900 : C.slate200,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 9,
              marginRight: 8,
            }}
          >
            <Text style={{ color: specialization === s ? C.white : C.slate700, fontWeight: '700', fontSize: 13 }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color={C.blue} /></View>
      ) : error ? (
        <Text style={{ color: C.red, textAlign: 'center', marginTop: 30 }}>{error}</Text>
      ) : (
        <>
          <Text style={S.muted}>{filtered.length} doctors found</Text>
          <View style={{ marginTop: 12 }}>
            {filtered.map((doc) => (
              <DoctorCard key={doc.id || doc._id} doctor={doc} navigation={navigation} />
            ))}
          </View>
          {!filtered.length && <Text style={{ textAlign: 'center', color: C.slate500, marginTop: 40 }}>No doctors match your search.</Text>}
        </>
      )}
    </ScrollView>
  );
}
