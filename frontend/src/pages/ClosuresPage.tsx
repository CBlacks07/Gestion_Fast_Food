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
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (!isAdmin) return;
    loadClosures();
  }, [isAdmin]);

  const loadClosures = async () => {
    try {
      setIsLoading(true);
      const response = await closuresApi.getAll();
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

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-500">Cette page est réservée aux administrateurs et gérants</p>
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
            <h1 className="text-2xl font-bold text-gray-900">📊 Clôture de Journée</h1>
            <p className="text-sm text-gray-500 mt-1">Générez les rapports de clôture journaliers</p>
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
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : closures.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Aucune clôture trouvée</p>
            <p className="text-sm mt-1">Créez votre première clôture de journée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closures.map((closure) => (
              <div
                key={closure.id}
                onClick={() => {
                  setSelectedClosure(closure);
                  setShowDetailModal(true);
                }}
                className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary-300 cursor-pointer transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {new Date(closure.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Clôturée le {new Date(closure.closedAt).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Par {closure.user.firstName && closure.user.lastName
                        ? `${closure.user.firstName} ${closure.user.lastName}`
                        : closure.user.username}
                    </p>
                  </div>
                </div>

                {/* Stats principales */}
                <div className="space-y-3 mb-4">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
                    <div className="text-xs opacity-90 mb-1">Chiffre d'affaires</div>
                    <div className="text-2xl font-bold">{Number(closure.totalRevenue).toLocaleString()} FCFA</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1">Commandes</div>
                      <div className="text-xl font-bold text-green-700">{closure.totalOrders}</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 mb-1">Complétées</div>
                      <div className="text-xl font-bold text-blue-700">{closure.completedOrders}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t">
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Voir le détail →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Closure Modal */}
      {showCreateModal && (
        <CreateClosureModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadClosures();
            setShowCreateModal(false);
          }}
          userId={user!.id}
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

// Create Closure Modal
function CreateClosureModal({
  onClose,
  onSuccess,
  userId,
}: {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [closureExists, setClosureExists] = useState(false);

  useEffect(() => {
    checkClosure();
  }, [date]);

  const checkClosure = async () => {
    try {
      const response = await closuresApi.checkExists(date);
      if (response.success) {
        setClosureExists(response.data.exists);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (closureExists) {
      alert('Une clôture existe déjà pour cette date');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir créer la clôture pour cette date ? Cette action est irréversible.')) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await closuresApi.create({
        date,
        userId,
        notes: notes || undefined,
      });

      if (response.success) {
        alert('Clôture créée avec succès');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la clôture');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nouvelle clôture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de la clôture *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {closureExists && (
              <p className="text-sm text-red-600 mt-1">⚠️ Une clôture existe déjà pour cette date</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, remarques particulières..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Attention :</strong> La clôture générera un rapport complet de la journée sélectionnée.
              Cette action ne peut pas être annulée.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing || closureExists}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isProcessing ? 'Création...' : 'Créer la clôture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Closure Detail Modal with Print
function ClosureDetailModal({
  closure,
  onClose,
}: {
  closure: Closure;
  onClose: () => void;
}) {
  const handlePrint = () => {
    const printContent = document.getElementById('closure-report-print');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport de Clôture - ${new Date(closure.date).toLocaleDateString('fr-FR')}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { text-align: center; color: #1f2937; margin-bottom: 30px; }
            h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
            .info-item { padding: 10px; background: #f3f4f6; border-radius: 4px; }
            .info-label { font-weight: bold; color: #6b7280; font-size: 12px; }
            .info-value { font-size: 16px; color: #1f2937; margin-top: 4px; }
            .total-section { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .total-amount { font-size: 32px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: bold; }
            .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const detailedReport = JSON.parse(closure.detailedReport);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Rapport de Clôture</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              🖨️ Imprimer
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div id="closure-report-print">
            {/* Header */}
            <h1>Rapport de Clôture de Journée</h1>
            <div style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
              {new Date(closure.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Informations générales */}
            <h2>Informations Générales</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Clôturée le</div>
                <div className="info-value">{new Date(closure.closedAt).toLocaleString('fr-FR')}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Clôturée par</div>
                <div className="info-value">
                  {closure.user.firstName && closure.user.lastName
                    ? `${closure.user.firstName} ${closure.user.lastName}`
                    : closure.user.username}
                </div>
              </div>
            </div>

            {/* Chiffre d'affaires */}
            <div className="total-section">
              <div style={{ fontSize: '14px', marginBottom: '10px', opacity: '0.9' }}>CHIFFRE D'AFFAIRES TOTAL</div>
              <div className="total-amount">{Number(closure.totalRevenue).toLocaleString()} FCFA</div>
            </div>

            {/* Statistiques des commandes */}
            <h2>Statistiques des Commandes</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Total des commandes</div>
                <div className="info-value">{closure.totalOrders}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Commandes complétées</div>
                <div className="info-value" style={{ color: '#059669' }}>{closure.completedOrders}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Commandes annulées</div>
                <div className="info-value" style={{ color: '#dc2626' }}>{closure.cancelledOrders}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Panier moyen</div>
                <div className="info-value">
                  {closure.totalOrders > 0
                    ? Math.round(Number(closure.totalRevenue) / closure.totalOrders).toLocaleString()
                    : 0} FCFA
                </div>
              </div>
            </div>

            {/* Répartition des paiements */}
            <h2>Répartition des Paiements</h2>
            <table>
              <thead>
                <tr>
                  <th>Méthode de Paiement</th>
                  <th style={{ textAlign: 'right' }}>Montant (FCFA)</th>
                  <th style={{ textAlign: 'right' }}>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {Number(closure.totalCash) > 0 && (
                  <tr>
                    <td>💵 Espèces</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalCash).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalCash) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
                {Number(closure.totalTmoney) > 0 && (
                  <tr>
                    <td>📱 TMoney</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalTmoney).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalTmoney) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
                {Number(closure.totalFlooz) > 0 && (
                  <tr>
                    <td>📱 Flooz</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalFlooz).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalFlooz) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
                {Number(closure.totalCard) > 0 && (
                  <tr>
                    <td>💳 Carte bancaire</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalCard).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalCard) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
                {Number(closure.totalMobile) > 0 && (
                  <tr>
                    <td>📲 Mobile</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalMobile).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalMobile) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
                {Number(closure.totalOther) > 0 && (
                  <tr>
                    <td>💰 Autre</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Number(closure.totalOther).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Math.round((Number(closure.totalOther) / Number(closure.totalRevenue)) * 100)}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Statistiques par utilisateur */}
            {detailedReport.userStats && detailedReport.userStats.length > 0 && (
              <>
                <h2>Performance par Utilisateur</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th style={{ textAlign: 'center' }}>Commandes</th>
                      <th style={{ textAlign: 'center' }}>Complétées</th>
                      <th style={{ textAlign: 'right' }}>Chiffre d'affaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedReport.userStats.map((stat: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <strong>{stat.user.firstName && stat.user.lastName
                            ? `${stat.user.firstName} ${stat.user.lastName}`
                            : stat.user.username}</strong>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{stat.user.role}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{stat.totalOrders}</td>
                        <td style={{ textAlign: 'center' }}>{stat.completedOrders}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{Math.round(stat.revenue).toLocaleString()} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Notes */}
            {closure.notes && (
              <>
                <h2>Notes</h2>
                <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                  {closure.notes}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="footer">
              <p>Document généré automatiquement par le système de gestion</p>
              <p>Rapport généré le {new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
