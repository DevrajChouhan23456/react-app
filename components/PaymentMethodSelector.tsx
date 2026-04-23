import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

export type PaymentMethod = 'cod' | 'online';

interface Props {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  total: number;
}

const METHODS = [
  {
    key: 'cod' as PaymentMethod,
    icon: 'cash-outline',
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    badge: null,
  },
  {
    key: 'online' as PaymentMethod,
    icon: 'card-outline',
    title: 'Pay Online',
    subtitle: 'UPI, Cards, Net Banking via Razorpay',
    badge: '5% cashback',
  },
];

export default function PaymentMethodSelector({ selected, onChange, total }: Props) {
  return (
    <View style={styles.container}>
      {METHODS.map((method) => {
        const isActive = selected === method.key;
        return (
          <TouchableOpacity
            key={method.key}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(method.key)}
            activeOpacity={0.8}
          >
            {/* Icon */}
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Ionicons
                name={method.icon as any}
                size={22}
                color={isActive ? COLORS.white : COLORS.primary}
              />
            </View>

            {/* Text */}
            <View style={styles.textBox}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, isActive && styles.titleActive]}>
                  {method.title}
                </Text>
                {method.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{method.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{method.subtitle}</Text>
              {isActive && method.key === 'online' && (
                <View style={styles.upiRow}>
                  {['UPI', 'Visa', 'MC', 'RuPay'].map((p) => (
                    <View key={p} style={styles.upiChip}>
                      <Text style={styles.upiText}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Radio */}
            <View style={[styles.radio, isActive && styles.radioActive]}>
              {isActive && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Secure badge */}
      <View style={styles.secureBadge}>
        <Ionicons name="lock-closed" size={12} color={COLORS.success} />
        <Text style={styles.secureText}>100% Secure Payments powered by Razorpay</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  optionActive: { borderColor: COLORS.primary, backgroundColor: '#FFF8F3' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: COLORS.primary },
  textBox: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  titleActive: { color: COLORS.text },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  subtitle: { fontSize: 12, color: COLORS.textMuted },
  upiRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm },
  upiChip: {
    backgroundColor: COLORS.surfaceOffset,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upiText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.sm,
  },
  secureText: { fontSize: 11, color: COLORS.textMuted },
});
