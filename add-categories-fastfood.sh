#!/bin/bash

# ==================================================
# SCRIPT D'AJOUT DES CATEGORIES FAST-FOOD
# ==================================================
# Ce script execute le fichier SQL pour ajouter les categories
# Date: 2025-01-18
# ==================================================

set -e

echo "=============================================="
echo "AJOUT DES CATEGORIES FAST-FOOD"
echo "=============================================="
echo ""
echo "Ce script va ajouter 43 categories de fast-food"
echo "avec des emojis et descriptions"
echo ""

# Charger les variables d'environnement depuis .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Variables d'environnement chargees depuis .env"
else
    echo "❌ ATTENTION: Fichier .env introuvable"
    echo "Veuillez creer un fichier .env avec DATABASE_URL"
    exit 1
fi

# Verifier DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: DATABASE_URL non definie"
    exit 1
fi

# Extraire les informations de connexion
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/([^\?]+) ]]; then
    export PGUSER="${BASH_REMATCH[1]}"
    export PGPASSWORD="${BASH_REMATCH[2]}"
    export PGHOST="${BASH_REMATCH[3]}"
    export PGPORT="${BASH_REMATCH[4]}"
    export PGDATABASE="${BASH_REMATCH[5]}"

    echo "Connexion a la base de donnees:"
    echo "  Host: $PGHOST"
    echo "  Port: $PGPORT"
    echo "  Database: $PGDATABASE"
    echo "  User: $PGUSER"
    echo ""
else
    echo "❌ ERREUR: Format DATABASE_URL invalide"
    exit 1
fi

# Confirmer l'execution
read -p "Voulez-vous ajouter les categories? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "⚠️  Operation annulee"
    exit 0
fi

echo ""
echo "⏳ Ajout des categories en cours..."

# Executer le script SQL
SQL_FILE="backend/add-categories-fastfood.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ ERREUR: Fichier $SQL_FILE introuvable"
    exit 1
fi

if psql -f "$SQL_FILE"; then
    echo ""
    echo "=============================================="
    echo "✅ CATEGORIES AJOUTEES AVEC SUCCES!"
    echo "=============================================="
    echo ""
    echo "Vous pouvez maintenant:"
    echo "  1. Vous connecter a l'interface admin"
    echo "  2. Aller dans Gestion > Categories"
    echo "  3. Desactiver les categories dont vous n'avez pas besoin"
    echo "  4. Ajouter vos produits dans chaque categorie"
    echo ""
else
    echo "❌ ERREUR lors de l'ajout des categories"
    exit 1
fi
