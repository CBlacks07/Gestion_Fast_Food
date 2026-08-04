import axios from 'axios';
import type {
ApiResponse,
Category,
Product,
Order,
Payment,
Option,
Table,
Ingredient,
StockMovement,
} from '../types';

// En production (déploiement Vercel mono-projet), l'API est servie par le même
// domaine que le front : on utilise des URL relatives, donc pas de CORS.
// En développement, on tape directement le serveur Fastify local.
// VITE_API_URL reste prioritaire pour les cas particuliers (build Tauri,
// backend hébergé ailleurs...).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://127.0.0.1:3010');

const api = axios.create({
baseURL: API_BASE_URL,
headers: {
'Content-Type': 'application/json',
},
});

// Intercepteur pour ajouter le token JWT à toutes les requêtes
api.interceptors.request.use(
(config) => {
// Récupérer le token depuis le localStorage (où zustand persiste les données)
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
try {
const { state } = JSON.parse(authStorage);
if (state?.token) {
config.headers.Authorization = `Bearer ${state.token}`;
}
} catch (error) {
console.error('Erreur lors de la récupération du token:', error);
}
}
return config;
},
(error) => {
return Promise.reject(error);
}
);

// Intercepteur de réponse : déconnexion automatique si le token est invalide/expiré (401)
let isHandling401 = false;
api.interceptors.response.use(
(response) => response,
(error) => {
const status = error.response?.status;
const url: string = error.config?.url || '';
// Ne pas déconnecter sur l'écran de login (mauvais identifiants) ni en boucle
const isLoginRequest = url.includes('/api/auth/login');
if (status === 401 && !isLoginRequest && !isHandling401) {
isHandling401 = true;
try {
localStorage.removeItem('auth-storage');
localStorage.removeItem('lastActiveAt');
} catch {
// ignore
}
// Recharger l'application -> renvoie vers l'écran de connexion
window.location.reload();
}
return Promise.reject(error);
}
);

// Auth API
// Restaurants API (branding public, avant connexion)
export const restaurantsApi = {
getBrandingByCode: async (code: string) => {
const response = await api.get<ApiResponse<{
appName: string;
appIcon: string;
logoUrl: string | null;
primaryColor: string;
slogan: string | null;
}>>('/api/restaurants/branding', { params: { code } });
return response.data;
},
};

export const authApi = {
login: async (code: string, username: string, password: string) => {
const response = await api.post<ApiResponse<any>>('/api/auth/login', {
code,
username,
password,
});
return response.data;
},

getCurrentUser: async (userId: string) => {
const response = await api.get<ApiResponse<any>>('/api/auth/me', {
params: { userId },
});
return response.data;
},
};

// Categories API
export const categoriesApi = {
getAll: async () => {
const response = await api.get<ApiResponse<Category[]>>('/api/categories');
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Category>>(`/api/categories/${id}`);
return response.data;
},

create: async (data: Partial<Category>) => {
const response = await api.post<ApiResponse<Category>>('/api/categories', data);
return response.data;
},

update: async (id: string, data: Partial<Category>) => {
const response = await api.put<ApiResponse<Category>>(`/api/categories/${id}`, data);
return response.data;
},

delete: async (id: string) => {
const response = await api.delete<ApiResponse<Category>>(`/api/categories/${id}`);
return response.data;
},
};

// Products API
export const productsApi = {
getAll: async (params?: { categoryId?: string; available?: boolean }) => {
const response = await api.get<ApiResponse<Product[]>>('/api/products', { params });
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
return response.data;
},

create: async (data: Partial<Product>) => {
const response = await api.post<ApiResponse<Product>>('/api/products', data);
return response.data;
},

update: async (id: string, data: Partial<Product>) => {
const response = await api.put<ApiResponse<Product>>(`/api/products/${id}`, data);
return response.data;
},

delete: async (id: string) => {
const response = await api.delete<ApiResponse<Product>>(`/api/products/${id}`);
return response.data;
},

updateAvailability: async (id: string, isAvailable: boolean) => {
const response = await api.patch<ApiResponse<Product>>(
`/api/products/${id}/availability`,
{ isAvailable }
);
return response.data;
},
};

// Orders API
export const ordersApi = {
getAll: async (params?: { status?: string; type?: string; date?: string }) => {
const response = await api.get<ApiResponse<Order[]>>('/api/orders', { params });
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
return response.data;
},

create: async (data: {
type: string;
tableId?: string;
customerName?: string;
customerPhone?: string;
notes?: string;
userId: string;
items: Array<{
productId: string;
quantity: number;
notes?: string;
options?: Array<{ optionId: string }>;
}>;
}) => {
const response = await api.post<ApiResponse<Order>>('/api/orders', data);
return response.data;
},

updateStatus: async (id: string, status: string) => {
const response = await api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status });
return response.data;
},

cancel: async (id: string, userId: string) => {
const response = await api.delete<ApiResponse<Order>>(`/api/orders/${id}`, {
data: { userId },
});
return response.data;
},

getTodayStats: async () => {
const response = await api.get<ApiResponse<any>>('/api/orders/stats/today');
return response.data;
},
};

