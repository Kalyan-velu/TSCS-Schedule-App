import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginStudent, type Student } from '@/lib/api';

type AuthState = {
  student: Student | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student: null,
      token: null,
      loading: false,
      error: null,
      login: async (email: string, password?: string) => {
        set({ loading: true, error: null });
        try {
          const res = await loginStudent({ email, password });
          set({ student: res.student, token: res.token, loading: false });
          return true;
        } catch (err) {
          set({ error: (err as Error).message || 'Failed to authenticate.', loading: false });
          return false;
        }
      },
      logout: () => {
        set({ student: null, token: null, error: null });
      },
    }),
    {
      name: 'tscs-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ student: state.student, token: state.token }),
    }
  )
);
