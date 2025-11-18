#!/bin/bash
# ============================================
# SCRIPT DE RÉINITIALISATION COMPLÈTE DE LA BASE DE DONNÉES
# ============================================

echo "=================================================="
echo "⚠️  ATTENTION: RÉINITIALISATION COMPLÈTE"
echo "=================================================="
echo ""
echo "Ce script va:"
echo "  - SUPPRIMER toutes les données de la base"
echo "  - Conserver uniquement le compte admin"
echo "  - Réinitialiser les paramètres par défaut"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " confirm

if [ "$confirm" != "oui" ]; then
    echo "❌ Opération annulée"
    exit 1
fi

echo ""
echo "🔄 Réinitialisation en cours..."
echo ""

# Configuration de la base de données
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="fastfood_db"
DB_USER="postgres"

# Demander le mot de passe si PGPASSWORD n'est pas défini
if [ -z "$PGPASSWORD" ]; then
    read -sp "Mot de passe PostgreSQL: " PGPASSWORD
    echo ""
    export PGPASSWORD
fi

# Exécuter le script SQL
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/reset-database-complete.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ Réinitialisation terminée avec succès !"
    echo "=================================================="
    echo ""
    echo "🔐 Compte admin:"
    echo "   Username: admin"
    echo "   Password: Admin123"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la réinitialisation"
    exit 1
fi
