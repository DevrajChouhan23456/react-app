/**
 * SwiggyDeliveryNote
 * Ported from: vinothvino42/SwiggyUI → cart_screen.dart → _AddressPaymentView
 *
 * Original Flutter pattern:
 *   Container(height:50, color:Colors.black,
 *     Row([
 *       Icon(Icons.phone, color:Colors.yellow[800]),
 *       Expanded(Text('Want your order left outside? Call delivery executive'))
 *     ])
 *   )
 *
 * Used in CartScreen above the checkout bar.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SWIGGY_SPACING, SWIGGY_RADIUS } from '@/constants/swiggyTokens';

interface Props {
  onCallPress?: () => void;
}

export default function SwiggyDeliveryNote({ onCallPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onCallPress}
      style={styles.container}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="call" size={18} color="#F9A825" />
      </View>
      <Text style={styles.text}>
        Want your order left outside? Call your delivery partner
      </Text>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: SWIGGY_RADIUS.lg,
    marginHorizontal: SWIGGY_SPACING.base,
    marginBottom: SWIGGY_SPACING.md,
    paddingHorizontal: SWIGGY_SPACING.base,
    paddingVertical: SWIGGY_SPACING.md,
    gap: SWIGGY_SPACING.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(249,168,37,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    lineHeight: 18,
  },
});
