import { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Test de connexion au backend
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => setBackendStatus(`✅ Backend: ${data.status}`))
      .catch(() => setBackendStatus('❌ Backend non disponible'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
            🍔 Gestion Fast-Food
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Application de gestion locale pour votre restaurant
          </p>

          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">État du Système</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <span className="font-medium">Frontend (React + Tauri)</span>
                <span className="text-green-400">✅ Actif</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <span className="font-medium">Backend API</span>
                <span className={backendStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                  {backendStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-lg font-semibold mb-2">Point de Vente</h3>
              <p className="text-gray-400 text-sm">Interface tactile rapide et intuitive</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Gestion des Stocks</h3>
              <p className="text-gray-400 text-sm">Suivi en temps réel avec alertes</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Rapports</h3>
              <p className="text-gray-400 text-sm">Analyses et statistiques détaillées</p>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Version 1.0.0 - Architecture Local-First</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
