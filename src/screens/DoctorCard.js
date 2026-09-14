import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, S } from '../styles';

export default function DoctorCard({ doctor, navigation }) {
  const initials =
    doctor.initials ||
    (doctor.name || 'D')
      .replace(/^Dr\.?\s*/i, '')
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <Pressable
      onPress={() => navigation.navigate('DoctorProfile', { id: doctor.id || doctor._id })}
      style={({ pressed }) => [S.card, { marginBottom: 14 }, pressed ? { opacity: 0.85 } : null]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 19, fontWeight: '900', color: C.blue }}>{initials}</Text>
        </View>
        <View style={{ backgroundColor: C.greenBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, height: 30 }}>
          <Text style={{ color: C.green, fontSize: 12, fontWeight: '800' }}>● Available</Text>
        </View>
      </View>

      <Text style={{ marginTop: 14, fontSize: 17, fontWeight: '800', color: C.slate900 }}>{doctor.name}</Text>
      <Text style={{ marginTop: 3, color: C.blue, fontWeight: '700' }}>{doctor.specialization || 'Doctor'}</Text>
      <Text style={{ marginTop: 5, color: C.slate500 }}>{doctor.hospital || 'Clinic'}</Text>
      {doctor.location ? <Text style={{ marginTop: 2, color: C.slate400, fontSize: 13 }}>{doctor.location}</Text> : null}

      <View style={{ borderTopWidth: 1, borderTopColor: C.slate100, marginTop: 14, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: C.slate700 }}>{doctor.experience || 0} yrs exp.</Text>
        <Text style={{ color: C.slate700 }}>{doctor.rating ? `★ ${doctor.rating}` : 'New'}</Text>
        <Text style={{ fontWeight: '800', color: C.slate900 }}>₹{doctor.fee || 0}</Text>
      </View>
    </Pressable>
  );
}
