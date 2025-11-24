#!/bin/bash

echo "🛑 Arrêt du container frontend..."
docker-compose stop frontend

echo "🗑️ Suppression du container frontend..."
docker-compose rm -f frontend

echo "🗑️ Suppression de l'image frontend..."
docker rmi gestion_fast_food-frontend 2>/dev/null || true

echo "🔨 Reconstruction SANS cache..."
docker-compose build --no-cache frontend

echo "🚀 Redémarrage du container..."
docker-compose up -d frontend

echo "✅ Terminé ! Attendez 5 secondes puis rafraîchissez votre navigateur avec Ctrl+F5"
echo ""
echo "📋 Logs du container :"
docker-compose logs -f frontend
