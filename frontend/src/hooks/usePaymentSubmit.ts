import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { ordersApi, paymentsApi } from '../services/api';
import { printReceipt } from '../utils/receiptPrinter';
import { toast } from '../store/toastStore';
import type { PaymentMethod } from '../types';

interface UsePaymentSubmitOptions {
onSuccess: () => void;
onClose: () => void;
}

// Logique de finalisation d'une vente (création commande → paiement →
// impression reçu → toast, avec annulation de la commande orpheline si le
// paiement échoue après coup), partagée entre le PaymentModal desktop et la
// sheet paiement mobile — un seul endroit à corriger pour le point le plus
// sensible de l'app (l'argent).
export function usePaymentSubmit({ onSuccess, onClose }: UsePaymentSubmitOptions) {
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

return {
total, change,
selectedMethod, setSelectedMethod,
amountPaid, setAmountPaid,
reference, setReference,
isProcessing, error,
handleQuickAmount, handlePayment,
};
}
