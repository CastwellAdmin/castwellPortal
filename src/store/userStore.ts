import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface StoredUser extends User {
  password: string;
}

interface UserStoreState {
  users: StoredUser[];
  getUser: (id: string) => StoredUser | undefined;
  getUserByEmail: (email: string) => StoredUser | undefined;
  createUser: (data: { name: string; email: string; password: string; role: UserRole }) => StoredUser;
  updateUser: (id: string, data: Partial<Omit<StoredUser, 'id'>>) => void;
  deleteUser: (id: string) => void;
  authenticate: (email: string, password: string) => StoredUser | null;
}

const DEFAULT_ADMIN: StoredUser = {
  id: 'admin-1',
  email: 'admin@castwell.com',
  name: 'Admin',
  role: 'admin',
  password: 'admin123',
  createdAt: '2025-01-01',
  lastLogin: undefined,
  isActive: true,
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [DEFAULT_ADMIN],

      getUser: (id: string) => {
        return get().users.find((u) => u.id === id);
      },

      getUserByEmail: (email: string) => {
        return get().users.find((u) => u.email === email);
      },

      createUser: (data) => {
        const newUser: StoredUser = {
          id: Date.now().toString(),
          email: data.email,
          name: data.name,
          role: data.role,
          password: data.password,
          createdAt: new Date().toISOString().split('T')[0],
          isActive: true,
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },

      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...data } : u
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      authenticate: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password && u.isActive
        );
        if (user) {
          const now = new Date().toISOString();
          set((state) => ({
            users: state.users.map((u) =>
              u.id === user.id ? { ...u, lastLogin: now } : u
            ),
          }));
          return user;
        }
        return null;
      },
    }),
    {
      name: 'castwell-users',
    }
  )
);
