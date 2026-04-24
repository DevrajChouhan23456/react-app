import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

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

  // Actions
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
      // Format: +91XXXXXXXXXX
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
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token,
        type: 'sms',
      });
      if (error) throw error;

      const session = data.session;
      const supaUser = data.user;

      // Fetch or create profile in DB
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
      return !profile?.name; // true = needs profile setup
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

      await supabase.from('profiles').upsert({
        id: user.id,
        name,
        email: email || '',
        phone: user.phone,
        updated_at: new Date().toISOString(),
      });

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
    await supabase.auth.signOut();
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
