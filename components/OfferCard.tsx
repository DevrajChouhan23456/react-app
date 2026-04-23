import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

interface OfferCardProps {
  offer: { id: string; title: string; subtitle: string; code: string; color: string };
  onApply?: () => void;
}

export default function OfferCard({ offer, onApply }: OfferCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: offer.color }]}>
      <View style={[styles.iconBox, { backgroundColor: offer.color + '22' }]}>
        <Ionicons name="pricetag" size={22} color={offer.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{offer.title}</Text>
        <Text style={styles.subtitle}>{offer.subtitle}</Text>
        <Text style={[styles.code, { color: offer.color }]}>Use: {offer.code}</Text>
      </View>
      {onApply && (
        <TouchableOpacity onPress={onApply}>
          <Text style={[styles.apply, { color: offer.color }]}>APPLY</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  iconBox: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  code: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  apply: { fontSize: 13, fontWeight: '800' },
});
