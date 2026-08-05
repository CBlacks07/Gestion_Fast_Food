import { useState } from 'react';
import { Banknote, Smartphone, CreditCard, Wallet, Check, Loader2, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { usePaymentSubmit } from '../../hooks/usePaymentSubmit';
import MobileSheet from './MobileSheet';
import type { PaymentMethod } from '../../types';

interface MobilePaymentSheetProps {
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

export default function MobilePaymentSheet({ onClose, onSuccess }: MobilePaymentSheetProps) {
const [showSuccess, setShowSuccess] = useState(false);

// Sur mobile, "fin de paiement" affiche un écran de succès dans la sheet
// (comme la maquette) plutôt que de fermer immédiatement (comportement
// desktop) : onClose du hook déclenche l'écran de succès, pas la fermeture
// réelle de la sheet — la vraie fermeture est déclenchée par le bouton
// "Nouvelle commande" ci-dessous, qui appelle le vrai onClose de la sheet.
const {
total, change,
selectedMethod, setSelectedMethod,
amountPaid, setAmountPaid,
reference, setReference,
isProcessing, error,
handleQuickAmount, handlePayment,
} = usePaymentSubmit({ onSuccess, onClose: () => setShowSuccess(true) });

if (showSuccess) {
return (
<MobileSheet onClose={onClose}>
<div className="px-6 py-10 text-center">
<CheckCircle2 size={52} className="mx-auto text-green-500" />
<div className="text-base font-bold text-gray-900 mt-3">Paiement réussi</div>
<div className="text-sm text-gray-400 mt-1">Commande envoyée en cuisine</div>
<button
onClick={onClose}
className="mt-6 w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl"
>
Nouvelle commande
</button>
</div>
</MobileSheet>
);
}

return (
<MobileSheet onClose={onClose}>
<div className="px-4 pb-6">
<h2 className="text-base font-bold text-gray-900 py-2 flex items-center gap-2">
<CreditCard size={17} className="text-primary-500" />
Paiement
</h2>

<div className="bg-primary-50 rounded-xl p-4 text-center mb-4">
<div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total à payer</div>
<div className="text-2xl font-bold text-primary-600">{total.toLocaleString()} FCFA</div>
</div>

<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Méthode de paiement</div>
<div className="grid grid-cols-5 gap-1.5">
{PAYMENT_METHODS.map(({ value, label, Icon }) => (
<button
key={value}
onClick={() => setSelectedMethod(value)}
className={`py-2.5 rounded-lg border-2 flex flex-col items-center gap-1 ${selectedMethod === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
>
<Icon size={16} />
<span className="text-[10px] font-medium leading-tight text-center">{label}</span>
</button>
))}
</div>
</div>

{selectedMethod === 'CASH' && (
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Montant reçu</div>
<input
type="number"
value={amountPaid}
onChange={(e) => setAmountPaid(e.target.value)}
placeholder={total.toString()}
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base font-semibold outline-none focus:ring-2 focus:ring-primary-500"
/>
<div className="grid grid-cols-5 gap-1.5 mt-2">
{QUICK_AMOUNTS.map((amount) => (
<button
key={amount}
onClick={() => handleQuickAmount(amount)}
className="py-2 bg-gray-100 rounded-lg text-[11px] font-semibold"
>
+{amount >= 1000 ? `${amount / 1000}k` : amount}
</button>
))}
</div>
<button
onClick={() => setAmountPaid('')}
className="w-full mt-1.5 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
>
<RotateCcw size={11} />
Effacer
</button>
{change > 0 && (
<div className="mt-2.5 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
<span className="text-xs font-medium text-green-700">Monnaie à rendre</span>
<span className="text-base font-bold text-green-600">{change.toLocaleString()} FCFA</span>
</div>
)}
{change < 0 && amountPaid && (
<div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
<AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
<span className="text-xs text-red-700">Il manque {Math.abs(change).toLocaleString()} FCFA</span>
</div>
)}
</div>
)}

{selectedMethod !== 'CASH' && (
<div className="mb-4">
<div className="text-xs font-semibold text-gray-500 mb-2">Référence (optionnel)</div>
<input
type="text"
value={reference}
onChange={(e) => setReference(e.target.value)}
placeholder="Ex: TM123456789"
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
/>
</div>
)}

{error && (
<div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
<AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
<p className="text-sm text-red-700">{error}</p>
</div>
)}

<button
onClick={handlePayment}
disabled={isProcessing}
className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
>
{isProcessing ? (
<>
<Loader2 size={18} className="animate-spin" />
Traitement...
</>
) : (
<>
<Check size={18} />
Confirmer le paiement
</>
)}
</button>
</div>
</MobileSheet>
);
}
