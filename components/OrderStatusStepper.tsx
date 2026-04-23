import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ORDER_STATUSES } from '@/constants/data';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

interface Props {
  currentStatus: string;
}

export default function OrderStatusStepper({ currentStatus }: Props) {
  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <View style={styles.container}>
      {ORDER_STATUSES.map((step, index) => {
        const isDone = index <= currentIndex;
        const isActive = index === currentIndex;
        return (
          <View key={step.key} style={styles.step}>
            <View style={styles.left}>
              <View style={[styles.circle, isDone && styles.circleDone, isActive && styles.circleActive]}>
                <Ionicons
                  name={isDone ? 'checkmark' : (step.icon as any)}
                  size={16}
                  color={isDone ? COLORS.white : COLORS.textFaint}
                />
              </View>
              {index < ORDER_STATUSES.length - 1 && (
                <View style={[styles.line, isDone && styles.lineDone]} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, isDone && styles.labelDone]}>{step.label}</Text>
              {isActive && <Text style={styles.desc}>{step.description}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm },
  step: { flexDirection: 'row', marginBottom: SPACING.xs },
  left: { alignItems: 'center', marginRight: SPACING.md },
  circle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceOffset,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  circleDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  circleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  line: { width: 2, height: 32, backgroundColor: COLORS.border, marginTop: 2 },
  lineDone: { backgroundColor: COLORS.success },
  content: { flex: 1, paddingTop: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  labelDone: { color: COLORS.text },
  desc: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
});
