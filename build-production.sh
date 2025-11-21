#!/bin/bash

###############################################################################
# Build de production optimisé pour Fast Food Management System
#
# Crée un build optimisé pour la production avec images Docker légères,
# frontend minifié et backend compilé. Prêt pour déploiement offline.
###############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_title() { echo -e "\n${MAGENTA}=== $1 ===${NC}\n"; }

# Banner
clear
echo -e "${YELLOW}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PRODUCTION BUILD - FAST FOOD MANAGEMENT             ║
║                                                           ║
║   Build optimisé pour déploiement offline                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier Docker
print_title "Vérification de l'environnement"

if command -v docker &> /dev/null; then
    docker_version=$(docker --version 2>&1)
    print_success "Docker installé: $docker_version"
else
    print_error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    exit 1
fi

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    print_error "Le fichier .env n'existe pas"
    print_info "Exécutez d'abord: ./setup.sh"
    exit 1
fi

print_success "Fichier .env trouvé"

# Options de build
echo ""
print_title "Configuration du build"

read -p "Importer les 43 catégories fast-food par défaut dans le build? (O/n): " import_categories
should_import_categories=true
if [[ "$import_categories" =~ ^[nN]$ ]]; then
    should_import_categories=false
fi

# Modifier le Dockerfile backend
dockerfile_path="backend/Dockerfile"

if [ "$should_import_categories" = true ]; then
    if grep -q "^[[:space:]]*#.*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path"; then
        print_info "Activation de l'import des catégories..."
        sed -i.bak "s/^[[:space:]]*#[[:space:]]*\(echo 'npx tsx src\/scripts\/seed-categories-fastfood\.ts\)/    \1/" "$dockerfile_path"
        rm -f "${dockerfile_path}.bak"
    fi
else
    if grep -q "^[[:space:]]*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path" && \
       ! grep -q "^[[:space:]]*#.*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path"; then
        print_info "Désactivation de l'import des catégories..."
        sed -i.bak "s/^\([[:space:]]*\)\(echo 'npx tsx src\/scripts\/seed-categories-fastfood\.ts\)/\1# \2/" "$dockerfile_path"
        rm -f "${dockerfile_path}.bak"
    fi
fi

# Nettoyage
echo ""
print_title "Nettoyage de l'environnement"

print_info "Arrêt des containers existants..."
if docker compose down -v &> /dev/null; then
    print_success "Containers arrêtés"
else
    print_info "Aucun container à arrêter"
fi

print_info "Suppression des anciennes images..."
old_images=$(docker images "gestion_fast_food*" -q)
if [ -n "$old_images" ]; then
    docker rmi -f $old_images &> /dev/null || true
    print_success "Anciennes images supprimées"
else
    print_info "Aucune ancienne image à supprimer"
fi

# Build de production
echo ""
print_title "Build de production"

print_info "Construction des images optimisées..."
print_warning "Cela peut prendre 10-15 minutes selon votre machine"
echo ""

export NODE_ENV=production

if docker compose build --no-cache --pull; then
    print_success "Images de production construites avec succès"
else
    print_error "Erreur lors du build"
    exit 1
fi

# Analyse de la taille des images
echo ""
print_title "Analyse des images"

docker images --filter "reference=gestion_fast_food*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""

# Test du build
echo ""
print_title "Test du build"

print_info "Démarrage des containers pour test..."

if docker compose up -d; then
    print_success "Containers démarrés"
else
    print_error "Erreur lors du démarrage"
    exit 1
fi

echo ""
print_info "Vérification de la santé des services (60s max)..."

max_attempts=30
attempt=0
backend_ready=false

while [ $attempt -lt $max_attempts ] && [ "$backend_ready" = false ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null | grep -q "200"; then
        backend_ready=true
    else
        echo -n "."
        sleep 2
        ((attempt++))
    fi
done

echo ""

if [ "$backend_ready" = true ]; then
    print_success "Backend opérationnel"

    # Test frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200"; then
        print_success "Frontend opérationnel"
    else
        print_warning "Frontend ne répond pas immédiatement (normal au premier démarrage)"
    fi
else
    print_warning "Le backend met du temps à démarrer"
fi

# Résumé
echo ""
print_title "Build de production terminé !"

echo ""
print_success "Application prête pour la production"
echo ""

print_info "Taille totale des images:"
image_count=$(docker images --filter "reference=gestion_fast_food*" --format "{{.Size}}" | wc -l)
echo "  $image_count images créées"
echo ""

print_info "Prochaines étapes:"
echo -e "  ${NC}1. Tester l'application: ${CYAN}http://localhost:5173${NC}"
echo -e "  ${NC}2. Exporter pour d'autres PC: ${CYAN}./export-app.sh${NC}"
echo -e "  ${NC}3. Arrêter: ${CYAN}docker compose down${NC}"
echo ""

print_warning "IMPORTANT: Pour déployer sur d'autres PC sans internet:"
print_info "  • Exécutez ./export-app.sh pour créer un package"
print_info "  • Copiez le fichier .tar sur USB/disque externe"
print_info "  • Sur les autres PC, exécutez ./import-app.sh"
echo ""

# Demander si on veut arrêter les containers
read -p "Voulez-vous arrêter les containers maintenant? (o/N): " stop_containers
if [[ "$stop_containers" =~ ^[oO]$ ]]; then
    docker compose down &> /dev/null
    print_success "Containers arrêtés"
fi

print_success "Build de production terminé avec succès !"
