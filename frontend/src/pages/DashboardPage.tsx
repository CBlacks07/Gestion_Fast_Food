import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Calculator, Banknote, Smartphone, CreditCard, Wallet, RefreshCw, Utensils, Bike, Lock, ArrowUpRight } from 'lucide-react';
import { ordersApi, paymentsApi, usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface PaymentMethodStats {
  count: number;
  total: number;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orders?: DayOrder[];
}

interface PaymentStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalPayments: number;
  byMethod: Record<string, PaymentMethodStats>;
  totalAmount?: number;
}

interface DayOrder {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  createdAt: string;
  total: number | string;
}

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER';
  const isCashier = user?.role === 'CASHIER';
  const canAccess = isManager || isCashier;

  useEffect(() => {
    if (!canAccess || !user) return;
    loadStats();
  }, [canAccess, user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      if (isManager) {
        const [ordersResponse, paymentsResponse] = await Promise.all([
          ordersApi.getTodayStats(),
          paymentsApi.getTodayStats(),
        ]);
        if (ordersResponse.success && ordersResponse.data) setOrderStats(ordersResponse.data as OrderStats);
        if (paymentsResponse.success && paymentsResponse.data) setPaymentStats(paymentsResponse.data as PaymentStats);
      } else if (isCashier) {
        const today = new Date().toISOString().split('T')[0];
        const statsResponse = await usersApi.getUserStats(user.id, today);
        if (statsResponse.success && statsResponse.data) {
          const userData = statsResponse.data as {
            stats?: { totalOrders?: number; totalRevenue?: number; averageOrderValue?: number };
            orders?: DayOrder[];
            paymentsByMethod?: Record<string, PaymentMethodStats>;
          };
          setOrderStats({
            totalOrders: userData.stats?.totalOrders || 0,
            totalRevenue: userData.stats?.totalRevenue || 0,
            averageOrderValue: userData.stats?.averageOrderValue || 0,
            orders: userData.orders || [],
          });
          const paymentsByMethod = userData.paymentsByMethod || {};
          const totalAmount = Object.values(paymentsByMethod).reduce((sum, m) => sum + m.total, 0);
          setPaymentStats({
            totalOrders: userData.stats?.totalOrders || 0,
            totalRevenue: userData.stats?.totalRevenue || 0,
            averageOrderValue: userData.stats?.averageOrderValue || 0,
            totalPayments: Object.values(paymentsByMethod).reduce((sum, m) => sum + m.count, 0),
            byMethod: paymentsByMethod,
            totalAmount,
          });
        }
      }
    } catch (error) {
      console.error('Erreur de chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const map: Record<string, JSX.Element> = {
      CASH:   <Banknote size={16} />,
      TMONEY: <Smartphone size={16} />,
      FLOOZ:  <Wallet size={16} />,
      CARD:   <CreditCard size={16} />,
      MOBILE: <Smartphone size={16} />,
      OTHER:  <Wallet size={16} />,
    };
    return map[method] || <Wallet size={16} />;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Espèces', TMONEY: 'TMoney', FLOOZ: 'Flooz',
      CARD: 'Carte bancaire', MOBILE: 'Mobile', OTHER: 'Autre',
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; dot: string; text: string }> = {
      DELIVERED: { label: 'Servie',      dot: 'bg-emerald-400', text: 'text-emerald-700' },
      PREPARING: { label: 'En prépa.',   dot: 'bg-blue-400',    text: 'text-blue-700'    },
      READY:     { label: 'Prête',       dot: 'bg-purple-400',  text: 'text-purple-700'  },
      CANCELLED: { label: 'Annulée',     dot: 'bg-red-400',     text: 'text-red-700'     },
      PENDING:   { label: 'En attente',  dot: 'bg-amber-400',   text: 'text-amber-700'   },
    };
    return config[status] || { label: status, dot: 'bg-gray-400', text: 'text-gray-700' };
  };

  if (!canAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Lock size={56} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux gérants et caissiers</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b px-6 py-4">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
        </header>
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-32" />
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-48" />
        </div>
      </div>
    );
  }

  const totalRevenue = orderStats?.totalRevenue || 0;
  const totalOrders = orderStats?.totalOrders || 0;
  const avgOrder = orderStats?.averageOrderValue || 0;
  const totalPayments = paymentStats?.totalAmount || 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isManager ? 'Tableau de Bord' : 'Mes Statistiques'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Rafraîchir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Chiffre d'affaires */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1" style={{ background: 'var(--color-primary)' }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                  <ArrowUpRight size={11} /> Aujourd'hui
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-0.5">
                {totalRevenue.toLocaleString()} <span className="text-base font-semibold text-gray-400">FCFA</span>
              </div>
              <div className="text-sm text-gray-500">Chiffre d'affaires</div>
            </div>
          </div>

          {/* Commandes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-blue-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={20} className="text-blue-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-0.5">
                {totalOrders}
              </div>
              <div className="text-sm text-gray-500">Commandes du jour</div>
            </div>
          </div>

          {/* Panier moyen */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-emerald-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Calculator size={20} className="text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Moyenne
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-0.5">
                {avgOrder.toLocaleString()} <span className="text-base font-semibold text-gray-400">FCFA</span>
              </div>
              <div className="text-sm text-gray-500">Panier moyen</div>
            </div>
          </div>
        </div>

        {/* Paiements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Répartition des paiements</h2>
            {paymentStats?.totalPayments ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {paymentStats.totalPayments} transaction{paymentStats.totalPayments > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>

          {paymentStats && paymentStats.byMethod && Object.keys(paymentStats.byMethod).length > 0 ? (
            <>
              <div className="space-y-3">
                {Object.entries(paymentStats.byMethod).map(([method, data]) => {
                  const pct = totalPayments > 0 ? (data.total / totalPayments * 100) : 0;
                  return (
                    <div key={method} className="flex items-center gap-4">
                      {/* Icône + label */}
                      <div className="flex items-center gap-2 w-36 flex-shrink-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500">
                          {getPaymentMethodIcon(method)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 leading-none">{getPaymentMethodLabel(method)}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{data.count} txn</div>
                        </div>
                      </div>
                      {/* Barre */}
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
                        />
                      </div>
                      {/* Montant */}
                      <div className="text-right w-36 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">{data.total.toLocaleString()} FCFA</span>
                        <span className="text-xs text-gray-400 ml-1.5">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total encaissé</span>
                <span className="text-xl font-extrabold" style={{ color: 'var(--color-secondary, #6b7280)' }}>
                  {totalPayments.toLocaleString()} FCFA
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">Aucun paiement aujourd'hui</p>
            </div>
          )}
        </div>

        {/* Commandes du jour */}
        {orderStats?.orders && orderStats.orders.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Commandes du jour</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Numéro</th>
                    <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Heure</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderStats.orders.slice(0, 10).map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                        <td className="py-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            {order.type === 'DINE_IN'  ? <Utensils size={12} /> :
                             order.type === 'TAKEAWAY' ? <ShoppingBag size={12} /> : <Bike size={12} />}
                            {order.type === 'DINE_IN' ? 'Sur place' :
                             order.type === 'TAKEAWAY' ? 'À emporter' : 'Livraison'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${badge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 text-sm font-bold text-right"
                          style={{ color: 'var(--color-secondary, #6b7280)' }}>
                          {Number(order.total).toLocaleString()} FCFA
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
