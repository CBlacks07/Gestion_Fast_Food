import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
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
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
