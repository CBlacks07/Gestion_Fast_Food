#!/bin/sh
set -e

echo "🚀 FastFood API - Démarrage..."

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de la base de données..."
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "⏳ Base de données non prête, nouvelle tentative dans 2s..."
  sleep 2
done

echo "✅ Base de données connectée !"

# Appliquer les migrations
echo "📦 Application des migrations..."
npx prisma migrate deploy || echo "⚠️  Aucune migration à appliquer"

# Vérifier si des utilisateurs existent
USER_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) FROM users;
EOF
)

# Si aucun utilisateur, créer l'admin par défaut
if [ "$USER_COUNT" -eq "0" ]; then
  echo "👤 Création du compte administrateur par défaut..."
  npx tsx src/scripts/create-admin.ts
fi

echo "✅ Initialisation terminée !"
echo "🌐 API disponible sur le port 3000"

# Démarrer l'application
exec "$@"
