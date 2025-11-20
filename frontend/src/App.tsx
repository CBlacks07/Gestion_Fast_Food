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
import type { AppSettings, ApiResponse } from './types';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { setSettings, isLoaded, settings } = useAppSettingsStore();

  // Charger les paramètres de l'application au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get<ApiResponse<AppSettings>>('/api/app-settings');
        if (response.data.success && response.data.data) {
          setSettings(response.data.data);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des paramètres:', error);

        // Si le serveur est en cours de démarrage, réessayer après 3 secondes
        if (error.response?.status === 503 || error.code === 'ERR_NETWORK') {
          console.log('Le serveur démarre, nouvelle tentative dans 3 secondes...');
          setTimeout(loadSettings, 3000);
        }
      }
    };

    if (!isLoaded) {
      loadSettings();
    }
  }, [isLoaded, setSettings]);

  // Appliquer les couleurs dynamiquement via CSS variables
  useEffect(() => {
    if (settings?.primaryColor) {
      const hex = settings.primaryColor;

      // Convertir hex en RGB pour les variantes avec opacité
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
          : '239, 68, 68'; // fallback red
      };

      // Fonction pour assombrir une couleur
      const darkenColor = (hex: string, percent: number) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return hex;

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);

        r = Math.floor(r * (1 - percent));
        g = Math.floor(g * (1 - percent));
        b = Math.floor(b * (1 - percent));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };

      document.documentElement.style.setProperty('--color-primary', hex);
      document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(hex));
      document.documentElement.style.setProperty('--color-primary-600', darkenColor(hex, 0.1));
      document.documentElement.style.setProperty('--color-primary-700', darkenColor(hex, 0.2));
    }

    if (settings?.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);
    }
  }, [settings?.primaryColor, settings?.secondaryColor]);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={logout} username={user.username} userRole={user.role}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={user.role === 'ADMIN' ? '/app-settings' : '/pos'}
                replace
              />
            }
          />
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
