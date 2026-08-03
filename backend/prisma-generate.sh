#!/bin/bash

# Script de génération Prisma avec retry automatique
# Gère les pannes temporaires du serveur de binaires Prisma

MAX_RETRIES=5
RETRY_DELAY=2

echo " Génération du client Prisma avec retry automatique..."

for i in $(seq 1 $MAX_RETRIES); do
echo "Tentative $i/$MAX_RETRIES..."

if npx prisma generate; then
echo " Client Prisma généré avec succès!"
exit 0
else
if [ $i -lt $MAX_RETRIES ]; then
echo " Échec. Nouvelle tentative dans ${RETRY_DELAY}s..."
sleep $RETRY_DELAY
# Délai exponentiel: 2s, 4s, 8s, 16s
RETRY_DELAY=$((RETRY_DELAY * 2))
else
echo " Échec après $MAX_RETRIES tentatives."
echo "Le serveur de binaires Prisma semble indisponible."
echo "Solutions:"
echo " 1. Réessayer dans quelques minutes"
echo " 2. Vérifier https://status.prisma.io/"
echo " 3. Utiliser une version de développement locale"
exit 1
fi
fi
done
