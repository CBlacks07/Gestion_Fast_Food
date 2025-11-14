import { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Order, OrderStatus } from '../types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const statusOptions = [
    { value: 'all', label: 'Toutes', icon: '📋' },
    { value: 'PENDING', label: 'En attente', icon: '⏳' },
    { value: 'PREPARING', label: 'En préparation', icon: '👨‍🍳' },
    { value: 'READY', label: 'Prête', icon: '✅' },
    { value: 'DELIVERED', label: 'Livrée', icon: '🎉' },
    { value: 'CANCELLED', label: 'Annulée', icon: '❌' },
  ];

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await ordersApi.getAll(params);

      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!isAdmin) {
      alert('Seul un administrateur peut supprimer une commande');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      return;
    }

    try {
      // On utilise l'endpoint DELETE qui met le statut à CANCELLED
      await ordersApi.cancel(orderId);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      alert('Commande supprimée avec succès');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      alert('Erreur lors de la suppression de la commande');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      PENDING: 'En attente',
      PREPARING: 'En préparation',
      READY: 'Prête',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">📋 Historique des Commandes</h1>

          <button
            onClick={loadOrders}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Filtres de statut */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`
                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                ${selectedStatus === status.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {status.icon} {status.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucune commande</p>
            <p className="text-sm mt-1">Les commandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      <span className="font-medium">{item.quantity}x</span> {item.product.name}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-gray-400">
                      +{order.items.length - 3} autre(s)
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    {order.type === 'DINE_IN' ? '🍽️ Sur place' :
                     order.type === 'TAKEAWAY' ? '🥡 À emporter' : '🚗 Livraison'}
                    {order.table && ` - Table ${order.table.number}`}
                  </div>

                  <div className="font-bold text-primary-600">
                    {Number(order.total).toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la commande
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">En attente</option>
                  <option value="PREPARING">En préparation</option>
                  <option value="READY">Prête</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium">
                    {selectedOrder.type === 'DINE_IN' ? '🍽️ Sur place' :
                     selectedOrder.type === 'TAKEAWAY' ? '🥡 À emporter' : '🚗 Livraison'}
                  </div>
                </div>

                {selectedOrder.table && (
                  <div>
                    <div className="text-sm text-gray-500">Table</div>
                    <div className="font-medium">Table {selectedOrder.table.number}</div>
                  </div>
                )}

                {selectedOrder.customerName && (
                  <div>
                    <div className="text-sm text-gray-500">Client</div>
                    <div className="font-medium">{selectedOrder.customerName}</div>
                  </div>
                )}

                {selectedOrder.customerPhone && (
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div className="font-medium">{selectedOrder.customerPhone}</div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.quantity}x {item.product.name}
                        </div>
                        {item.options && item.options.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.options.map(opt => opt.option.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-sm text-gray-500 italic mt-1">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {Number(item.total).toLocaleString()} FCFA
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{Number(selectedOrder.subtotal).toLocaleString()} FCFA</span>
                </div>

                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{Number(selectedOrder.discount).toLocaleString()} FCFA</span>
                  </div>
                )}

                {Number(selectedOrder.tax) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes</span>
                    <span>{Number(selectedOrder.tax).toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{Number(selectedOrder.total).toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Paiements */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Paiements</h3>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.method === 'CASH' ? '💵 Espèces' :
                             payment.method === 'TMONEY' ? '📱 TMoney' :
                             payment.method === 'FLOOZ' ? '📱 Flooz' :
                             payment.method === 'CARD' ? '💳 Carte' : '📲 Mobile'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <div className="font-semibold text-green-600">
                          {Number(payment.amount).toLocaleString()} FCFA
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton de suppression (Admin uniquement) */}
              {isAdmin && selectedOrder.status !== 'CANCELLED' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer la commande</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ⚠️ Cette action est irréversible (Admin uniquement)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
