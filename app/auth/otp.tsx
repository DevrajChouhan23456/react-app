import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, sendOtp, loading, error, clearError, devOtp } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const otpValue = otp.join('');
  const isComplete = otpValue.length === 6;

  const handleChange = (text: string, idx: number) => {
    clearError();
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isComplete) return;
    clearError();
    const needsProfile = await verifyOtp(otpValue);
    const { error: err } = useAuthStore.getState();
    if (!err) {
      if (needsProfile) {
        router.replace('/auth/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    clearError();
    setOtp(['', '', '', '', '', '']);
    setResendTimer(30);
    await sendOtp(phone);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Text style={styles.iconEmoji}>📱</Text>
            </View>
            <Text style={styles.heading}>Enter OTP</Text>
            <Text style={styles.sub}>
              We sent a 6-digit code to{' '}
              <Text style={styles.phone}>+91 {phone}</Text>
            </Text>
          </View>

          {/* Dev OTP hint */}
          {devOtp && (
            <View style={styles.devBox}>
              <Ionicons name="bug-outline" size={14} color="#856404" />
              <Text style={styles.devText}>Dev OTP: <Text style={{ fontWeight: '800' }}>{devOtp}</Text></Text>
            </View>
          )}

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => { inputRefs.current[idx] = r; }}
                style={[styles.otpBox, digit && styles.otpBoxFilled, error && styles.otpBoxError]}
                value={digit}
                onChangeText={(t) => handleChange(t, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.btn, (!isComplete || loading) && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Verify OTP</Text>
            }
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || loading}>
              <Text style={[styles.resendBtn, resendTimer > 0 && styles.resendDisabled]}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: SPACING.base },
  back: { marginBottom: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  iconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.secondary, alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.md, ...SHADOW.md,
  },
  iconEmoji: { fontSize: 36 },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  phone: { color: COLORS.primary, fontWeight: '700' },
  devBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8DC', borderWidth: 1, borderColor: '#FFDEAD',
    borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.base,
  },
  devText: { fontSize: 13, color: '#856404' },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: SPACING.sm, marginBottom: SPACING.base,
  },
  otpBox: {
    width: 48, height: 56, borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 22, fontWeight: '800',
    color: COLORS.text, backgroundColor: COLORS.white,
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF' },
  otpBoxError: { borderColor: COLORS.error },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', padding: SPACING.sm,
    borderRadius: RADIUS.md, marginBottom: SPACING.base,
  },
  errorText: { fontSize: 13, color: COLORS.error, flex: 1 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.lg,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  resendRow: { alignItems: 'center', gap: SPACING.xs },
  resendLabel: { fontSize: 13, color: COLORS.textMuted },
  resendBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  resendDisabled: { color: COLORS.textMuted },
});
