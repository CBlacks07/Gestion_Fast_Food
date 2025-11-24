import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppSettingsStore } from '../store/appSettingsStore';
import type { AppSettings, ApiResponse } from '../types';
import api, { API_BASE_URL } from '../services/api';

export default function AppSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const { setSettings: updateGlobalSettings } = useAppSettingsStore();

  useEffect(() => {
    if (!isAdmin) return;
    loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<AppSettings>>('/api/app-settings');
      if (response.data.success && response.data.data) {
        const settingsData = response.data.data;
        setFormData(settingsData);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.put('/api/app-settings', {
        ...formData,
        userId: user?.id,
      });

      if (response.data.success && response.data.data) {
        // Mettre à jour le store global pour appliquer immédiatement les changements
        updateGlobalSettings(response.data.data);
        alert('Paramètres sauvegardés avec succès ! Les modifications sont appliquées.');
        loadSettings();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);

      const formData = new FormData();
      formData.append('file', file);

      console.log('🔄 Upload du logo en cours...');
      const response = await api.post('/api/upload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        // Utiliser l'URL relative pour que Nginx puisse faire le proxy
        const logoUrl = response.data.data.url; // déjà au format '/uploads/...'
        console.log('✅ Logo uploadé avec succès. URL:', logoUrl);

        // Mettre à jour le formData local
        handleInputChange('logoUrl', logoUrl);

        // Auto-sauvegarder immédiatement pour appliquer le logo
        await handleSaveAfterLogoUpload(logoUrl);
      }
    } catch (error: any) {
      console.error('❌ Erreur upload logo:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'upload du logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveAfterLogoUpload = async (logoUrl: string) => {
    try {
      const response = await api.put('/api/app-settings', {
        ...formData,
        logoUrl,
        userId: user?.id,
      });

      if (response.data.success && response.data.data) {
        console.log('✅ Paramètres sauvegardés avec le nouveau logo');
        // Mettre à jour le store global pour appliquer immédiatement les changements
        updateGlobalSettings(response.data.data);
        alert('Logo uploadé et appliqué avec succès !');
        loadSettings();
      }
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde après upload:', error);
      alert('Logo uploadé mais erreur lors de la sauvegarde. Cliquez sur Sauvegarder pour appliquer.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser aux paramètres par défaut ?')) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post('/api/app-settings/reset', {
        userId: user?.id,
      });

      if (response.data.success && response.data.data) {
        // Mettre à jour le store global pour appliquer immédiatement les changements
        updateGlobalSettings(response.data.data);
        alert('Paramètres réinitialisés avec succès !');
        loadSettings();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux administrateurs</p>
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
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Paramètres de l'Application</h1>
            <p className="text-sm text-gray-500 mt-1">Personnalisez le nom, logo et branding de votre application</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
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
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Branding Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Identité de l'Application</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'application *
                  </label>
                  <input
                    type="text"
                    value={formData.appName || ''}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                    placeholder="Ex: Mon Restaurant"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ce nom apparaîtra dans toute l'application (titre, sidebar, page de connexion)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône / Emoji *
                  </label>
                  <input
                    type="text"
                    value={formData.appIcon || ''}
                    onChange={(e) => handleInputChange('appIcon', e.target.value)}
                    placeholder="Ex: 🍔"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez un emoji qui représente votre restaurant
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.slogan || ''}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Ex: La meilleure cuisine en ville"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de l'application
                  </label>
                  <div className="flex items-start gap-4">
                    {formData.logoUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="w-24 h-24 object-contain border border-gray-300 rounded-lg bg-white p-2"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {isUploadingLogo
                          ? 'Upload en cours...'
                          : 'Sélectionnez une image (JPG, PNG, GIF, WEBP - Max 5MB)'}
                      </p>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoUrl', '')}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Supprimer le logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Couleurs</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.primaryColor || '#ef4444'}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || ''}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#ef4444"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.secondaryColor || '#6b7280'}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || ''}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏢 Informations de l'Entreprise</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ex: Restaurant XYZ SARL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={formData.companyEmail || ''}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="Ex: contact@restaurant.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.companyPhone || ''}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    placeholder="Ex: +228 XX XX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={formData.companyAddress || ''}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    placeholder="Ex: 123 Rue Principale, Lomé"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Currency Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Paramètres Monétaires</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monnaie *
                  </label>
                  <input
                    type="text"
                    value={formData.currency || ''}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="Ex: FCFA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symbole de la monnaie *
                  </label>
                  <input
                    type="text"
                    value={formData.currencySymbol || ''}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    placeholder="Ex: FCFA, €, $"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxRate || 0}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                    placeholder="Ex: 18"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Receipt Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🧾 Paramètres de Reçus</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    En-tête de reçu
                  </label>
                  <textarea
                    value={formData.receiptHeader || ''}
                    onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
                    placeholder="Ex: Merci pour votre visite !"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pied de page de reçu
                  </label>
                  <textarea
                    value={formData.receiptFooter || ''}
                    onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                    placeholder="Ex: À bientôt !"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {formData.appName && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">👁️ Aperçu</h2>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{formData.appIcon || '🍔'}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{formData.appName}</h3>
                      {formData.slogan && (
                        <p className="text-sm text-gray-600">{formData.slogan}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {formData.companyName && <p><strong>Entreprise:</strong> {formData.companyName}</p>}
                    {formData.companyEmail && <p><strong>Email:</strong> {formData.companyEmail}</p>}
                    {formData.companyPhone && <p><strong>Téléphone:</strong> {formData.companyPhone}</p>}
                    {formData.companyAddress && <p><strong>Adresse:</strong> {formData.companyAddress}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
