import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RADIUS } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function Badge({ label, color = '#FF6B00', bg, style, size = 'md' }: BadgeProps) {
  const bgColor = bg ?? color + '18';
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.sm, style]}>
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  sm: { paddingHorizontal: 7, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  textSm: { fontSize: 10, fontWeight: '700' },
});
