import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        // Réinitialiser le state
        set({ user: null, token: null, isAuthenticated: false });

        // Nettoyer complètement le localStorage
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('app-settings-storage');

        // Nettoyer tous les autres items du localStorage (pour être sûr)
        localStorage.clear();

        // Nettoyer les cookies si présents
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Nettoyer le sessionStorage aussi
        sessionStorage.clear();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
