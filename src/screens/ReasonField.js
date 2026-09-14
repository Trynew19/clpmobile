import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { C, S } from '../styles';

export default function ReasonField({ value, onChange }) {
  const [symptoms, setSymptoms] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSuggestions = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.suggestReason(symptoms);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err.errors?.[0] || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        value={symptoms}
        onChangeText={setSymptoms}
        placeholder="Describe your symptoms..."
        placeholderTextColor={C.slate400}
        multiline
        numberOfLines={3}
        style={S.textarea}
      />
      <Pressable
        onPress={getSuggestions}
        disabled={loading || !symptoms.trim()}
        style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: C.slate100, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 10, opacity: loading || !symptoms.trim() ? 0.5 : 1 }}
      >
        {loading ? <ActivityIndicator size="small" color={C.slate700} /> : <Text style={{ fontWeight: '800', color: C.slate700 }}>Get Suggestions</Text>}
      </Pressable>

      {error ? <Text style={{ color: C.red, fontSize: 12, marginTop: 7 }}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
        {suggestions.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => onChange(s)}
            style={{ borderWidth: 1, borderColor: value === s ? C.blue : C.slate300, backgroundColor: value === s ? '#eff6ff' : C.white, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 }}
          >
            <Text style={{ color: value === s ? C.blue : C.slate700, fontSize: 12, fontWeight: '700' }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Select a suggestion or type your own"
        placeholderTextColor={C.slate400}
        style={[S.input, { marginTop: 8 }]}
      />
    </View>
  );
}
