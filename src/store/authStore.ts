import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (username: string, password: string) => {
        const { data, error } = await supabase.rpc('authenticate_user', {
          p_username: username,
          p_password: password,
        });

        if (error) {
          throw new Error('Authentication failed. Please try again.');
        }

        if (!data.success) {
          throw new Error(data.error || 'Invalid username or password');
        }

        const profile = data.user;

        set({
          user: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            createdAt: profile.created_at,
            lastLogin: profile.last_login,
            isActive: profile.is_active,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: async (userData: Partial<User>) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: userData.name,
              email: userData.email,
            })
            .eq('id', currentUser.id);

          if (!error) {
            set((state) => ({
              user: state.user ? { ...state.user, ...userData } : null,
            }));
            return;
          }
        } catch (error) {
          console.error('Profile update failed:', error);
        }
      },

      checkSession: async () => {
        try {
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) {
            set({ isLoading: false });
            return;
          }

          // Verify the persisted user still exists and is active
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, is_active')
            .eq('id', currentUser.id)
            .single();

          if (error || !profile || !profile.is_active) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          set({ isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize session check on app load
useAuthStore.getState().checkSession();
