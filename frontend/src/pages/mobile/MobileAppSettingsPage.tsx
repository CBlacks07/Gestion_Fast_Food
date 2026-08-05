import { useState, useEffect } from 'react';
import { Lock, Loader2, Settings, Save, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { toast } from '../../store/toastStore';
import ConfirmDialog from '../../components/ConfirmDialog';
import MobileImageUpload from '../../components/mobile/MobileImageUpload';
import type { AppSettings, ApiResponse } from '../../types';

export default function MobileAppSettingsPage() {
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [formData, setFormData] = useState<Partial<AppSettings>>({});
const [showResetConfirm, setShowResetConfirm] = useState(false);

const user = useAuthStore((state) => state.user);
const isAdmin = user?.role === 'ADMIN';
const setGlobalSettings = useAppSettingsStore((state) => state.setSettings);

useEffect(() => {
if (!isAdmin) return;
loadSettings();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAdmin]);

const loadSettings = async () => {
try {
setIsLoading(true);
const response = await api.get<ApiResponse<AppSettings>>('/api/app-settings');
if (response.data.success && response.data.data) setFormData(response.data.data);
} catch (error) {
console.error(error);
toast.error('Erreur lors du chargement des paramètres');
} finally {
setIsLoading(false);
}
};

const handleChange = (field: keyof AppSettings, value: any) => {
setFormData((prev) => ({ ...prev, [field]: value }));
};

const handleSave = async (overrides?: Partial<AppSettings>) => {
try {
setIsSaving(true);
const payload = { ...formData, ...overrides, userId: user?.id };
const response = await api.put('/api/app-settings', payload);
if (response.data.success && response.data.data) {
setGlobalSettings(response.data.data);
setFormData(response.data.data);
toast.success('Paramètres sauvegardés avec succès');
}
} catch (error: any) {
toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
} finally {
setIsSaving(false);
}
};

// L'upload du logo sauvegarde immédiatement (comme desktop) — pas besoin de
// cliquer sur "Sauvegarder" après, contrairement à sa suppression.
const handleLogoUploaded = async (url: string) => {
handleChange('logoUrl', url);
await handleSave({ logoUrl: url });
};

const handleReset = async () => {
try {
setIsSaving(true);
const response = await api.post('/api/app-settings/reset', { userId: user?.id });
if (response.data.success && response.data.data) {
setGlobalSettings(response.data.data);
setFormData(response.data.data);
toast.success('Paramètres réinitialisés');
}
} catch (error) {
toast.error('Erreur lors de la réinitialisation');
} finally {
setIsSaving(false);
setShowResetConfirm(false);
}
};

if (!isAdmin) {
return (
<div className="h-full flex items-center justify-center">
<div className="text-center px-6">
<Lock size={44} className="text-gray-300 mx-auto mb-3" />
<h2 className="text-base font-bold text-gray-900 mb-1">Accès restreint</h2>
<p className="text-sm text-gray-500">Réservé aux administrateurs</p>
</div>
</div>
);
}

if (isLoading) {
return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={28} /></div>;
}

return (
<div className="h-full flex flex-col">
<div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
<button onClick={() => setShowResetConfirm(true)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 flex items-center justify-center gap-1.5">
<RotateCcw size={13} />
Réinitialiser
</button>
<button onClick={() => handleSave()} disabled={isSaving} className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary-600 flex items-center justify-center gap-1.5 disabled:opacity-50">
{isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
Sauvegarder
</button>
</div>

<div className="flex-1 overflow-y-auto p-3 space-y-3 pb-6">
{formData.appName && (
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
<span className="text-3xl">{formData.appIcon || '🍽️'}</span>
<div className="min-w-0">
<div className="text-sm font-bold text-gray-900 truncate">{formData.appName}</div>
{formData.slogan && <div className="text-xs text-gray-400 truncate">{formData.slogan}</div>}
</div>
</div>
)}

<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Settings size={14} />Identité</h2>
<div className="space-y-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Nom de l'application *</div>
<input type="text" value={formData.appName || ''} onChange={(e) => handleChange('appName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Icône / Emoji *</div>
<input type="text" maxLength={4} value={formData.appIcon || ''} onChange={(e) => handleChange('appIcon', e.target.value)} className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg text-xl text-center outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Slogan</div>
<input type="text" value={formData.slogan || ''} onChange={(e) => handleChange('slogan', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<MobileImageUpload
label="Logo"
imageUrl={formData.logoUrl}
endpoint="/api/upload/logo"
onChange={handleLogoUploaded}
onClear={() => handleChange('logoUrl', '')}
/>
</div>
</div>

<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3">Couleurs</h2>
<div className="space-y-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Couleur principale *</div>
<div className="flex items-center gap-2">
<input type="color" value={formData.primaryColor || '#ef4444'} onChange={(e) => handleChange('primaryColor', e.target.value)} className="h-10 w-16 rounded border border-gray-300" />
<input type="text" value={formData.primaryColor || ''} onChange={(e) => handleChange('primaryColor', e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Couleur secondaire</div>
<div className="flex items-center gap-2">
<input type="color" value={formData.secondaryColor || '#6b7280'} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="h-10 w-16 rounded border border-gray-300" />
<input type="text" value={formData.secondaryColor || ''} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
</div>
</div>

<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3">Informations de l'entreprise</h2>
<div className="space-y-3">
<input type="text" placeholder="Nom de l'entreprise" value={formData.companyName || ''} onChange={(e) => handleChange('companyName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
<input type="email" placeholder="Email de contact" value={formData.companyEmail || ''} onChange={(e) => handleChange('companyEmail', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
<input type="tel" placeholder="Téléphone" value={formData.companyPhone || ''} onChange={(e) => handleChange('companyPhone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
<textarea placeholder="Adresse" value={formData.companyAddress || ''} onChange={(e) => handleChange('companyAddress', e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
</div>
</div>

<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3">Paramètres monétaires</h2>
<div className="space-y-3">
<div className="grid grid-cols-2 gap-3">
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Monnaie *</div>
<input type="text" value={formData.currency || ''} onChange={(e) => handleChange('currency', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Symbole *</div>
<input type="text" value={formData.currencySymbol || ''} onChange={(e) => handleChange('currencySymbol', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
<div>
<div className="text-xs font-semibold text-gray-500 mb-1.5">Taux de TVA (%)</div>
<input type="number" step="0.01" min={0} max={100} value={formData.taxRate ?? ''} onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
</div>
</div>
</div>

<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
<h2 className="text-sm font-bold text-gray-900 mb-3">Paramètres de reçus</h2>
<div className="space-y-3">
<textarea placeholder="En-tête de reçu" value={formData.receiptHeader || ''} onChange={(e) => handleChange('receiptHeader', e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
<textarea placeholder="Pied de page de reçu" value={formData.receiptFooter || ''} onChange={(e) => handleChange('receiptFooter', e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
</div>
</div>
</div>

{showResetConfirm && (
<ConfirmDialog
title="Réinitialiser les paramètres"
message="Tous les paramètres (branding, couleurs, entreprise, reçus) reviendront aux valeurs par défaut. Cette action est irréversible."
confirmLabel="Réinitialiser"
variant="danger"
onConfirm={handleReset}
onCancel={() => setShowResetConfirm(false)}
/>
)}
</div>
);
}
