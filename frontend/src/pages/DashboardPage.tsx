import { useState, useEffect } from 'react';
import { ordersApi, paymentsApi, usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalPayments: number;
  byMethod: Record<string, { count: number; total: number }>;
}

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<Stats | null>(null);
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
        // Gérant : stats globales
        const [ordersResponse, paymentsResponse] = await Promise.all([
          ordersApi.getTodayStats(),
          paymentsApi.getTodayStats(),
        ]);

        if (ordersResponse.success && ordersResponse.data) {
          setOrderStats(ordersResponse.data);
        }

        if (paymentsResponse.success && paymentsResponse.data) {
          setPaymentStats(paymentsResponse.data);
        }
      } else if (isCashier) {
        // Caissier : stats personnelles
        const today = new Date().toISOString().split('T')[0];
        const statsResponse = await usersApi.getUserStats(user.id, today);

        if (statsResponse.success && statsResponse.data) {
          setOrderStats(statsResponse.data);
          setPaymentStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Erreur de chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (!canAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux gérants et caissiers</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Chargement...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              📊 {isManager ? 'Tableau de Bord' : 'Mes Statistiques'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isManager ? 'Statistiques globales' : 'Statistiques personnelles'} du {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button
            onClick={loadStats}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total des ventes */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">💰</div>
              <div className="text-primary-100 text-sm font-medium">Aujourd'hui</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {(orderStats?.totalRevenue || 0).toLocaleString()} FCFA
            </div>
            <div className="text-primary-100 text-sm">Chiffre d'affaires</div>
          </div>

          {/* Nombre de commandes */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🧾</div>
              <div className="text-gray-500 text-sm font-medium">Total</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {orderStats?.totalOrders || 0}
            </div>
            <div className="text-gray-500 text-sm">Commandes</div>
          </div>

          {/* Panier moyen */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🛒</div>
              <div className="text-gray-500 text-sm font-medium">Moyenne</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(orderStats?.averageOrderValue || 0).toLocaleString()} FCFA
            </div>
            <div className="text-gray-500 text-sm">Panier moyen</div>
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition des paiements</h2>

          {paymentStats && Object.keys(paymentStats.byMethod).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(paymentStats.byMethod).map(([method, data]) => {
                const percentage = paymentStats.totalAmount > 0
                  ? (data.total / paymentStats.totalAmount * 100).toFixed(1)
                  : 0;

                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPaymentMethodIcon(method)}</span>
                        <span className="font-medium text-gray-900">
                          {getPaymentMethodLabel(method)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({data.count} transaction{data.count > 1 ? 's' : ''})
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {data.total.toLocaleString()} FCFA
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div className="font-bold text-gray-900 text-lg">Total des paiements</div>
                <div className="text-right">
                  <div className="font-bold text-primary-600 text-xl">
                    {(paymentStats.totalAmount || 0).toLocaleString()} FCFA
                  </div>
                  <div className="text-sm text-gray-500">
                    {paymentStats.totalPayments} transaction{paymentStats.totalPayments > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="font-medium">Aucun paiement aujourd'hui</p>
              <p className="text-sm mt-1">Les statistiques apparaîtront ici</p>
            </div>
          )}
        </div>

        {/* Commandes récentes */}
        {orderStats && orderStats.orders && orderStats.orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes du jour</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderStats.orders.slice(0, 10).map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {order.type === 'DINE_IN' ? '🍽️ Sur place' :
                         order.type === 'TAKEAWAY' ? '🥡 À emporter' : '🚗 Livraison'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`
                          text-xs font-medium px-2 py-1 rounded
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'READY' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {order.status === 'DELIVERED' ? 'Livrée' :
                           order.status === 'PREPARING' ? 'En préparation' :
                           order.status === 'READY' ? 'Prête' :
                           order.status === 'CANCELLED' ? 'Annulée' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                        {Number(order.total).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
