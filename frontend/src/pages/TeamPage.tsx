import { useState, useEffect } from 'react';
import { RefreshCw, Lock, BarChart2, X, Loader2, TrendingUp, ShoppingBag, CreditCard, Award } from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';

interface UserStats {
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalPayments: number;
}

interface UserDetailedStats {
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  date: string;
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  orders: any[];
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentsByMethod: Record<string, { count: number; total: number }>;
}

export default function TeamPage() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetailedStats, setUserDetailedStats] = useState<UserDetailedStats | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (!isManager) return;
    loadAllStats();
  }, [selectedDate, isManager]);

  const loadAllStats = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsersStats(selectedDate);
      if (response.success && response.data) {
        const filteredUsers = response.data.users.filter((stat: UserStats) => stat.user.role !== 'ADMIN');
        setUserStats(filteredUsers);
      }
    } catch {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      setIsLoadingDetails(true);
      setSelectedUser(userId);
      const response = await usersApi.getUserStats(userId, selectedDate);
      if (response.success && response.data) {
        setUserDetailedStats(response.data);
      }
    } catch {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      MANAGER: 'bg-purple-100 text-purple-700',
      CASHIER: 'bg-blue-100 text-blue-700',
      KITCHEN: 'bg-green-100 text-green-700',
      WAITER: 'bg-yellow-100 text-yellow-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      MANAGER: 'Gérant',
      CASHIER: 'Caissier',
      KITCHEN: 'Cuisine',
      WAITER: 'Serveur',
    };
    return labels[role] || role;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      TMONEY: 'TMoney',
      FLOOZ: 'Flooz',
      CARD: 'Carte bancaire',
      MOBILE: 'Mobile',
      OTHER: 'Autre',
    };
    return labels[method] || method;
  };

  if (!isManager) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Lock size={56} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux gérants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Équipe & Activités</h1>
            <p className="text-sm text-gray-500 mt-1">Statistiques et performances de l'équipe</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={loadAllStats}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={15} />
              Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : userStats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BarChart2 size={56} strokeWidth={1.2} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Aucune activité pour cette date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {userStats.map((stat) => {
              const completionRate = stat.totalOrders > 0
                ? Math.round((stat.completedOrders / stat.totalOrders) * 100)
                : 0;
              const displayName = stat.user.firstName && stat.user.lastName
                ? `${stat.user.firstName} ${stat.user.lastName}`
                : stat.user.username;
              const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

              return (
                <div
                  key={stat.user.id}
                  onClick={() => loadUserDetails(stat.user.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  {/* Accent bar */}
                  <div className="h-1" style={{ background: 'var(--color-primary, #e05252)' }} />

                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: 'var(--color-primary, #e05252)' }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{displayName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(stat.user.role)}`}>
                        {getRoleLabel(stat.user.role)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-5 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="text-xs text-gray-500 mb-0.5">Commandes</div>
                        <div className="font-bold text-gray-900">
                          {stat.completedOrders}
                          <span className="text-gray-400 font-normal text-sm"> / {stat.totalOrders}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="text-xs text-gray-500 mb-0.5">Complétion</div>
                        <div className="font-bold text-gray-900">{completionRate}%</div>
                      </div>
                    </div>

                    {/* Progression bar */}
                    {stat.totalOrders > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${completionRate}%`,
                            background: completionRate >= 80 ? '#22c55e' : completionRate >= 50 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-xs text-gray-500">Chiffre d'affaires</div>
                        <div className="font-bold text-sm" style={{ color: 'var(--color-primary, #e05252)' }}>
                          {stat.totalRevenue.toLocaleString()} F
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Paiements</div>
                        <div className="font-bold text-sm text-green-600">
                          {stat.totalPayments.toLocaleString()} F
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-gray-50 border-t">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-primary, #e05252)' }}>
                      Voir les détails →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de détails utilisateur */}
      {selectedUser && (
        <UserDetailsModal
          stats={userDetailedStats}
          isLoading={isLoadingDetails}
          onClose={() => {
            setSelectedUser(null);
            setUserDetailedStats(null);
          }}
          getRoleLabel={getRoleLabel}
          getRoleBadgeColor={getRoleBadgeColor}
          getPaymentMethodLabel={getPaymentMethodLabel}
        />
      )}
    </div>
  );
}

function UserDetailsModal({
  stats,
  isLoading,
  onClose,
  getRoleLabel,
  getRoleBadgeColor,
  getPaymentMethodLabel,
}: {
  stats: UserDetailedStats | null;
  isLoading: boolean;
  onClose: () => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeColor: (role: string) => string;
  getPaymentMethodLabel: (method: string) => string;
}) {
  const displayName = stats
    ? (stats.user.firstName && stats.user.lastName
      ? `${stats.user.firstName} ${stats.user.lastName}`
      : stats.user.username)
    : '';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-1" style={{ background: 'var(--color-primary, #e05252)' }} />
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0">
          {stats && (
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ background: 'var(--color-primary, #e05252)' }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(stats.user.role)}`}>
                    {getRoleLabel(stats.user.role)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(stats.date).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
          ) : stats ? (
            <div className="space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={16} className="text-blue-500" />
                    <span className="text-xs text-gray-500 font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.stats.totalOrders}</div>
                  <div className="text-xs text-gray-400 mt-0.5">commandes</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xs text-gray-500 font-medium">Complétées</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.stats.completedOrders}</div>
                  <div className="text-xs text-gray-400 mt-0.5">commandes</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <X size={16} className="text-red-500" />
                    <span className="text-xs text-gray-500 font-medium">Annulées</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500">{stats.stats.cancelledOrders}</div>
                  <div className="text-xs text-gray-400 mt-0.5">commandes</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={16} style={{ color: 'var(--color-primary, #e05252)' }} />
                    <span className="text-xs text-gray-500 font-medium">CA</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary, #e05252)' }}>
                    {stats.stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">FCFA</div>
                </div>
              </div>

              {/* Panier moyen */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <Award size={18} style={{ color: 'var(--color-primary, #e05252)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Panier moyen</div>
                    <div className="text-xs text-gray-400">Valeur moyenne par commande</div>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary, #e05252)' }}>
                  {stats.stats.averageOrderValue.toLocaleString()} F
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Produits les plus vendus */}
                {stats.topProducts && stats.topProducts.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Produits les plus vendus</h3>
                    <div className="space-y-2.5">
                      {stats.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{product.name}</div>
                            <div className="text-xs text-gray-400">{product.revenue.toLocaleString()} F</div>
                          </div>
                          <div className="font-bold text-sm" style={{ color: 'var(--color-primary, #e05252)' }}>
                            ×{product.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Répartition des paiements */}
                {stats.paymentsByMethod && Object.keys(stats.paymentsByMethod).length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Répartition des paiements</h3>
                    <div className="space-y-2.5">
                      {Object.entries(stats.paymentsByMethod).map(([method, data]) => (
                        <div key={method} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{getPaymentMethodLabel(method)}</div>
                            <div className="text-xs text-gray-400">{data.count} transaction{data.count > 1 ? 's' : ''}</div>
                          </div>
                          <div className="font-bold text-sm text-gray-900">{data.total.toLocaleString()} F</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Liste des commandes */}
              {stats.orders && stats.orders.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Commandes ({stats.orders.length})
                  </h3>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {stats.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-sm">#{order.orderNumber}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-sm">{Number(order.total).toLocaleString()} F</div>
                          <div className={`text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'text-green-600' :
                            order.status === 'CANCELLED' ? 'text-red-500' : 'text-amber-500'
                          }`}>
                            {order.status === 'DELIVERED' ? 'Livrée' :
                              order.status === 'CANCELLED' ? 'Annulée' :
                              order.status === 'PREPARING' ? 'En préparation' :
                              order.status === 'READY' ? 'Prête' : order.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
