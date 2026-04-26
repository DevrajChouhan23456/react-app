import { create } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ── Firebase Phone Auth ───────────────────────────────────────────────────────
// Flow:
//   1. sendOtp(phone)  → Firebase sends real SMS, returns confirmation object
//   2. verifyOtp(otp)  → confirms code with Firebase → returns FirebaseUser
// No backend needed for auth — Firebase handles OTP + verification for free.
// 10,000 SMS/month free on Spark plan.

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
  loading: boolean;
  otpSent: boolean;
  error: string | null;
  // held between sendOtp and verifyOtp
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
  loading: false,
  otpSent: false,
  error: null,
  _confirmation: null,

  // ── Send OTP ────────────────────────────────────────────────────────────────
  sendOtp: async (phone: string) => {
    set({ loading: true, error: null });
    try {
      // Normalize: ensure +91 prefix
      const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const confirmation = await auth().signInWithPhoneNumber(normalized);
      set({ otpSent: true, loading: false, _confirmation: confirmation });
    } catch (err: any) {
      let message = 'Failed to send OTP. Please try again.';
      if (err?.code === 'auth/invalid-phone-number') message = 'Invalid phone number.';
      if (err?.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      if (err?.code === 'auth/quota-exceeded') message = 'SMS quota exceeded. Try again tomorrow.';
      set({ error: message, loading: false });
    }
  },

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  verifyOtp: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const { _confirmation } = get();
      if (!_confirmation) throw new Error('No OTP request found. Please resend.');

      const credential = await _confirmation.confirm(code);
      const fbUser = credential?.user ?? null;

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
        user: appUser,
        loading: false,
        otpSent: false,
        _confirmation: null,
      });

      // Return true if profile name is empty → needs profile setup
      return !fbUser.displayName;
    } catch (err: any) {
      let message = 'Invalid OTP. Please try again.';
      if (err?.code === 'auth/invalid-verification-code') message = 'Wrong OTP. Please check and retry.';
      if (err?.code === 'auth/code-expired') message = 'OTP expired. Please request a new one.';
      if (err?.message) message = err.message;
      set({ error: message, loading: false });
      return false;
    }
  },

  // ── Update Profile ──────────────────────────────────────────────────────────
  updateProfile: async (name: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      const fbUser = get().firebaseUser;
      if (fbUser) {
        await fbUser.updateProfile({ displayName: name });
      }
      set((s) => ({
        user: s.user ? { ...s.user, name, email } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Load Session ────────────────────────────────────────────────────────────
  loadSession: async () => {
    set({ loading: true });
    // Firebase persists auth state automatically
    const fbUser = auth().currentUser;
    if (fbUser) {
      set({
        firebaseUser: fbUser,
        user: {
          id: fbUser.uid,
          phone: fbUser.phoneNumber ?? '',
          name: fbUser.displayName ?? '',
          email: fbUser.email ?? '',
          addresses: [],
        },
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  // ── Sign Out ────────────────────────────────────────────────────────────────
  signOut: async () => {
    await auth().signOut();
    set({ user: null, firebaseUser: null, otpSent: false, _confirmation: null });
  },

  clearError: () => set({ error: null }),

  addAddress: (address) =>
    set((s) => ({
      user: s.user
        ? {
            ...s.user,
            addresses: [
              ...s.user.addresses,
              { ...address, id: Date.now().toString() },
            ],
          }
        : null,
    })),

  setDefaultAddress: (id) =>
    set((s) => ({
      user: s.user
        ? {
            ...s.user,
            addresses: s.user.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          }
        : null,
    })),
}));
