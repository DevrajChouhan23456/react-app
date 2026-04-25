import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { getApiBaseUrl } from '@/services/apiConfig';

// ── MSG91 OTP via our FastAPI backend ────────────────────────────────────────
// Frontend never calls MSG91 directly — calls our own backend /api/auth/*
// Backend env: MSG91_DEV_MODE=true  → OTP printed to server console (no SMS)
//              MSG91_DEV_MODE=false → real SMS via MSG91
// Frontend env: EXPO_PUBLIC_DEV_AUTH=true → backend returns dev_otp in response
//               EXPO_PUBLIC_DEV_AUTH=false → no dev_otp exposed

const DEV_AUTH = process.env.EXPO_PUBLIC_DEV_AUTH !== 'false';

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
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  otpSent: boolean;
  error: string | null;
  devOtp: string | null; // only in dev mode — shown as hint

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<boolean>;
  updateProfile: (name: string, email?: string) => Promise<void>;
  loadSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
}

async function backendPost(path: string, body: object) {
  const base = getApiBaseUrl().replace(/\/api$/, ''); // strip trailing /api
  const res = await fetch(`${base}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: false,
  otpSent: false,
  error: null,
  devOtp: null,

  sendOtp: async (phone: string) => {
    set({ loading: true, error: null, devOtp: null });
    try {
      const data = await backendPost('/auth/send-otp', { phone });
      if (!data.success) throw new Error(data.message || 'Failed to send OTP');
      set({
        otpSent: true,
        loading: false,
        // In dev mode, backend returns the OTP so you can see it on screen
        devOtp: DEV_AUTH ? (data.dev_otp ?? null) : null,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Could not reach server. Is the backend running?',
        loading: false,
      });
    }
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await backendPost('/auth/verify-otp', { phone, otp: token });
      if (!data.success) throw new Error(data.message || 'Invalid OTP');

      const appUser: AppUser = {
        id: data.user_id,
        phone: data.phone,
        name: '',
        email: '',
        addresses: [],
      };
      set({ user: appUser, loading: false, otpSent: false, devOtp: null });
      return true; // needs profile setup
    } catch (err: any) {
      set({ error: err.message || 'Invalid OTP', loading: false });
      return false;
    }
  },

  updateProfile: async (name: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      set((s) => ({
        user: s.user ? { ...s.user, name, email } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  loadSession: async () => {
    // Session is in-memory only for now (AsyncStorage can be added later)
    set({ loading: false });
  },

  signOut: async () => {
    set({ session: null, user: null, otpSent: false, devOtp: null });
  },

  clearError: () => set({ error: null }),

  addAddress: (address) => {
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
    }));
  },

  setDefaultAddress: (id) => {
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
    }));
  },
}));
