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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post<ApiResponse<any>>('/api/auth/login', {
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

  cancel: async (id: string) => {
    const response = await api.delete<ApiResponse<Order>>(`/api/orders/${id}`);
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
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]>>('/api/users');
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

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
