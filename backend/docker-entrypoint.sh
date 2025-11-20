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
npx prisma migrate deploy || npx prisma db push --skip-generate

# Créer l'admin par défaut (le script vérifie si un admin existe déjà)
echo "👤 Vérification du compte administrateur..."
npx tsx src/scripts/create-admin.ts || echo "⚠️  Impossible de créer l'admin (il existe peut-être déjà)"

echo "✅ Initialisation terminée !"
echo "🌐 API disponible sur le port 3000"
echo ""
echo "📝 Identifiants par défaut:"
echo "   Username: admin"
echo "   Password: Admin123"
echo ""

# Démarrer l'application
exec "$@"
