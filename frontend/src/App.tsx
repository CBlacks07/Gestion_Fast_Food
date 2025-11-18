import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useAppSettingsStore } from './store/appSettingsStore';
import api from './services/api';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import TeamPage from './pages/TeamPage';
import ProductsManagementPage from './pages/ProductsManagementPage';
import CategoriesManagementPage from './pages/CategoriesManagementPage';
import UsersManagementPage from './pages/UsersManagementPage';
import ClosuresPage from './pages/ClosuresPage';
import AppSettingsPage from './pages/AppSettingsPage';
import Layout from './components/Layout';
import type { AppSettings } from './types';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { setSettings, isLoaded } = useAppSettingsStore();

  // Charger les paramètres de l'application au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get<AppSettings>('/api/app-settings');
        if (response.data.success && response.data.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    if (!isLoaded) {
      loadSettings();
    }
  }, [isLoaded, setSettings]);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={logout} username={user.username} userRole={user.role}>
        <Routes>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/products-management" element={<ProductsManagementPage />} />
          <Route path="/categories-management" element={<CategoriesManagementPage />} />
          <Route path="/users-management" element={<UsersManagementPage />} />
          <Route path="/closures" element={<ClosuresPage />} />
          <Route path="/app-settings" element={<AppSettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
