#!/bin/bash

###############################################################################
# Restauration de la base de données depuis un backup
#
# Ce script permet de restaurer la base de données PostgreSQL
# depuis un fichier de backup
###############################################################################

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Restauration Base de Données         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
    print_error "Docker n'est pas en cours d'exécution"
    exit 1
fi

# Vérifier que le container backup existe
if ! docker ps -a --format '{{.Names}}' | grep -q '^fastfood_backup$'; then
    print_error "Le container fastfood_backup n'existe pas"
    print_info "Lancez d'abord: docker-compose up -d"
    exit 1
fi

# Vérifier que le container backup est en cours d'exécution
if ! docker ps --format '{{.Names}}' | grep -q '^fastfood_backup$'; then
    print_warning "Le container fastfood_backup n'est pas démarré. Démarrage..."
    docker-compose start backup
    sleep 2
fi

# Lister les fichiers de backup disponibles
print_info "Fichiers de backup disponibles:"
echo ""

backups=(backups/fastfood_backup_*.sql)
if [ ! -e "${backups[0]}" ]; then
    print_error "Aucun fichier de backup trouvé dans ./backups/"
    exit 1
fi

# Afficher la liste avec numéros
counter=1
declare -A backup_map

for backup in "${backups[@]}"; do
    filename=$(basename "$backup")
    filesize=$(du -h "$backup" | cut -f1)
    filedate=$(echo "$filename" | sed 's/fastfood_backup_\(.*\)\.sql/\1/' | sed 's/_/ /g')

    echo -e "  ${YELLOW}[$counter]${NC} $filename"
    echo -e "      Taille: $filesize | Date: $filedate"
    echo ""

    backup_map[$counter]=$backup
    ((counter++))
done

# Demander à l'utilisateur de choisir
while true; do
    read -p "Sélectionnez le numéro du backup à restaurer (ou 'q' pour quitter): " choice

    if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
        print_info "Annulé par l'utilisateur"
        exit 0
    fi

    if [[ "$choice" =~ ^[0-9]+$ ]] && [ -n "${backup_map[$choice]}" ]; then
        selected_backup="${backup_map[$choice]}"
        break
    else
        print_error "Sélection invalide. Veuillez choisir un numéro valide."
    fi
done

backup_filename=$(basename "$selected_backup")

echo ""
print_warning "⚠️  ATTENTION: Cette opération va REMPLACER toutes les données actuelles !"
echo ""
read -p "Êtes-vous sûr de vouloir restaurer '$backup_filename' ? (oui/non): " confirm

if [ "$confirm" != "oui" ]; then
    print_info "Restauration annulée"
    exit 0
fi

echo ""
print_info "Restauration en cours..."
print_warning "Cela peut prendre plusieurs minutes selon la taille du backup"
echo ""

# Exécuter la restauration
if docker exec fastfood_backup /usr/local/bin/restore.sh "/backups/$backup_filename"; then
    echo ""
    print_success "Base de données restaurée avec succès !"
    echo ""
    print_info "Redémarrage des services pour appliquer les changements..."

    docker-compose restart backend frontend

    echo ""
    print_success "Services redémarrés"
    print_info "L'application est prête à l'adresse: http://localhost:5173"
else
    echo ""
    print_error "Erreur lors de la restauration"
    print_warning "Consultez les logs: docker-compose logs backup"
    exit 1
fi