// Payments API
export const paymentsApi = {
getAll: async (params?: { orderId?: string; method?: string; status?: string; date?: string }) => {
const response = await api.get<ApiResponse<Payment[]>>('/api/payments', { params });
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Payment>>(`/api/payments/${id}`);
return response.data;
},

create: async (data: {
orderId: string;
method: string;
amount: number;
reference?: string;
userId: string;
}) => {
const response = await api.post<ApiResponse<Payment>>('/api/payments', data);
return response.data;
},

getByOrder: async (orderId: string) => {
const response = await api.get<ApiResponse<any>>(`/api/payments/order/${orderId}`);
return response.data;
},

getTodayStats: async () => {
const response = await api.get<ApiResponse<any>>('/api/payments/stats/today');
return response.data;
},
};

// Options API
export const optionsApi = {
getAll: async (params?: { type?: string }) => {
const response = await api.get<ApiResponse<Option[]>>('/api/options', { params });
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Option>>(`/api/options/${id}`);
return response.data;
},

create: async (data: Partial<Option>) => {
const response = await api.post<ApiResponse<Option>>('/api/options', data);
return response.data;
},

update: async (id: string, data: Partial<Option>) => {
const response = await api.put<ApiResponse<Option>>(`/api/options/${id}`, data);
return response.data;
},

delete: async (id: string) => {
const response = await api.delete<ApiResponse<Option>>(`/api/options/${id}`);
return response.data;
},
};

// Tables API
export const tablesApi = {
getAll: async () => {
const response = await api.get<ApiResponse<Table[]>>('/api/tables');
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Table>>(`/api/tables/${id}`);
return response.data;
},

create: async (data: Partial<Table>) => {
const response = await api.post<ApiResponse<Table>>('/api/tables', data);
return response.data;
},

update: async (id: string, data: Partial<Table>) => {
const response = await api.put<ApiResponse<Table>>(`/api/tables/${id}`, data);
return response.data;
},

delete: async (id: string) => {
const response = await api.delete<ApiResponse<Table>>(`/api/tables/${id}`);
return response.data;
},

getAvailable: async () => {
const response = await api.get<ApiResponse<Table[]>>('/api/tables/status/available');
return response.data;
},
};

// Ingredients API
export const ingredientsApi = {
getAll: async (params?: { lowStock?: boolean }) => {
const response = await api.get<ApiResponse<Ingredient[]>>('/api/ingredients', { params });
return response.data;
},

getById: async (id: string) => {
const response = await api.get<ApiResponse<Ingredient>>(`/api/ingredients/${id}`);
return response.data;
},

create: async (data: Partial<Ingredient>) => {
const response = await api.post<ApiResponse<Ingredient>>('/api/ingredients', data);
return response.data;
},

update: async (id: string, data: Partial<Ingredient>) => {
const response = await api.put<ApiResponse<Ingredient>>(`/api/ingredients/${id}`, data);
return response.data;
},

addStock: async (id: string, data: {
type: string;
quantity: number;
reason?: string;
reference?: string;
}) => {
const response = await api.post<ApiResponse<{ movement: StockMovement; ingredient: Ingredient }>>(
`/api/ingredients/${id}/stock`,
data
);
return response.data;
},

getLowStockAlerts: async () => {
const response = await api.get<ApiResponse<Ingredient[]>>('/api/ingredients/alerts/low-stock');
return response.data;
},
};

// Users API
export const usersApi = {
getAll: async (params?: { includeInactive?: boolean }) => {
const response = await api.get<ApiResponse<any[]>>('/api/users', { params });
return response.data;
},

create: async (data: {
email: string;
username: string;
password: string;
firstName?: string;
lastName?: string;
role: string;
}) => {
const response = await api.post<ApiResponse<any>>('/api/users', data);
return response.data;
},

update: async (id: string, data: {
email?: string;
username?: string;
password?: string;
firstName?: string;
lastName?: string;
role?: string;
isActive?: boolean;
}) => {
const response = await api.put<ApiResponse<any>>(`/api/users/${id}`, data);
return response.data;
},

delete: async (id: string, currentUserId: string) => {
const response = await api.delete<ApiResponse<any>>(`/api/users/${id}`, {
data: { currentUserId },
});
return response.data;
},

getUserStats: async (userId: string, date?: string) => {
const response = await api.get<ApiResponse<any>>(`/api/users/${userId}/stats`, {
params: date ? { date } : {},
});
return response.data;
},

getAllUsersStats: async (date?: string) => {
const response = await api.get<ApiResponse<any>>('/api/users/stats/all', {
params: date ? { date } : {},
});
return response.data;
},
};

// Closures API
export const closuresApi = {
getAll: async (userId?: string) => {
const params = userId ? { userId } : {};
const response = await api.get<ApiResponse<any[]>>('/api/closures', { params });
return response.data;
},

getByDate: async (date: string) => {
const response = await api.get<ApiResponse<any>>(`/api/closures/${date}`);
return response.data;
},

create: async (data: { date: string; userId: string; notes?: string }) => {
const response = await api.post<ApiResponse<any>>('/api/closures', data);
return response.data;
},

checkExists: async (date: string, userId?: string) => {
const params = userId ? { userId } : {};
const response = await api.get<ApiResponse<{ exists: boolean; closure: any }>>(`/api/closures/check/${date}`, { params });
return response.data;
},
};

// Health check
// `/api/health` (et non `/health`) : sur Vercel, seules les routes sous /api/
// sont routées vers la fonction serverless.
export const healthCheck = async () => {
const response = await api.get('/api/health');
return response.data;
};

export default api;
