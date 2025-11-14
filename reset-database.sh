#!/bin/bash

# Script de réinitialisation de la base de données
# ATTENTION: Ce script supprime TOUTES les données et ne garde que l'utilisateur admin

echo ""
echo "============================================="
echo "  RÉINITIALISATION DE LA BASE DE DONNÉES"
echo "============================================="
echo ""
echo -e "\033[1;33m[AVERTISSEMENT]\033[0m Ce script va:"
echo "  - Supprimer TOUTES les données de la base"
echo "  - Supprimer tous les utilisateurs"
echo "  - Supprimer tous les produits et catégories"
echo "  - Supprimer toutes les commandes et paiements"
echo "  - Supprimer tous les stocks et ingrédients"
echo "  - Supprimer toutes les clôtures et logs"
echo ""
echo -e "\033[1;32mSeul l'utilisateur admin sera recréé:\033[0m"
echo "    Username: admin"
echo "    Password: admin123"
echo ""

# Demander confirmation
read -p "Êtes-vous ABSOLUMENT sûr de vouloir continuer? (tapez 'OUI' en majuscules pour confirmer): " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo ""
    echo -e "\033[1;36m[INFO]\033[0m Opération annulée."
    echo ""
    exit 0
fi

echo ""
echo -e "\033[1;36m[INFO]\033[0m Démarrage de la réinitialisation..."

# Configuration PostgreSQL
export PGPASSWORD="Admin123"
DB_USER="postgres"
DB_HOST="localhost"
DB_NAME="fastfood_db"

# Vérification de la connexion PostgreSQL
echo -e "\033[1;36m[INFO]\033[0m Vérification de la connexion PostgreSQL..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo -e "\033[1;31m[ERREUR]\033[0m Impossible de se connecter à PostgreSQL"
    echo "Vérifiez que:"
    echo "  - PostgreSQL est démarré"
    echo "  - Le mot de passe est correct (Admin123)"
    echo "  - La base de données 'fastfood_db' existe"
    echo ""
    exit 1
fi

echo -e "\033[1;32m[OK]\033[0m Connexion PostgreSQL établie"

# Générer le hash bcrypt pour le mot de passe admin123
echo -e "\033[1;36m[INFO]\033[0m Génération du hash bcrypt pour le mot de passe..."

cd backend

PASSWORD_HASH=$(node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
  console.log(hash);
  process.exit(0);
});
")

if [ $? -ne 0 ]; then
    echo ""
    echo -e "\033[1;31m[ERREUR]\033[0m Impossible de générer le hash bcrypt"
    echo "Vérifiez que Node.js et bcrypt sont installés"
    echo ""
    cd ..
    exit 1
fi

echo -e "\033[1;32m[OK]\033[0m Hash bcrypt généré"

# Lire le fichier SQL template et remplacer le hash
sed "s|\$2b\$10\$YourBcryptHashHere|$PASSWORD_HASH|g" reset-database.sql > reset-database.tmp.sql

echo -e "\033[1;36m[INFO]\033[0m Exécution du script de réinitialisation..."

# Exécuter le script SQL
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f reset-database.tmp.sql

# Supprimer le fichier temporaire
rm -f reset-database.tmp.sql

cd ..

if [ $? -ne 0 ]; then
    echo ""
    echo -e "\033[1;31m[ERREUR]\033[0m Erreur lors de l'exécution du script SQL"
    echo ""
    exit 1
fi

echo ""
echo "============================================="
echo "  RÉINITIALISATION TERMINÉE AVEC SUCCÈS!"
echo "============================================="
echo ""
echo -e "\033[1;36mInformations de connexion:\033[0m"
echo "  Username: admin"
echo "  Password: admin123"
echo "  Email:    admin@fastfood.com"
echo ""
echo -e "\033[1;36mVous pouvez maintenant:\033[0m"
echo "  1. Démarrer le backend: cd backend && npm run dev"
echo "  2. Démarrer le frontend: cd frontend && npm run tauri dev"
echo "  3. Vous connecter avec les identifiants ci-dessus"
echo ""
