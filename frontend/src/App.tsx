import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={logout} username={user.username}>
        <Routes>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
