import { useState, useEffect } from 'react';
import { closuresApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Closure {
  id: string;
  date: string;
  closedAt: string;
  closedBy: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalCash: number;
  totalTmoney: number;
  totalFlooz: number;
  totalCard: number;
  totalMobile: number;
  totalOther: number;
  detailedReport: string;
  notes?: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function ClosuresPage() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClosure, setSelectedClosure] = useState<Closure | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (user) {
      loadClosures();
    }
  }, [user]);

  const loadClosures = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Si admin: charger toutes les clôtures
      // Si utilisateur normal: charger seulement les siennes
      const response = await closuresApi.getAll(isManager ? undefined : user.id);
      if (response.success && response.data) {
        setClosures(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des clôtures');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔒 Clôture de Journée</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isManager
                ? 'Consultez toutes les clôtures journalières'
                : 'Clôturez votre journée de travail'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Nouvelle clôture
            </button>
            <button
              onClick={loadClosures}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : closures.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune clôture</h3>
            <p className="text-gray-500 mb-4">
              {isManager
                ? 'Aucune clôture n\'a encore été effectuée'
                : 'Vous n\'avez pas encore effectué de clôture'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Créer une clôture
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closures.map((closure) => {
              const closureDate = new Date(closure.date);
              const closedAtDate = new Date(closure.closedAt);

              return (
                <div
                  key={closure.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedClosure(closure);
                    setShowDetailModal(true);
                  }}
                >
                  {/* Date */}
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {closureDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Clôturé le {closedAtDate.toLocaleString('fr-FR')}
                    </div>
                  </div>

                  {/* User (si admin) */}
                  {isManager && (
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Par:</span>
                      <span className="font-medium text-gray-900">
                        {closure.user.firstName && closure.user.lastName
                          ? `${closure.user.firstName} ${closure.user.lastName}`
                          : closure.user.username}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenus</span>
                      <span className="font-semibold text-green-600">
                        {Number(closure.totalRevenue).toLocaleString()} F CFA
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Commandes</span>
                      <span className="font-medium text-gray-900">
                        {closure.totalOrders} ({closure.completedOrders} complétées)
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {closure.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-500 line-clamp-2">
                        📝 {closure.notes}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-4 text-sm text-primary-600 font-medium">
                    Voir le rapport complet →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateClosureModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadClosures();
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedClosure && (
        <ClosureDetailModal
          closure={selectedClosure}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClosure(null);
          }}
        />
      )}
    </div>
  );
}

// Modal de création de clôture
function CreateClosureModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkIfExists();
  }, [selectedDate]);

  const checkIfExists = async () => {
    if (!user) return;

    try {
      const response = await closuresApi.checkExists(selectedDate, user.id);
      if (response.success && response.data) {
        setAlreadyExists(response.data.exists);
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
    }
  };

  const handleCreate = async () => {
    if (!user) return;

    if (alreadyExists) {
      alert('Vous avez déjà clôturé cette journée');
      return;
    }

    try {
      setIsCreating(true);
      const response = await closuresApi.create({
        date: selectedDate,
        userId: user.id,
        notes: notes.trim() || undefined,
      });

      if (response.success) {
        alert('Clôture créée avec succès!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erreur création:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la clôture');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nouvelle clôture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de clôture
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {alreadyExists && (
              <p className="mt-2 text-sm text-red-600">
                ⚠️ Vous avez déjà clôturé cette journée
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ajoutez des notes sur cette journée..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div className="text-sm text-yellow-800">
                <strong>Attention:</strong> La clôture calculera automatiquement toutes vos transactions pour la journée sélectionnée.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isCreating}
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || alreadyExists}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Création...' : 'Créer la clôture'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de détail de clôture (avec impression)
function ClosureDetailModal({ closure, onClose }: { closure: Closure; onClose: () => void }) {
  const closureDate = new Date(closure.date);
  const closedAtDate = new Date(closure.closedAt);

  let detailedReport: any = {};
  try {
    detailedReport = JSON.parse(closure.detailedReport);
  } catch (e) {
    console.error('Error parsing detailed report:', e);
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = closureDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport de Clôture - ${date}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
              color: #2563eb;
              font-size: 28px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              color: #374151;
            }
            .stat-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 15px;
            }
            .stat-box {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .stat-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
            }
            .total {
              background-color: #dbeafe;
              font-weight: bold;
            }
            .notes {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin-top: 15px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>🔒 Rapport de Clôture de Journée</h1>
          <div class="subtitle">
            ${date}<br>
            Clôturé le ${closedAtDate.toLocaleString('fr-FR')}<br>
            Par ${closure.user.firstName && closure.user.lastName ? `${closure.user.firstName} ${closure.user.lastName}` : closure.user.username}
          </div>

          <div class="section">
            <div class="section-title">📊 Statistiques Globales</div>
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-label">Chiffre d'affaires</div>
                <div class="stat-value" style="color: #059669;">${Number(closure.totalRevenue).toLocaleString()} F</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Commandes totales</div>
                <div class="stat-value">${closure.totalOrders}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Commandes complétées</div>
                <div class="stat-value" style="color: #2563eb;">${closure.completedOrders}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Commandes annulées</div>
                <div class="stat-value" style="color: #dc2626;">${closure.cancelledOrders}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💰 Répartition par Mode de Paiement</div>
            <table>
              <thead>
                <tr>
                  <th>Mode de paiement</th>
                  <th style="text-align: right;">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>💵 Espèces</td><td style="text-align: right;">${Number(closure.totalCash).toLocaleString()} F CFA</td></tr>
                <tr><td>📱 TMoney</td><td style="text-align: right;">${Number(closure.totalTmoney).toLocaleString()} F CFA</td></tr>
                <tr><td>📱 Flooz</td><td style="text-align: right;">${Number(closure.totalFlooz).toLocaleString()} F CFA</td></tr>
                <tr><td>💳 Carte</td><td style="text-align: right;">${Number(closure.totalCard).toLocaleString()} F CFA</td></tr>
                <tr><td>📲 Mobile</td><td style="text-align: right;">${Number(closure.totalMobile).toLocaleString()} F CFA</td></tr>
                <tr><td>🔄 Autre</td><td style="text-align: right;">${Number(closure.totalOther).toLocaleString()} F CFA</td></tr>
                <tr class="total">
                  <td><strong>Total</strong></td>
                  <td style="text-align: right;"><strong>${Number(closure.totalRevenue).toLocaleString()} F CFA</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${closure.notes ? `
            <div class="section">
              <div class="section-title">📝 Notes</div>
              <div class="notes">${closure.notes}</div>
            </div>
          ` : ''}

          <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            Rapport généré automatiquement par le système de gestion Fast-Food
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rapport de clôture</h2>
            <p className="text-sm text-gray-500 mt-1">
              {closureDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 mb-1">Revenus totaux</div>
              <div className="text-2xl font-bold text-green-700">
                {Number(closure.totalRevenue).toLocaleString()} F
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Commandes</div>
              <div className="text-2xl font-bold text-blue-700">{closure.totalOrders}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Complétées</div>
              <div className="text-2xl font-bold text-purple-700">{closure.completedOrders}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">Annulées</div>
              <div className="text-2xl font-bold text-red-700">{closure.cancelledOrders}</div>
            </div>
          </div>

          {/* Moyens de paiement */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Répartition par mode de paiement</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mode</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">💵 Espèces</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalCash).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">📱 TMoney</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalTmoney).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">📱 Flooz</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalFlooz).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">💳 Carte</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalCard).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">📲 Mobile</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalMobile).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">🔄 Autre</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {Number(closure.totalOther).toLocaleString()} F CFA
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {Number(closure.totalRevenue).toLocaleString()} F CFA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {closure.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{closure.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-500">
            Clôturé le {closedAtDate.toLocaleString('fr-FR')} par {closure.user.username}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
