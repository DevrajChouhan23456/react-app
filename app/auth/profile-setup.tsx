import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { updateProfile, loading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isValid = name.trim().length >= 2;

  const handleContinue = async () => {
    if (!isValid) return;
    clearError();
    await updateProfile(name.trim(), email.trim() || undefined);
    const { error: err } = useAuthStore.getState();
    if (!err) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 40 }}>👤</Text>
            </View>
            <Text style={styles.heading}>Set up your profile</Text>
            <Text style={styles.subheading}>Tell us your name so we can personalise your experience</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            {/* Name */}
            <Text style={styles.label}>Your Name *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={(t) => { clearError(); setName(t); }}
                autoFocus
                returnKeyType="next"
              />
            </View>

            {/* Email (optional) */}
            <Text style={styles.label}>Email <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, (!isValid || loading) && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!isValid || loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : (
                  <>
                    <Text style={styles.btnText}>Start Ordering 🍲</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.footnote}>
            Your info is only used to personalise your orders. We never share it.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: SPACING.base, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.secondary, alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.md, ...SHADOW.sm,
  },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  subheading: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOW.md, marginBottom: SPACING.lg },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { fontSize: 12, fontWeight: '400', color: COLORS.textMuted, textTransform: 'none' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.lg,
    backgroundColor: COLORS.bg,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: SPACING.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', padding: SPACING.sm,
    borderRadius: RADIUS.md, marginBottom: SPACING.base,
  },
  errorText: { fontSize: 13, color: COLORS.error },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: SPACING.sm,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  footnote: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
