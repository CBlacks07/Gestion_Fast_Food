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
localStorage.removeItem('lastActiveAt');
set({ user, token, isAuthenticated: true });
},

logout: () => {
localStorage.removeItem('lastActiveAt');
set({ user: null, token: null, isAuthenticated: false });
},
}),
{
name: 'auth-storage',
}
)
);
