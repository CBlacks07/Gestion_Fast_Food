import axios from 'axios';
import { API_BASE_URL } from './api';

// Instance axios dédiée : lit le token dans 'platform-admin-storage', jamais
// dans 'auth-storage' (tenant). Les deux zones de l'appli ne doivent jamais
// pouvoir mélanger leurs jetons.
const platformApi = axios.create({
baseURL: API_BASE_URL,
headers: {
'Content-Type': 'application/json',
},
});

platformApi.interceptors.request.use((config) => {
const raw = localStorage.getItem('platform-admin-storage');
if (raw) {
try {
const { state } = JSON.parse(raw);
if (state?.token) {
config.headers.Authorization = `Bearer ${state.token}`;
}
} catch {
// ignore
}
}
return config;
});

let isHandling401 = false;
platformApi.interceptors.response.use(
(response) => response,
(error) => {
const status = error.response?.status;
const isLoginRequest = (error.config?.url || '').includes('/api/platform/auth/login');
if (status === 401 && !isLoginRequest && !isHandling401) {
isHandling401 = true;
localStorage.removeItem('platform-admin-storage');
window.location.href = '/admin';
}
return Promise.reject(error);
}
);

export interface Restaurant {
id: string;
code: string;
name: string;
isActive: boolean;
createdAt: string;
_count: { users: number; orders: number };
}

export interface PlatformUser {
id: string;
email: string;
username: string;
firstName: string | null;
lastName: string | null;
role: string;
isActive: boolean;
createdAt: string;
}

export const platformAuthApi = {
login: async (username: string, password: string) => {
const response = await platformApi.post('/api/platform/auth/login', { username, password });
return response.data;
},
};

export const platformRestaurantsApi = {
getAll: async () => {
const response = await platformApi.get<{ success: boolean; data: Restaurant[] }>('/api/platform/restaurants');
return response.data;
},

create: async (data: {
code: string;
name: string;
adminUsername: string;
adminEmail: string;
adminPassword?: string;
withDefaultCategories?: boolean;
}) => {
const response = await platformApi.post('/api/platform/restaurants', data);
return response.data;
},

setActive: async (id: string, isActive: boolean) => {
const response = await platformApi.patch(`/api/platform/restaurants/${id}`, { isActive });
return response.data;
},

remove: async (id: string) => {
const response = await platformApi.delete(`/api/platform/restaurants/${id}`);
return response.data;
},

getUsers: async (id: string) => {
const response = await platformApi.get<{ success: boolean; data: PlatformUser[] }>(
`/api/platform/restaurants/${id}/users`
);
return response.data;
},
};

export const platformUsersApi = {
resetPassword: async (id: string) => {
const response = await platformApi.post<{ success: boolean; data: { username: string; newPassword: string } }>(
`/api/platform/users/${id}/reset-password`
);
return response.data;
},
};

export default platformApi;
