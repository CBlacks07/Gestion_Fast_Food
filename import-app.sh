#!/bin/bash

###############################################################################
# Importe l'application Fast Food depuis un export offline
#
# Charge les images Docker et configure l'application pour
# une utilisation sans connexion internet.
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
║   📥 IMPORT APPLICATION - INSTALLATION OFFLINE           ║
║                                                           ║
║   Installation depuis un package pré-construit           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier Docker
print_title "Vérification de Docker"

if command -v docker &> /dev/null; then
    docker_version=$(docker --version 2>&1)
    print_success "Docker installé: $docker_version"
else
    print_error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    echo ""
    print_info "Installez Docker depuis:"
    echo -e "  ${CYAN}https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Chercher le fichier .tar
echo ""
print_title "Recherche du package"

tar_files=(fastfood-app-*.tar)

if [ ! -e "${tar_files[0]}" ]; then
    print_error "Aucun fichier fastfood-app-*.tar trouvé dans ce dossier"
    print_info "Assurez-vous que le package a été extrait correctement"
    exit 1
fi

if [ ${#tar_files[@]} -gt 1 ]; then
    print_info "Plusieurs packages trouvés:"
    for i in "${!tar_files[@]}"; do
        echo "  [$((i + 1))] ${tar_files[$i]}"
    done
    read -p $'\nSélectionnez le numéro du package à importer: ' selection
    tar_file="${tar_files[$((selection - 1))]}"
else
    tar_file="${tar_files[0]}"
fi

print_success "Package trouvé: $tar_file"
tar_size=$(du -h "$tar_file" | cut -f1)
print_info "Taille: $tar_size"

# Import des images Docker
echo ""
print_title "Import des images Docker"

print_info "Chargement des images..."
print_warning "Cela peut prendre plusieurs minutes selon la taille du package"
echo ""

if docker load -i "$tar_file"; then
    print_success "Images Docker importées avec succès"
else
    print_error "Erreur lors de l'import des images"
    exit 1
fi

# Lister les images importées
echo ""
print_info "Images importées:"
docker images --filter "reference=gestion_fast_food*" --format "  • {{.Repository}}:{{.Tag}} ({{.Size}})"
echo ""

# Configuration .env
echo ""
print_title "Configuration de l'environnement"

skip_env=false
if [ -f ".env" ]; then
    print_warning "Le fichier .env existe déjà"
    read -p "Voulez-vous le reconfigurer? (o/N): " overwrite
    if [[ ! "$overwrite" =~ ^[oO]$ ]]; then
        print_info "Configuration existante conservée"
        skip_env=true
    fi
fi

if [ "$skip_env" = false ]; then
    print_info "Création du fichier .env..."
    echo ""

    # Générer JWT secret
    jwt_secret=$(openssl rand -base64 48 | tr -d '\n')

    # Demander le mot de passe
    read -p "Mot de passe PostgreSQL (laisser vide pour 'fastfood123'): " db_password
    if [ -z "$db_password" ]; then
        db_password="fastfood123"
    fi

    # Créer .env
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

    print_success "Fichier .env créé"
fi

# Créer le dossier backups
if [ ! -d "backups" ]; then
    mkdir -p backups
    print_success "Dossier backups créé"
fi

# Installation terminée
echo ""
print_title "Installation terminée !"

echo ""
print_success "Application prête à être démarrée"
echo ""

print_info "Pour démarrer l'application:"
echo -e "  ${CYAN}docker compose up -d${NC}"
echo ""

print_info "Accès à l'application:"
echo -e "  ${NC}• Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "  ${NC}• Backend API: ${CYAN}http://localhost:3000${NC}"
echo ""

print_info "Identifiants par défaut:"
echo -e "  ${NC}• Email: ${YELLOW}admin@fastfood.com${NC}"
echo -e "  ${NC}• Mot de passe: ${YELLOW}admin123${NC}"
echo ""

print_warning "N'oubliez pas de changer le mot de passe admin après la première connexion !"
echo ""

# Demander si on veut démarrer maintenant
read -p "Voulez-vous démarrer l'application maintenant? (O/n): " start_now
if [[ ! "$start_now" =~ ^[nN]$ ]]; then
    print_info "Démarrage des containers..."
    docker compose up -d

    print_success "Containers démarrés"
    echo ""
    print_info "Vérification (30s)..."

    max_attempts=15
    attempt=0
    ready=false

    while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null | grep -q "200"; then
            ready=true
        else
            echo -n "."
            sleep 2
            ((attempt++))
        fi
    done

    echo ""

    if [ "$ready" = true ]; then
        print_success "Application opérationnelle !"
        print_info "Ouvrez votre navigateur: http://localhost:5173"

        read -p $'\nOuvrir le navigateur automatiquement? (O/n): ' open_browser
        if [[ ! "$open_browser" =~ ^[nN]$ ]]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:5173 &> /dev/null
            elif command -v open &> /dev/null; then
                open http://localhost:5173
            fi
        fi
    else
        print_warning "L'application démarre... Patientez quelques instants"
        print_info "Vérifiez les logs: docker compose logs -f"
    fi
fi

echo ""
print_success "Import terminé avec succès !"
