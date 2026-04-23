import React, { useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { getRazorpayHTML, RAZORPAY_KEY_ID } from '@/services/razorpayService';

interface Props {
  visible: boolean;
  orderId: string;
  amount: number; // in paise
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
  onDismiss: () => void;
}

export default function RazorpayWebView({
  visible, orderId, amount, customerName, customerPhone,
  customerEmail = '', description = 'Dal Bafla Order',
  onSuccess, onFailure, onDismiss,
}: Props) {
  const webviewRef = useRef<WebView>(null);

  const html = getRazorpayHTML({
    keyId: RAZORPAY_KEY_ID,
    orderId,
    amount,
    name: 'Gau Stories - Dal Bafla',
    description,
    customerName,
    customerPhone,
    customerEmail,
  });

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'PAYMENT_SUCCESS') {
        onSuccess(
          msg.data.razorpay_payment_id,
          msg.data.razorpay_order_id,
          msg.data.razorpay_signature
        );
      } else if (msg.type === 'PAYMENT_FAILED') {
        onFailure(msg.data.description || 'Payment failed');
      }
    } catch (e) {
      console.error('WebView message parse error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Secure Payment</Text>
              <Text style={styles.headerSub}>Powered by Razorpay</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Amount bar */}
        <View style={styles.amountBar}>
          <Text style={styles.amountLabel}>Paying</Text>
          <Text style={styles.amountValue}>₹{Math.round(amount / 100)}</Text>
        </View>

        {/* WebView */}
        <WebView
          ref={webviewRef}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading payment gateway...</Text>
            </View>
          )}
          style={styles.webview}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoBox: {
    width: 36, height: 36, backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.textMuted },
  closeBtn: { padding: SPACING.sm },
  amountBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF8F3', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  amountLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  amountValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white,
  },
  loadingText: { marginTop: SPACING.md, color: COLORS.textMuted, fontSize: 14 },
});
