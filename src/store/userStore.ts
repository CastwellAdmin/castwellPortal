import { create } from 'zustand';
import { supabase, supabaseNoSession } from '../lib/supabase';
import type { User, UserRole } from '../types';

interface UserStoreState {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  getUser: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  createUser: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<User>;
  updateUser: (id: string, data: Partial<{ name: string; email: string; role: UserRole; isActive: boolean }>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>()(
  (set, get) => ({
    users: [],
    isLoading: false,

    fetchUsers: async () => {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        set({ isLoading: false });
        throw new Error(error.message);
      }

      const users: User[] = (data || []).map((p) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        createdAt: p.created_at,
        lastLogin: p.last_login,
        isActive: p.is_active,
      }));

      set({ users, isLoading: false });
    },

    getUser: (id) => get().users.find((u) => u.id === id),

    getUserByEmail: (email) => get().users.find((u) => u.email === email),

    createUser: async (data) => {
      // Create auth user via signUp on a non-persistent client
      // so the admin's session isn't replaced
      const { data: signUpData, error: signUpError } = await supabaseNoSession.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!signUpData.user) {
        throw new Error('Failed to create user account.');
      }

      // Wait briefly for the database trigger to create the profile
      await new Promise((r) => setTimeout(r, 500));

      // Ensure the profile has the correct role and name
      await supabase
        .from('profiles')
        .update({ role: data.role, name: data.name })
        .eq('id', signUpData.user.id);

      const newUser: User = {
        id: signUpData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      set((state) => ({ users: [newUser, ...state.users] }));
      return newUser;
    },

    updateUser: async (id, data) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(error.message);

      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, ...data } : u
        ),
      }));
    },

    deleteUser: async (id) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    },

    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
    },
  })
);
