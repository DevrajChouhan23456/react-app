import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function PhoneScreen() {
  const router = useRouter();
  const { sendOtp, loading, error, clearError } = useAuthStore();
  const [phone, setPhone] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleSendOtp = async () => {
    if (!isValid) return;
    clearError();
    await sendOtp(phone.replace(/\D/g, ''));
    const { error: err } = useAuthStore.getState();
    if (!err) {
      router.push({ pathname: '/auth/otp', params: { phone: phone.replace(/\D/g, '') } });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo / Branding */}
          <View style={styles.brandBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍲</Text>
            </View>
            <Text style={styles.brandName}>Gau Stories</Text>
            <Text style={styles.brandTagline}>Dal Bafla • Bhopal</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Enter your mobile number</Text>
            <Text style={styles.subheading}>
              We'll send a 6-digit OTP to verify your number
            </Text>

            {/* Phone Input */}
            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
              </View>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => { clearError(); setPhone(t.replace(/\D/g, '')); }}
                autoFocus
              />
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.btn, (!isValid || loading) && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={!isValid || loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.btnText}>Send OTP</Text>
              }
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Trust badges */}
          <View style={styles.badges}>
            {['🔒 Secure', '⚡ Instant OTP', '🍽️ Fresh Food'].map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: SPACING.base, justifyContent: 'center' },
  brandBox: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.secondary, alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  logoEmoji: { fontSize: 40 },
  brandName: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  brandTagline: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.xl, ...SHADOW.md, marginBottom: SPACING.lg,
  },
  heading: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  subheading: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.lg, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    overflow: 'hidden', marginBottom: SPACING.base,
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceOffset, borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  flag: { fontSize: 18 },
  code: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  input: {
    flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    letterSpacing: 2,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', padding: SPACING.sm,
    borderRadius: RADIUS.md, marginBottom: SPACING.base,
  },
  errorText: { fontSize: 13, color: COLORS.error, flex: 1 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  terms: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  link: { color: COLORS.primary, fontWeight: '600' },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  badge: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm,
  },
  badgeText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
});
