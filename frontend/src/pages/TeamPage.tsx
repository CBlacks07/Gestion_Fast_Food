import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

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
    if (!isManager) {
      return;
    }
    loadAllStats();
  }, [selectedDate, isManager]);

  const loadAllStats = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsersStats(selectedDate);
      if (response.success && response.data) {
        setUserStats(response.data.users);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des statistiques');
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
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des détails');
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

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      CASH: '💵',
      TMONEY: '📱',
      FLOOZ: '📱',
      CARD: '💳',
      MOBILE: '📲',
      OTHER: '💰',
    };
    return icons[method] || '💰';
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
          <div className="text-6xl mb-4">🔒</div>
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
            <h1 className="text-2xl font-bold text-gray-900">👥 Équipe & Activités</h1>
            <p className="text-sm text-gray-500 mt-1">Statistiques et performances de l'équipe</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={loadAllStats}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {userStats.map((stat) => (
                <div
                  key={stat.user.id}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:border-primary-300 transition-all cursor-pointer"
                  onClick={() => loadUserDetails(stat.user.id)}
                >
                  {/* Header de la carte */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold text-lg">
                        {stat.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">
                          {stat.user.firstName && stat.user.lastName
                            ? `${stat.user.firstName} ${stat.user.lastName}`
                            : stat.user.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(stat.user.role)}`}>
                            {getRoleLabel(stat.user.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Commandes</span>
                      <span className="font-bold text-gray-900">
                        {stat.completedOrders} / {stat.totalOrders}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                      <span className="font-bold text-primary-600">
                        {stat.totalRevenue.toLocaleString()} FCFA
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Paiements traités</span>
                      <span className="font-bold text-green-600">
                        {stat.totalPayments.toLocaleString()} FCFA
                      </span>
                    </div>

                    {/* Progression */}
                    {stat.totalOrders > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Taux de complétion</span>
                          <span>{Math.round((stat.completedOrders / stat.totalOrders) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(stat.completedOrders / stat.totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      Voir les détails →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {!isLoading && userStats.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="font-medium">Aucune activité pour cette date</p>
            </div>
          )}
        </div>
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
          getPaymentMethodIcon={getPaymentMethodIcon}
          getPaymentMethodLabel={getPaymentMethodLabel}
        />
      )}
    </div>
  );
}

// Modal de détails utilisateur
function UserDetailsModal({
  stats,
  isLoading,
  onClose,
  getRoleLabel,
  getRoleBadgeColor,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
}: {
  stats: UserDetailedStats | null;
  isLoading: boolean;
  onClose: () => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeColor: (role: string) => string;
  getPaymentMethodIcon: (method: string) => string;
  getPaymentMethodLabel: (method: string) => string;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          {stats && (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {stats.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {stats.user.firstName && stats.user.lastName
                    ? `${stats.user.firstName} ${stats.user.lastName}`
                    : stats.user.username}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(stats.user.role)}`}>
                    {getRoleLabel(stats.user.role)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(stats.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Statistiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-2xl mb-1">📋</div>
                  <div className="text-2xl font-bold">{stats.stats.totalOrders}</div>
                  <div className="text-xs opacity-90">Commandes totales</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-2xl font-bold">{stats.stats.completedOrders}</div>
                  <div className="text-xs opacity-90">Complétées</div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <div className="text-2xl mb-1">❌</div>
                  <div className="text-2xl font-bold">{stats.stats.cancelledOrders}</div>
                  <div className="text-xs opacity-90">Annulées</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-lg font-bold">{stats.stats.totalRevenue.toLocaleString()} FCFA</div>
                  <div className="text-xs opacity-90">Chiffre d'affaires</div>
                </div>
              </div>

              {/* Panier moyen */}
              <div className="bg-white rounded-lg border-2 border-primary-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">🛒 Panier moyen</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {stats.stats.averageOrderValue.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Produits les plus vendus */}
              {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-4">🏆 Produits les plus vendus</h3>
                  <div className="space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.quantity} vendu{product.quantity > 1 ? 's' : ''} • {product.revenue.toLocaleString()} FCFA
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary-600">{product.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Répartition des paiements */}
              {stats.paymentsByMethod && Object.keys(stats.paymentsByMethod).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-4">💳 Répartition des paiements</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.paymentsByMethod).map(([method, data]) => (
                      <div key={method} className="flex items-center gap-3">
                        <div className="text-2xl">{getPaymentMethodIcon(method)}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{getPaymentMethodLabel(method)}</div>
                          <div className="text-xs text-gray-500">{data.count} transaction{data.count > 1 ? 's' : ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{data.total.toLocaleString()} FCFA</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des commandes récentes */}
              {stats.orders && stats.orders.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-4">📋 Commandes ({stats.orders.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' • '}
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{Number(order.total).toLocaleString()} FCFA</div>
                          <div className={`text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'text-green-600' :
                            order.status === 'CANCELLED' ? 'text-red-600' :
                            'text-yellow-600'
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
