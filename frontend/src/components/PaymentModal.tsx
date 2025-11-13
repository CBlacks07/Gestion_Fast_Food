import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { ordersApi, paymentsApi } from '../services/api';
import type { PaymentMethod } from '../types';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const {
    items,
    orderType,
    tableId,
    customerName,
    customerPhone,
    notes,
    getTotal,
    clear,
  } = useCartStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'CASH', label: 'Espèces', icon: '💵' },
    { value: 'TMONEY', label: 'TMoney', icon: '📱' },
    { value: 'FLOOZ', label: 'Flooz', icon: '📱' },
    { value: 'CARD', label: 'Carte', icon: '💳' },
    { value: 'MOBILE', label: 'Mobile', icon: '📲' },
  ];

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const amount = parseFloat(amountPaid) || total;

      if (amount < total) {
        setError('Le montant payé est insuffisant');
        return;
      }

      // 1. Créer la commande
      const orderData = {
        type: orderType,
        tableId,
        customerName,
        customerPhone,
        notes,
        userId: 'temp-user-id', // TODO: Remplacer par l'ID utilisateur réel
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
          options: item.selectedOptions.map((opt) => ({
            optionId: opt.option.id,
          })),
        })),
      };

      const orderResponse = await ordersApi.create(orderData);

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Erreur lors de la création de la commande');
      }

      const order = orderResponse.data;

      // 2. Créer le paiement
      const paymentData = {
        orderId: order.id,
        method: selectedMethod,
        amount: total,
        reference: reference || undefined,
        userId: 'temp-user-id', // TODO: Remplacer par l'ID utilisateur réel
      };

      const paymentResponse = await paymentsApi.create(paymentData);

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || 'Erreur lors du paiement');
      }

      // 3. Succès - Vider le panier et fermer
      clear();
      onSuccess();
      onClose();

      // Afficher un message de succès
      alert(`Commande créée avec succès !\nNuméro: ${order.orderNumber}\nTotal: ${total.toLocaleString()} FCFA${amount > total ? `\nRendu: ${(amount - total).toLocaleString()} FCFA` : ''}`);

    } catch (err: any) {
      console.error('Erreur de paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const change = parseFloat(amountPaid) - total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total à payer */}
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total à payer</div>
            <div className="text-3xl font-bold text-primary-600">
              {total.toLocaleString()} FCFA
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-colors
                    ${selectedMethod === method.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-xs font-medium">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Montant payé (pour espèces) */}
          {selectedMethod === 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant payé (optionnel)
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={total.toString()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {change > 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Rendu à rendre: </span>
                  <span className="font-bold text-green-600">
                    {change.toLocaleString()} FCFA
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Référence (pour paiements électroniques) */}
          {selectedMethod !== 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence de transaction (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: TM123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <span>Confirmer le paiement</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
