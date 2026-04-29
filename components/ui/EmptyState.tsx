import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

interface Props {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji, title, description, actionLabel, onAction }: Props) {
  const bounce = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -14, duration: 800, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]}>
      <Animated.Text style={[styles.emoji, { transform: [{ translateY: bounce }] }]}>{emoji}</Animated.Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.88}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emoji: { fontSize: 72, marginBottom: SPACING.xl },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center', letterSpacing: -0.4 },
  desc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl, maxWidth: 260 },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md + 2, borderRadius: RADIUS.full, ...SHADOW.md },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
});
