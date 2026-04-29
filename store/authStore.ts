import { create } from 'zustand';
import { getApiBaseUrl } from '@/services/apiConfig';

// ── Backend OTP Auth ──────────────────────────────────────────────────────────
// Flow:
//   1. sendOtp(phone)  → POST /api/auth/send-otp  → backend sends SMS via MSG91
//   2. verifyOtp(code) → POST /api/auth/verify-otp → backend verifies → returns user
// No Firebase, no billing, no reCAPTCHA.

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
  session: AppUser | null;
  loading: boolean;
  otpSent: boolean;
  error: string | null;
  devOtp: string | null;

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  updateProfile: (name: string, email?: string) => Promise<void>;
  loadSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
}

// Simple in-memory session store (no localStorage — sandbox safe)
let _sessionUser: AppUser | null = null;
let _pendingPhone: string = '';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: _sessionUser,
  session: _sessionUser,
  loading: false,
  otpSent: false,
  error: null,
  devOtp: null,

  // ── Send OTP ────────────────────────────────────────────────────────────────
  sendOtp: async (phone: string) => {
    set({ loading: true, error: null, devOtp: null });
    try {
      const normalized = phone.replace(/\D/g, '');
      _pendingPhone = normalized;

      const res = await fetch(`${getApiBaseUrl()}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      const data = await res.json();

      if (!data.success) {
        set({ error: data.message || 'Failed to send OTP. Please try again.', loading: false });
        return;
      }

      set({
        otpSent: true,
        loading: false,
        devOtp: data.dev_otp ?? null,
      });
    } catch (err: any) {
      console.log('🔴 sendOtp error:', err?.message);
      set({ error: 'Could not reach server. Is the backend running?', loading: false });
    }
  },

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  verifyOtp: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: _pendingPhone, otp: code }),
      });

      const data = await res.json();

      if (!data.success) {
        set({ error: data.message || 'Invalid OTP. Please try again.', loading: false });
        return false;
      }

      const appUser: AppUser = {
        id: data.user_id,
        phone: data.phone,
        name: data.name || '',        // ✅ use server name if returned
        email: data.email || '',
        addresses: data.addresses || [],
      };

      _sessionUser = appUser;
      set({
        user: appUser,
        session: appUser,
        loading: false,
        otpSent: false,
        devOtp: null,
      });

      return !appUser.name; // true = new user, needs profile setup
    } catch (err: any) {
      console.log('🔴 verifyOtp error:', err?.message);
      set({ error: 'Could not reach server. Is the backend running?', loading: false });
      return false;
    }
  },

  // ── Update Profile ──────────────────────────────────────────────────────────
  updateProfile: async (name: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      set((s) => ({
        user: s.user ? { ...s.user, name, email } : null,
        loading: false,
      }));
      if (_sessionUser) _sessionUser = { ..._sessionUser, name, email };
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Load Session ─────────────────────────────────────────────────────────────
  loadSession: async () => {
    set({ user: _sessionUser, session: _sessionUser, loading: false });
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────────
  signOut: async () => {
    _sessionUser = null;
    _pendingPhone = '';
    set({ user: null, session: null, otpSent: false, devOtp: null });
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
