#!/bin/bash

###############################################################################
# Setup automatique multiplateforme pour Fast Food Management System
#
# Ce script installe et configure automatiquement l'application Fast Food
# avec Docker, vérifie les prérequis et lance l'application.
###############################################################################

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Fonctions d'affichage
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
║   🍔 FAST FOOD MANAGEMENT SYSTEM - SETUP                 ║
║                                                           ║
║   Installation et configuration automatique              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Étape 1: Vérification des prérequis
print_title "Vérification des prérequis"

check_command() {
    if command -v $1 &> /dev/null; then
        version=$($1 --version 2>&1 | head -n 1)
        print_success "$2 installé: $version"
        return 0
    else
        print_error "$2 n'est pas installé"
        return 1
    fi
}

all_prerequisites_met=true

check_command "docker" "Docker" || all_prerequisites_met=false
check_command "docker-compose" "Docker Compose" || all_prerequisites_met=false
check_command "git" "Git" || all_prerequisites_met=false

if [ "$all_prerequisites_met" = false ]; then
    echo ""
    print_warning "Certains prérequis sont manquants. Veuillez les installer:"
    print_info "  • Docker: https://docs.docker.com/get-docker/"
    print_info "  • Docker Compose: https://docs.docker.com/compose/install/"
    print_info "  • Git: https://git-scm.com/downloads"
    echo ""
    exit 1
fi

# Étape 2: Configuration
print_title "Configuration du projet"

# Vérifier si .env existe déjà
if [ -f ".env" ]; then
    print_warning "Le fichier .env existe déjà"
    read -p "Voulez-vous le recréer? (o/N): " overwrite
    if [[ ! "$overwrite" =~ ^[oO]$ ]]; then
        print_info "Configuration existante conservée"
    else
        rm -f .env
    fi
fi

if [ ! -f ".env" ]; then
    print_info "Création du fichier .env..."

    # Générer un JWT secret aléatoire
    jwt_secret=$(openssl rand -base64 48 | tr -d '\n')

    # Demander le mot de passe PostgreSQL
    echo ""
    read -p "Mot de passe PostgreSQL (laisser vide pour 'fastfood123'): " db_password
    if [ -z "$db_password" ]; then
        db_password="fastfood123"
    fi

    # Créer le fichier .env
    cat > .env << EOF
# Base de données PostgreSQL
POSTGRES_USER=fastfood_user
POSTGRES_PASSWORD=$db_password
POSTGRES_DB=fastfood_db
DATABASE_URL=postgresql://fastfood_user:$db_password@postgres:5432/fastfood_db

# Backend API
PORT=3000
JWT_SECRET=$jwt_secret
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:3000
EOF

    print_success "Fichier .env créé avec succès"
fi

# Demander si on veut importer les catégories par défaut
echo ""
read -p "Voulez-vous importer les 43 catégories fast-food par défaut? (O/n): " import_categories
should_import_categories=true
if [[ "$import_categories" =~ ^[nN]$ ]]; then
    should_import_categories=false
fi

# Modifier le Dockerfile si nécessaire
dockerfile_path="backend/Dockerfile"

if [ "$should_import_categories" = true ]; then
    # S'assurer que la ligne n'est pas commentée
    if grep -q "^[[:space:]]*#.*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path"; then
        print_info "Activation de l'import des catégories..."
        sed -i.bak "s/^[[:space:]]*#[[:space:]]*\(echo 'npx tsx src\/scripts\/seed-categories-fastfood\.ts\)/    \1/" "$dockerfile_path"
        rm -f "${dockerfile_path}.bak"
        print_success "Import des catégories activé"
    else
        print_info "Import des catégories déjà activé"
    fi
else
    # Commenter la ligne si elle ne l'est pas déjà
    if grep -q "^[[:space:]]*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path" && \
       ! grep -q "^[[:space:]]*#.*echo 'npx tsx src/scripts/seed-categories-fastfood.ts" "$dockerfile_path"; then
        print_info "Désactivation de l'import des catégories..."
        sed -i.bak "s/^\([[:space:]]*\)\(echo 'npx tsx src\/scripts\/seed-categories-fastfood\.ts\)/\1# \2/" "$dockerfile_path"
        rm -f "${dockerfile_path}.bak"
        print_success "Import des catégories désactivé"
    else
        print_info "Import des catégories déjà désactivé"
    fi
fi

# Étape 3: Nettoyage des anciens containers
print_title "Nettoyage des anciens containers"

if docker-compose down -v &> /dev/null; then
    print_success "Anciens containers supprimés"
else
    print_info "Aucun container à supprimer"
fi

# Étape 4: Build des images Docker
print_title "Build des images Docker"

print_info "Construction des images... (cela peut prendre quelques minutes)"
echo ""

if docker-compose build --no-cache; then
    print_success "Images Docker construites avec succès"
else
    print_error "Erreur lors du build des images"
    exit 1
fi

# Étape 5: Démarrage de l'application
print_title "Démarrage de l'application"

print_info "Lancement des containers..."
if docker-compose up -d; then
    print_success "Containers démarrés avec succès"
else
    print_error "Erreur lors du démarrage"
    exit 1
fi

# Attendre que les services soient prêts
echo ""
print_info "Vérification de l'état des services..."
sleep 5

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
    print_success "Backend est opérationnel"
else
    print_warning "Le backend met du temps à démarrer. Vérifiez les logs avec: docker-compose logs -f"
fi

# Étape 6: Résumé et accès
print_title "Installation terminée !"

echo ""
echo -e "${GREEN}🎉 L'application Fast Food Management est prête !${NC}"
echo ""
print_info "Accès à l'application:"
echo -e "  ${NC}• Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "  ${NC}• Backend API: ${CYAN}http://localhost:3000${NC}"
echo ""

print_info "Compte administrateur par défaut:"
echo -e "  ${NC}• Email: ${YELLOW}admin@fastfood.com${NC}"
echo -e "  ${NC}• Mot de passe: ${YELLOW}admin123${NC}"
echo ""

print_info "Commandes utiles:"
echo -e "  ${NC}• Voir les logs: ${CYAN}docker-compose logs -f${NC}"
echo -e "  ${NC}• Arrêter: ${CYAN}docker-compose down${NC}"
echo -e "  ${NC}• Redémarrer: ${CYAN}docker-compose restart${NC}"
echo -e "  ${NC}• Backup DB: ${CYAN}./backup-database.sh${NC}"
echo -e "  ${NC}• Restore DB: ${CYAN}./restore-database.sh${NC}"
echo ""

print_warning "N'oubliez pas de changer le mot de passe administrateur après la première connexion !"
echo ""

# Demander si on veut ouvrir le navigateur
read -p "Voulez-vous ouvrir l'application dans le navigateur? (O/n): " open_browser
if [[ ! "$open_browser" =~ ^[nN]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:5173 &> /dev/null
    elif command -v open &> /dev/null; then
        open http://localhost:5173
    else
        print_info "Veuillez ouvrir manuellement: http://localhost:5173"
    fi
fi

print_success "Setup terminé avec succès !"
