import { create } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ── @react-native-firebase Phone Auth ─────────────────────────────────────────
// No reCAPTCHA verifier needed — native SDK handles it automatically.
// Flow:
//   1. sendOtp(phone)  → Firebase sends real SMS
//   2. verifyOtp(code) → confirms with Firebase → user logged in

interface Address {
  id: string;
  label: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface AppUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  addresses: Address[];
}

interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  session: FirebaseAuthTypes.User | null;
  loading: boolean;
  otpSent: boolean;
  error: string | null;
  _confirmation: FirebaseAuthTypes.ConfirmationResult | null;

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  updateProfile: (name: string, email?: string) => Promise<void>;
  loadSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  session: null,
  loading: false,
  otpSent: false,
  error: null,
  _confirmation: null,

  // ── Send OTP ────────────────────────────────────────────────────────────────
  sendOtp: async (phone: string) => {
    set({ loading: true, error: null });
    try {
      const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      // @react-native-firebase handles reCAPTCHA natively — no verifier needed
      const confirmation = await auth().signInWithPhoneNumber(normalized);
      set({ otpSent: true, loading: false, _confirmation: confirmation });
    } catch (err: any) {
      let message = 'Failed to send OTP. Please try again.';
      if (err?.code === 'auth/invalid-phone-number')  message = 'Invalid phone number.';
      if (err?.code === 'auth/too-many-requests')     message = 'Too many attempts. Try again later.';
      if (err?.code === 'auth/quota-exceeded')        message = 'SMS quota exceeded. Try again tomorrow.';
      if (err?.code === 'auth/missing-phone-number')  message = 'Please enter your phone number.';
      set({ error: message, loading: false });
    }
  },

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  verifyOtp: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const { _confirmation } = get();
      if (!_confirmation) throw new Error('No OTP request found. Please resend.');

      const result = await _confirmation.confirm(code);
      const fbUser = result?.user ?? null;
      if (!fbUser) throw new Error('Verification failed.');

      const appUser: AppUser = {
        id: fbUser.uid,
        phone: fbUser.phoneNumber ?? '',
        name: fbUser.displayName ?? '',
        email: fbUser.email ?? '',
        addresses: [],
      };

      set({
        firebaseUser: fbUser,
        session: fbUser,
        user: appUser,
        loading: false,
        otpSent: false,
        _confirmation: null,
      });

      return !fbUser.displayName; // true = needs profile setup
    } catch (err: any) {
      let message = 'Invalid OTP. Please try again.';
      if (err?.code === 'auth/invalid-verification-code') message = 'Wrong OTP. Please check and retry.';
      if (err?.code === 'auth/code-expired')             message = 'OTP expired. Please request a new one.';
      if (err?.message) message = err.message;
      set({ error: message, loading: false });
      return false;
    }
  },

  // ── Update Profile ──────────────────────────────────────────────────────────
  updateProfile: async (name: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      const fbUser = auth().currentUser;
      if (fbUser) await fbUser.updateProfile({ displayName: name });
      set((s) => ({
        user: s.user ? { ...s.user, name, email } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Load Session ─────────────────────────────────────────────────────────────
  loadSession: async () => {
    set({ loading: true });
    return new Promise<void>((resolve) => {
      const unsubscribe = auth().onAuthStateChanged((fbUser) => {
        unsubscribe();
        if (fbUser) {
          const appUser: AppUser = {
            id: fbUser.uid,
            phone: fbUser.phoneNumber ?? '',
            name: fbUser.displayName ?? '',
            email: fbUser.email ?? '',
            addresses: [],
          };
          set({ firebaseUser: fbUser, session: fbUser, user: appUser, loading: false });
        } else {
          set({ loading: false });
        }
        resolve();
      });
    });
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────────
  signOut: async () => {
    await auth().signOut();
    set({ user: null, firebaseUser: null, session: null, otpSent: false, _confirmation: null });
  },

  clearError: () => set({ error: null }),

  addAddress: (address) =>
    set((s) => ({
      user: s.user
        ? { ...s.user, addresses: [...s.user.addresses, { ...address, id: Date.now().toString() }] }
        : null,
    })),

  setDefaultAddress: (id) =>
    set((s) => ({
      user: s.user
        ? { ...s.user, addresses: s.user.addresses.map((a) => ({ ...a, isDefault: a.id === id })) }
        : null,
    })),
}));
