import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { C, S } from './styles';

export function Loading({ text = 'Loading...' }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <ActivityIndicator size="large" color={C.blue} />
      <Text style={{ marginTop: 12, color: C.slate500 }}>{text}</Text>
    </View>
  );
}

export function Button({ title, onPress, disabled, variant = 'primary', style }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        primary ? S.button : S.outlineButton,
        primary ? { backgroundColor: C.blue } : null,
        pressed ? { opacity: 0.75 } : null,
        disabled ? { opacity: 0.45 } : null,
        style,
      ]}
    >
      <Text style={primary ? S.buttonText : S.outlineText}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={S.label}>{label}</Text> : null}
      <TextInput {...props} style={[S.input, style]} placeholderTextColor={C.slate400} />
    </View>
  );
}

export function ErrorBox({ errors }) {
  if (!errors?.length) return null;
  return (
    <View style={{ backgroundColor: C.redBg, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      {errors.map((e, i) => (
        <Text key={i} style={{ color: C.red, fontSize: 13, marginBottom: i < errors.length - 1 ? 4 : 0 }}>
          {e}
        </Text>
      ))}
    </View>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: ['Scheduled', '#dbeafe', '#1d4ed8'],
    Completed: ['Completed', '#d1fae5', '#047857'],
    Cancelled: ['Cancelled', '#fee2e2', '#b91c1c'],
  };
  const [label, bg, color] = map[status] || [status, C.slate100, C.slate700];

  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={S.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}
