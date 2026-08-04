import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppSettingsStore } from './appSettingsStore';

interface User {
id: string;
username: string;
email: string;
role: string;
restaurantId: string;
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
localStorage.removeItem('lastActiveAt');
set({ user, token, isAuthenticated: true });
},

logout: () => {
localStorage.removeItem('lastActiveAt');
// Éviter qu'un branding (logo/nom) reste affiché entre deux connexions
// de restaurants différents sur un poste partagé.
useAppSettingsStore.getState().reset();
set({ user: null, token: null, isAuthenticated: false });
},
}),
{
name: 'auth-storage',
}
)
);
