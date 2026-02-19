import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // GoTrue returns 500 when email confirmations are required but
          // the user's email hasn't been confirmed. Surface a helpful message.
          if (error.status === 500) {
            throw new Error(
              'Authentication service error. Please check that email confirmations are disabled in your Supabase dashboard (Authentication → Providers → Email).'
            );
          }
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error('Login failed. Please try again.');
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
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

        // User exists in Supabase Auth but no profile - create one
        const newProfile = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split('@')[0] || 'User',
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        await supabase.from('profiles').insert(newProfile);

        set({
          user: {
            id: newProfile.id,
            email: newProfile.email || email,
            name: newProfile.name,
            role: 'user',
            createdAt: newProfile.created_at,
            lastLogin: newProfile.last_login,
            isActive: true,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signout errors
        }
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

          // No active Supabase session - clear any stale persisted state
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
