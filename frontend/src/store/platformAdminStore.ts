import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformAdmin {
id: string;
username: string;
email: string;
}

interface PlatformAdminStore {
admin: PlatformAdmin | null;
token: string | null;
isAuthenticated: boolean;
login: (admin: PlatformAdmin, token: string) => void;
logout: () => void;
}

// Stockage volontairement séparé de 'auth-storage' (comptes tenant) : un
// superadmin connecté et un utilisateur restaurant connecté sur le même
// navigateur ne doivent jamais partager de session.
export const usePlatformAdminStore = create<PlatformAdminStore>()(
persist(
(set) => ({
admin: null,
token: null,
isAuthenticated: false,

login: (admin, token) => {
set({ admin, token, isAuthenticated: true });
},

logout: () => {
set({ admin: null, token: null, isAuthenticated: false });
},
}),
{
name: 'platform-admin-storage',
}
)
);
