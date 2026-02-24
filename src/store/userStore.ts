import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

interface UserStoreState {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  getUser: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  createUser: (data: { name: string; username: string; email: string; password: string; role: UserRole }) => Promise<User>;
  updateUser: (id: string, data: Partial<{ name: string; email: string; role: UserRole; isActive: boolean }>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setPassword: (userId: string, newPassword: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>()(
  (set, get) => ({
    users: [],
    isLoading: false,

    fetchUsers: async () => {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, name, role, is_active, created_at, last_login')
        .order('created_at', { ascending: false });

      if (error) {
        set({ isLoading: false });
        throw new Error(error.message);
      }

      const users: User[] = (data || []).map((p) => ({
        id: p.id,
        username: p.username,
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
      const { data: result, error } = await supabase.rpc('create_user_with_password', {
        p_username: data.username,
        p_email: data.email,
        p_password: data.password,
        p_name: data.name,
        p_role: data.role,
      });

      if (error) throw new Error(error.message);
      if (!result.success) throw new Error(result.error);

      const newUser: User = {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        createdAt: result.user.created_at,
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

    setPassword: async (userId: string, newPassword: string) => {
      const { data: result, error } = await supabase.rpc('change_password', {
        p_user_id: userId,
        p_new_password: newPassword,
      });

      if (error) throw new Error(error.message);
      if (!result.success) throw new Error(result.error);
    },
  })
);
