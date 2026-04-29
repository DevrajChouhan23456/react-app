import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  title: string;
  onSeeAll?: () => void;
  rightNode?: React.ReactNode;
}

export default function SectionHeader({ title, onSeeAll, rightNode }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightNode}
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAll} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text || '#1C1008', letterSpacing: -0.3 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
