import { useState } from 'react';
import { Banknote, Smartphone, CreditCard, Wallet, X, Check, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { ordersApi, paymentsApi } from '../services/api';
import { printReceipt } from '../utils/receiptPrinter';
import { toast } from '../store/toastStore';
import type { PaymentMethod } from '../types';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type LucideIcon = typeof Banknote;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; Icon: LucideIcon }[] = [
  { value: 'CASH',   label: 'Espèces', Icon: Banknote },
  { value: 'TMONEY', label: 'TMoney',  Icon: Smartphone },
  { value: 'FLOOZ',  label: 'Flooz',   Icon: Wallet },
  { value: 'CARD',   label: 'Carte',   Icon: CreditCard },
  { value: 'MOBILE', label: 'Mobile',  Icon: Smartphone },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const { items, orderType, tableId, customerName, customerPhone, notes, getTotal, clear } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const appSettings = useAppSettingsStore((state) => state.settings);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const change = selectedMethod === 'CASH' && amountPaid ? parseFloat(amountPaid) - total : 0;

  const handleQuickAmount = (amount: number) => {
    const current = parseFloat(amountPaid) || 0;
    setAmountPaid((current + amount).toString());
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const amount = parseFloat(amountPaid) || total;

      if (items.length === 0) {
        setError('Le panier est vide');
        return;
      }

      if (selectedMethod === 'CASH' && amount < total) {
        setError('Le montant payé est insuffisant');
        return;
      }

      if (!user?.id) {
        setError('Utilisateur non authentifié');
        return;
      }

      const orderData = {
        type: orderType, tableId, customerName, customerPhone, notes, userId: user.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
          options: item.selectedOptions.map((opt) => ({ optionId: opt.option.id })),
        })),
      };

      const orderResponse = await ordersApi.create(orderData);
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Erreur lors de la création de la commande');
      }
      const order = orderResponse.data;

      let paymentResponse;
      try {
        paymentResponse = await paymentsApi.create({
          orderId: order.id, method: selectedMethod, amount: total,
          reference: reference || undefined, userId: user.id,
        });
      } catch (paymentErr) {
        // Le paiement a échoué après création de la commande : on annule la commande
        // pour éviter une commande orpheline impayée (et réapprovisionner le stock).
        await ordersApi.cancel(order.id, user.id).catch(() => undefined);
        throw paymentErr;
      }
      if (!paymentResponse.success) {
        await ordersApi.cancel(order.id, user.id).catch(() => undefined);
        throw new Error(paymentResponse.error || 'Erreur lors du paiement');
      }

      const cashChange = selectedMethod === 'CASH' ? amount - total : 0;
      printReceipt(order, appSettings, amount, cashChange);

      clear();
      onSuccess();
      onClose();

      if (selectedMethod === 'CASH' && cashChange > 0) {
        toast.success(`Commande ${order.orderNumber} créée ! Monnaie à rendre : ${cashChange.toLocaleString()} FCFA`, 6000);
      } else {
        toast.success(`Commande ${order.orderNumber} créée avec succès !`);
      }

    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-primary-500" />
            Paiement
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total */}
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total à payer</div>
            <div className="text-3xl font-bold text-primary-600">{total.toLocaleString()} FCFA</div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
            <div className="grid grid-cols-5 gap-1.5">
              {PAYMENT_METHODS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedMethod(value)}
                  className={`
                    py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5
                    ${selectedMethod === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calculette espèces */}
          {selectedMethod === 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant reçu</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={total.toString()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
              />

              <div className="mt-2.5">
                <div className="text-xs text-gray-400 mb-1.5">Montants rapides</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      +{amount >= 1000 ? `${amount / 1000}k` : amount}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAmountPaid('')}
                  className="w-full mt-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <RotateCcw size={12} />
                  Effacer
                </button>
              </div>

              {change > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Monnaie à rendre</span>
                  <span className="text-xl font-bold text-green-600">{change.toLocaleString()} FCFA</span>
                </div>
              )}
              {change < 0 && amountPaid && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">Il manque {Math.abs(change).toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
          )}

          {/* Référence paiement électronique */}
          {selectedMethod !== 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence de transaction <span className="text-gray-400 font-normal">(optionnel)</span>
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
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Confirmer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
