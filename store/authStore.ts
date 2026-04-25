import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// ─── DEV MODE ────────────────────────────────────────────────────────────────
// Supabase phone OTP requires a paid SMS provider (Twilio/Vonage).
// In dev mode, any phone number works and OTP is always "123456".
// To switch to real SMS: set EXPO_PUBLIC_DEV_AUTH=false and configure
// Supabase → Authentication → Providers → Phone → enable + add Twilio/Vonage.
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

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<boolean>;
  updateProfile: (name: string, email?: string) => Promise<void>;
  loadSession: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: false,
  otpSent: false,
  error: null,

  sendOtp: async (phone: string) => {
    set({ loading: true, error: null });
    try {
      if (DEV_AUTH) {
        // Dev mode: simulate OTP sent — no real SMS needed
        // Use OTP "123456" on the next screen
        await new Promise((r) => setTimeout(r, 800)); // simulate network delay
        set({ otpSent: true, loading: false });
        return;
      }

      // Production: real Supabase phone OTP
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) throw error;
      set({ otpSent: true, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to send OTP', loading: false });
    }
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ loading: true, error: null });
    try {
      if (DEV_AUTH) {
        // Dev mode: accept "123456" as valid OTP
        if (token !== '123456') {
          set({ error: 'Dev mode: use OTP 123456', loading: false });
          return false;
        }
        await new Promise((r) => setTimeout(r, 800));

        const devUser: AppUser = {
          id: 'dev-user-' + phone,
          phone: `+91${phone}`,
          name: '',
          email: '',
          addresses: [],
        };
        set({ user: devUser, loading: false, otpSent: false });
        return true; // true = needs profile setup
      }

      // Production: real Supabase OTP verify
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token,
        type: 'sms',
      });
      if (error) throw error;

      const session = data.session;
      const supaUser = data.user;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaUser?.id)
        .single();

      const appUser: AppUser = {
        id: supaUser?.id || '',
        phone: formatted,
        name: profile?.name || '',
        email: profile?.email || '',
        addresses: profile?.addresses || [],
      };

      set({ session, user: appUser, loading: false, otpSent: false });
      return !profile?.name;
    } catch (err: any) {
      set({ error: err.message || 'Invalid OTP', loading: false });
      return false;
    }
  },

  updateProfile: async (name: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      const { user } = get();
      if (!user) throw new Error('Not logged in');

      if (!DEV_AUTH) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name,
          email: email || '',
          phone: user.phone,
          updated_at: new Date().toISOString(),
        });
      }

      set((s) => ({
        user: s.user ? { ...s.user, name, email } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  loadSession: async () => {
    set({ loading: true });
    if (DEV_AUTH) {
      // In dev mode, check if user is already in store
      set({ loading: false });
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({
        session,
        user: {
          id: session.user.id,
          phone: session.user.phone || '',
          name: profile?.name || '',
          email: profile?.email || '',
          addresses: profile?.addresses || [],
        },
        loading: false,
      });
    } else {
      set({ session: null, user: null, loading: false });
    }
  },

  signOut: async () => {
    if (!DEV_AUTH) await supabase.auth.signOut();
    set({ session: null, user: null, otpSent: false });
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
