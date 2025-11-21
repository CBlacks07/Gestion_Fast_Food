#!/bin/bash

###############################################################################
# Build de l'application desktop Fast Food Management
#
# Crée une application desktop standalone avec Electron
# incluant le frontend, backend et base de données embarquée.
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
║   🖥️  BUILD DESKTOP - FAST FOOD MANAGEMENT               ║
║                                                           ║
║   Création de l'application desktop Electron             ║
║   Port: 3002 | Format: AppImage/dmg                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier Node.js
print_title "Vérification des prérequis"

if command -v node &> /dev/null; then
    node_version=$(node --version 2>&1)
    print_success "Node.js installé: $node_version"
else
    print_error "Node.js n'est pas installé"
    print_info "Installez Node.js depuis: https://nodejs.org/"
    exit 1
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version 2>&1)
    print_success "npm installé: v$npm_version"
else
    print_error "npm n'est pas installé"
    exit 1
fi

# Vérifier la structure du projet
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Structure de projet invalide. Exécutez depuis la racine du projet."
    exit 1
fi

print_success "Structure du projet valide"

# Nettoyer les anciens builds
echo ""
print_title "Nettoyage des anciens builds"

folders_to_clean=(
    "desktop/frontend-dist"
    "desktop/backend-dist"
    "desktop/dist"
    "desktop/build"
)

for folder in "${folders_to_clean[@]}"; do
    if [ -d "$folder" ]; then
        rm -rf "$folder"
        print_info "  • $folder supprimé"
    fi
done

print_success "Nettoyage terminé"

# Build du Frontend
echo ""
print_title "Build du Frontend"

print_info "Configuration du frontend pour le port 3002..."

# Modifier temporairement le .env du frontend
cat > frontend/.env.production << EOF
VITE_API_URL=http://localhost:3002
EOF

print_info "Construction du frontend (optimisé pour production)..."
cd frontend

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances frontend..."
    npm install > /dev/null 2>&1
fi

# Build
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Frontend build avec succès"
else
    print_error "Erreur lors du build du frontend"
    exit 1
fi

cd ..

# Copier le build du frontend
mkdir -p desktop/frontend-dist
cp -r frontend/dist/* desktop/frontend-dist/
print_success "Frontend copié vers desktop/frontend-dist"

# Build du Backend
echo ""
print_title "Build du Backend"

print_info "Compilation du backend TypeScript..."
cd backend

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances backend..."
    npm install > /dev/null 2>&1
fi

# Compiler TypeScript
npx tsc > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Backend compilé avec succès"
else
    print_error "Erreur lors de la compilation du backend"
    exit 1
fi

cd ..

# Copier le backend compilé
mkdir -p desktop/backend-dist

print_info "Copie du backend compilé..."
cp -r backend/dist/* desktop/backend-dist/
cp backend/package.json desktop/backend-dist/
cp -r backend/prisma desktop/backend-dist/

# Installer les dépendances de production du backend
cd desktop/backend-dist
print_info "Installation des dépendances backend (production seulement)..."
npm install --production > /dev/null 2>&1
cd ../..

print_success "Backend copié vers desktop/backend-dist"

# Installation des dépendances Electron
echo ""
print_title "Configuration Electron"

cd desktop

if [ ! -d "node_modules" ]; then
    print_info "Installation des dépendances Electron..."
    npm install > /dev/null 2>&1
fi

print_success "Dépendances Electron installées"

# Créer les icônes (placeholder si elles n'existent pas)
if [ ! -d "build" ]; then
    mkdir -p build
    print_warning "Dossier build créé. Ajoutez icon.ico, icon.icns, icon.png pour les icônes"
fi

# Build de l'application Electron
echo ""
print_title "Build de l'application Electron"

# Déterminer la plateforme
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "Création de l'application macOS (.dmg)..."
    platform="mac"
    build_cmd="build:mac"
else
    print_info "Création de l'application Linux (AppImage + deb)..."
    platform="linux"
    build_cmd="build:linux"
fi

print_warning "Cela peut prendre 5-10 minutes..."
echo ""

npm run $build_cmd

if [ $? -eq 0 ]; then
    print_success "Application Electron buildée avec succès"
else
    print_error "Erreur lors du build Electron"
    cd ..
    exit 1
fi

cd ..

# Résumé
echo ""
print_title "Build terminé avec succès !"

echo ""
print_success "Application desktop créée"
echo ""

# Trouver l'installateur
if [[ "$OSTYPE" == "darwin"* ]]; then
    installer=$(find desktop/dist -name "*.dmg" | head -n 1)
    ext="dmg"
else
    installer=$(find desktop/dist -name "*.AppImage" | head -n 1)
    ext="AppImage"
fi

if [ -n "$installer" ]; then
    installer_size=$(du -h "$installer" | cut -f1)

    print_info "Installateur $platform:"
    echo -e "  ${NC}Fichier: ${CYAN}$(basename "$installer")${NC}"
    echo -e "  ${NC}Emplacement: ${CYAN}$(dirname "$installer")${NC}"
    echo -e "  ${NC}Taille: ${CYAN}$installer_size${NC}"
    echo ""

    print_info "Caractéristiques:"
    echo "  • Application standalone (pas besoin de Docker)"
    echo "  • Backend sur le port 3002"
    echo "  • Base de données SQLite embarquée"
    echo "  • Fonctionne 100% offline"
    echo ""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Installation (macOS):"
        echo "  1. Double-cliquez sur le fichier .dmg"
        echo "  2. Glissez l'application dans Applications"
        echo "  3. Lancez depuis Launchpad"
    else
        print_info "Installation (Linux):"
        echo "  1. Rendez le fichier exécutable: chmod +x *.AppImage"
        echo "  2. Double-cliquez ou exécutez: ./$(basename "$installer")"
        echo "  3. Ou installez le .deb avec: sudo dpkg -i *.deb"
    fi
    echo ""

    print_warning "IMPORTANT:"
    print_info "  • L'installateur est dans: desktop/dist/"
    print_info "  • Partagez le fichier pour distribution"
    print_info "  • Première connexion: admin@fastfood.com / admin123"
    echo ""
fi

read -p "Voulez-vous ouvrir le dossier de sortie? (O/n): " open_folder
if [[ ! "$open_folder" =~ ^[nN]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open desktop/dist
    elif command -v open &> /dev/null; then
        open desktop/dist
    fi
fi

echo ""
print_success "Build desktop terminé !"
