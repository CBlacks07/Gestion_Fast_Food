#!/bin/bash

echo "============================================"
echo "  Configuration de la base de données"
echo "============================================"
echo ""

# Démarrer PostgreSQL
echo "📝 Démarrage de PostgreSQL..."
echo ""
echo "Veuillez exécuter cette commande dans un nouveau terminal (avec les bons droits):"
echo ""
echo "  sudo service postgresql start"
echo ""
echo "OU"
echo ""
echo "  sudo systemctl start postgresql"
echo ""
echo "Appuyez sur ENTRÉE une fois PostgreSQL démarré..."
read

# Vérifier PostgreSQL
echo ""
echo "🔄 Vérification de PostgreSQL..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL n'est toujours pas accessible"
    echo ""
    echo "Vérifiez que PostgreSQL est bien démarré avec:"
    echo "  sudo service postgresql status"
    exit 1
fi

echo "✅ PostgreSQL est accessible"
echo ""

# Créer la base de données si elle n'existe pas
echo "🔄 Vérification de la base de données..."
PGPASSWORD=postgres psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw fastfood_db

if [ $? -ne 0 ]; then
    echo "📝 Création de la base de données 'fastfood_db'..."
    PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE fastfood_db;"

    if [ $? -eq 0 ]; then
        echo "✅ Base de données créée"
    else
        echo "❌ Erreur lors de la création de la base de données"
        exit 1
    fi
else
    echo "✅ Base de données 'fastfood_db' existe déjà"
fi

echo ""

# Exécuter la migration
echo "🔄 Exécution de la migration SQL..."
cd backend

PGPASSWORD=postgres psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration exécutée avec succès!"
else
    echo ""
    echo "⚠️  La migration a échoué (peut-être déjà exécutée?)"
fi

echo ""
echo "============================================"
echo "  Configuration terminée!"
echo "============================================"
echo ""
echo "Vous pouvez maintenant:"
echo "1. Démarrer le backend:   cd backend && npm run dev"
echo "2. Démarrer le frontend:  cd frontend && npm run tauri dev"
echo ""
echo "Identifiants par défaut:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
