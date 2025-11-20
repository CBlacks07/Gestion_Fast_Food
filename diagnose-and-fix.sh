#!/bin/bash

echo "=== DIAGNOSTIC DOCKER BACKEND ==="
echo ""

echo "1. Vérification du fichier docker-entrypoint.sh sur le disque:"
ls -lh backend/docker-entrypoint.sh
echo ""

echo "2. Premières lignes du fichier:"
head -5 backend/docker-entrypoint.sh
echo ""

echo "3. Images Docker actuelles pour le backend:"
docker images | grep -E "NAME|backend|gestion"
echo ""

echo "4. Conteneurs actuels:"
docker ps -a | grep -E "NAME|fastfood_api"
echo ""

echo "=== NETTOYAGE COMPLET ==="
echo ""

read -p "Voulez-vous nettoyer complètement et reconstruire? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]
then
    echo "Arrêt des conteneurs..."
    docker-compose down

    echo "Suppression du conteneur backend..."
    docker rm -f fastfood_api 2>/dev/null || echo "  -> Déjà supprimé"

    echo "Suppression de TOUTES les images du projet..."
    docker images | grep -E "gestion|fastfood" | awk '{print $3}' | xargs -r docker rmi -f

    echo "Nettoyage du cache de build..."
    docker builder prune -f

    echo ""
    echo "=== RECONSTRUCTION ==="
    echo "Reconstruction du backend (ceci va prendre 2-3 minutes)..."
    docker-compose build --no-cache --progress=plain backend 2>&1 | tee build.log

    echo ""
    echo "Vérification que l'image a été créée:"
    docker images | grep backend

    echo ""
    echo "Le log complet du build a été sauvegardé dans build.log"
    echo "Cherchons docker-entrypoint dans le log:"
    grep -i "docker-entrypoint" build.log

    echo ""
    read -p "Voulez-vous démarrer les conteneurs maintenant? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]
    then
        docker-compose up
    fi
fi
