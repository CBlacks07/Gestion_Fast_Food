#!/bin/bash

###############################################################################
# Backup manuel de la base de données
#
# Ce script déclenche un backup immédiat de la base de données PostgreSQL
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
echo -e "${CYAN}║     Backup Base de Données             ║${NC}"
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

print_info "Lancement du backup..."

# Exécuter le script de backup
if docker exec fastfood_backup /usr/local/bin/backup.sh; then
    echo ""
    print_success "Backup effectué avec succès !"

    # Lister les fichiers de backup
    echo ""
    print_info "Fichiers de backup disponibles:"
    ls -lh backups/fastfood_backup_*.sql 2>/dev/null | tail -5 | awk '{print "  " $9 " (" $5 ")"}'

    echo ""
    print_info "Les backups sont stockés dans: ./backups/"
else
    echo ""
    print_error "Erreur lors du backup"
    exit 1
fi
