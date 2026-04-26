import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  // verifyOtp now only takes the code — confirmation is held in store
  const { verifyOtp, sendOtp, loading, error, clearError } = useAuthStore();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (val: string, idx: number) => {
    clearError();
    const cleaned = val.replace(/\D/g, '');
    const newOtp = [...otp];
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH).split('');
      chars.forEach((c, i) => { if (i < OTP_LENGTH) newOtp[i] = c; });
      setOtp(newOtp);
      inputRefs.current[Math.min(chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    newOtp[idx] = cleaned;
    setOtp(newOtp);
    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleBackspace = (idx: number) => {
    if (otp[idx] === '' && idx > 0) {
      const newOtp = [...otp];
      newOtp[idx - 1] = '';
      setOtp(newOtp);
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    // verifyOtp returns true if profile setup is needed
    const needsProfile = await verifyOtp(code);
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
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimer(30);
    clearError();
    await sendOtp(phone);
  };

  const isComplete = otp.every((d) => d !== '');
  const maskedPhone = `+91 XXXXX X${phone?.slice(-4)}`;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.otpIcon}>
              <Text style={{ fontSize: 36 }}>📱</Text>
            </View>
            <Text style={styles.heading}>Enter OTP</Text>
            <Text style={styles.subheading}>
              We sent a 6-digit code to{`\n`}
              <Text style={styles.phoneText}>{maskedPhone}</Text>
            </Text>
            <Text style={styles.poweredBy}>🔥 Powered by Firebase</Text>
          </View>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => { inputRefs.current[idx] = r; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, idx)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(idx);
                }}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={idx === 0}
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
            <Text style={styles.resendLabel}>Didn't receive the OTP? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendBtn}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.changeNumber} onPress={() => router.back()}>
            <Ionicons name="pencil" size={13} color={COLORS.primary} />
            <Text style={styles.changeNumberText}>Change mobile number</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: SPACING.base },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  header: { alignItems: 'center', marginBottom: SPACING.lg },
  otpIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.secondary, alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.md, ...SHADOW.sm,
  },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  subheading: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  phoneText: { fontWeight: '700', color: COLORS.text },
  poweredBy: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.sm },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.base },
  otpBox: {
    width: 48, height: 56, borderRadius: RADIUS.md,
    borderWidth: 2, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: COLORS.text, backgroundColor: COLORS.white,
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#FFF8F3' },
  otpBoxError: { borderColor: COLORS.error, backgroundColor: '#FFF0F0' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', padding: SPACING.sm,
    borderRadius: RADIUS.md, marginBottom: SPACING.base,
  },
  errorText: { fontSize: 13, color: COLORS.error },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.lg,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  resendLabel: { fontSize: 13, color: COLORS.textMuted },
  timerText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  resendBtn: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  changeNumber: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  changeNumberText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
