import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isDemoMode } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@castwell.com': {
    password: 'admin123',
    user: {
      id: 'demo-admin-1',
      email: 'admin@castwell.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: '2025-01-01',
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
  },
  'user@castwell.com': {
    password: 'user123',
    user: {
      id: 'demo-user-1',
      email: 'user@castwell.com',
      name: 'Demo Client',
      role: 'user',
      createdAt: '2025-01-01',
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        if (isDemoMode) {
          const demoUser = DEMO_USERS[email];
          if (demoUser && demoUser.password === password) {
            set({
              user: { ...demoUser.user, lastLogin: new Date().toISOString() },
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          return false;
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              // Update last login
              await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', profile.id);

              set({
                user: {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  role: profile.role,
                  createdAt: profile.created_at,
                  lastLogin: new Date().toISOString(),
                  isActive: profile.is_active,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        if (!isDemoMode) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false });
      },

      updateUser: async (userData: Partial<User>) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;

        if (isDemoMode) {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }));
          return;
        }

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
          }
        } catch (error) {
          console.error('Update user error:', error);
        }
      },

      checkSession: async () => {
        if (isDemoMode) {
          set((state) => ({ ...state, isLoading: false }));
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: profile.id,
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
              return;
            }
          }

          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Session check error:', error);
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
