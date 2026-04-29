/**
 * SwiggyRequestNote
 * Ported from: vinothvino42/SwiggyUI → cart_screen.dart → _OrderView
 *
 * Original Flutter pattern:
 *   Row([
 *     Icon(Icons.library_books, color:Colors.grey[700]),
 *     Expanded(Text('Any restaurant request? We will try our best...'))
 *   ])
 *
 * Collapsible special instructions row for CartScreen.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SWIGGY_COLORS, SWIGGY_SPACING, SWIGGY_RADIUS } from '@/constants/swiggyTokens';

export default function SwiggyRequestNote() {
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons name="document-text-outline" size={20} color="#555" />
        <Text style={styles.label}>
          Any special request? We will try our best to convey it
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={SWIGGY_COLORS.textMuted}
        />
      </TouchableOpacity>

      {isOpen && (
        <TextInput
          style={styles.input}
          placeholder="e.g. Extra ghee, less spice, no onion..."
          placeholderTextColor={SWIGGY_COLORS.textFaint}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SWIGGY_SPACING.base,
    backgroundColor: '#fff',
    borderRadius: SWIGGY_RADIUS.lg,
    marginBottom: SWIGGY_SPACING.md,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SWIGGY_SPACING.base,
    gap: SWIGGY_SPACING.sm,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: SWIGGY_COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
  input: {
    paddingHorizontal: SWIGGY_SPACING.base,
    paddingBottom: SWIGGY_SPACING.base,
    fontSize: 14,
    color: SWIGGY_COLORS.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
