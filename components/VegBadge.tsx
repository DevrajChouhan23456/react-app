/**
 * VegBadge
 * Ported from: vinothvino42/SwiggyUI → veg_badge_view.dart
 *
 * Original Flutter pattern:
 *   Container(
 *     height:20, width:20,
 *     decoration: BoxDecoration(border: Border.all(color:Colors.green)),
 *     child: Center(child: Container(
 *       height:10, width:10,
 *       decoration: BoxDecoration(color:Colors.green, shape:BoxShape.circle)
 *     ))
 *   )
 *
 * Shows green square with inner green circle (veg)
 * or red square with inner red circle (non-veg).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  isVeg?: boolean;
  size?: number;
}

export default function VegBadge({ isVeg = true, size = 20 }: Props) {
  const color = isVeg ? '#2ECC71' : '#E53935';
  return (
    <View style={[
      styles.outer,
      { width: size, height: size, borderColor: color },
    ]}>
      <View style={[
        styles.inner,
        {
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: (size * 0.5) / 2,
          backgroundColor: color,
        },
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inner: {},
});
