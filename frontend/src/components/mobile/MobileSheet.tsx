import { ReactNode } from 'react';

interface MobileSheetProps {
onClose: () => void;
children: ReactNode;
maxHeight?: string;
}

// Tiroir bas générique (fond assombri + carte arrondie glissée depuis le
// bas), utilisé par toutes les sheets mobiles : panier, paiement, détails,
// formulaires de création/édition, menu "Plus". Le header/corps/pied de
// chaque sheet est laissé à l'appelant (children) pour rester flexible.
export default function MobileSheet({ onClose, children, maxHeight = '85vh' }: MobileSheetProps) {
return (
<div className="fixed inset-0 z-50 flex items-end justify-center">
<div
className="absolute inset-0 bg-black/40"
onClick={onClose}
/>
<div
className="relative w-full bg-white rounded-t-[22px] shadow-2xl flex flex-col animate-slide-up-sheet"
style={{ maxHeight }}
>
<div className="flex items-center justify-center pt-2 flex-shrink-0">
<div className="w-9 h-1 bg-gray-200 rounded-full" />
</div>
<div className="flex-1 overflow-y-auto overscroll-contain">
{children}
</div>
</div>
</div>
);
}
