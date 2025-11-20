#!/bin/bash

# Script pour forcer la reconstruction complète du backend

echo "=== ÉTAPE 1: Arrêt des conteneurs ==="
docker-compose down

echo ""
echo "=== ÉTAPE 2: Suppression du conteneur backend ==="
docker rm -f fastfood_api 2>/dev/null || echo "Conteneur déjà supprimé"

echo ""
echo "=== ÉTAPE 3: Suppression de l'image backend ==="
docker rmi gestion_fast_food-backend 2>/dev/null || echo "Image déjà supprimée"
docker rmi gestion-fast-food-backend 2>/dev/null || echo "Image déjà supprimée"

echo ""
echo "=== ÉTAPE 4: Nettoyage du cache de build ==="
docker builder prune -f

echo ""
echo "=== ÉTAPE 5: Reconstruction COMPLÈTE du backend ==="
echo "Ceci va prendre 2-3 minutes..."
docker-compose build --no-cache --pull backend

echo ""
echo "=== ÉTAPE 6: Démarrage des services ==="
docker-compose up

echo ""
echo "✅ Terminé!"
