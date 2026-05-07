import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  accessToken: string | null;
  userEmail: string | null;
  otpRequired: boolean;
  setAuth: (data: { access_token?: string | null; user_email?: string | null; otp_required?: boolean }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userEmail: null,
      otpRequired: false,
      setAuth: (data) => set((state) => ({
        accessToken: data.access_token !== undefined ? data.access_token : state.accessToken,
        userEmail: data.user_email !== undefined ? data.user_email : state.userEmail,
        otpRequired: data.otp_required !== undefined ? data.otp_required : state.otpRequired,
      })),
      logout: () => set({ accessToken: null, userEmail: null, otpRequired: false }),
    }),
    {
      name: 'serendpt-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
