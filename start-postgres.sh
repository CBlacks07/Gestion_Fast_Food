#!/bin/bash

# Script pour démarrer PostgreSQL et exécuter les migrations

echo "🔄 Vérification de PostgreSQL..."

# Vérifier si PostgreSQL est déjà en cours d'exécution
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL est déjà en cours d'exécution"
else
    echo "⚠️  PostgreSQL n'est pas démarré"
    echo "📝 Pour démarrer PostgreSQL, exécutez (en tant que root ou avec les bonnes permissions):"
    echo "   sudo service postgresql start"
    echo "   OU"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

# Vérifier si la base de données existe
echo "🔄 Vérification de la base de données..."
if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw fastfood_db; then
    echo "✅ Base de données 'fastfood_db' trouvée"
else
    echo "❌ Base de données 'fastfood_db' non trouvée"
    echo "📝 Créez la base de données avec:"
    echo "   psql -h localhost -U postgres -c 'CREATE DATABASE fastfood_db;'"
    exit 1
fi

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
cd backend

# Vérifier si les tables existent déjà
TABLE_EXISTS=$(PGPASSWORD=Admin123 psql -h localhost -U postgres -d fastfood_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Les tables de migration existent déjà"
else
    echo "📝 Application de la migration add_closures_and_logs.sql..."
    PGPASSWORD=Admin123 psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql

    if [ $? -eq 0 ]; then
        echo "✅ Migration appliquée avec succès!"
    else
        echo "❌ Erreur lors de l'application de la migration"
        exit 1
    fi
fi

echo ""
echo "🎉 Tout est prêt! Vous pouvez maintenant démarrer l'application."
echo ""
echo "Pour démarrer le backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Pour démarrer le frontend:"
echo "  cd frontend && npm run tauri dev"
