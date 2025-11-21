#!/bin/bash

###############################################################################
# Exporte l'application Fast Food pour déploiement offline
#
# Crée un package contenant les images Docker et les fichiers nécessaires
# pour déployer l'application sur d'autres PC sans connexion internet.
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
║   📦 EXPORT APPLICATION - DÉPLOIEMENT OFFLINE            ║
║                                                           ║
║   Création d'un package portable pour autres PC          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier Docker
print_title "Vérification"

if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    exit 1
fi

# Vérifier que les images existent
if ! docker images "gestion_fast_food*" -q | grep -q .; then
    print_error "Aucune image Fast Food trouvée"
    print_info "Exécutez d'abord: ./build-production.sh"
    exit 1
fi

print_success "Images Docker trouvées"

# Créer le dossier d'export
export_dir="fastfood-export"
timestamp=$(date +%Y%m%d-%H%M%S)
export_file="fastfood-app-$timestamp.tar"

if [ -d "$export_dir" ]; then
    rm -rf "$export_dir"
fi

mkdir -p "$export_dir"
print_success "Dossier d'export créé: $export_dir"

# Export des images Docker
echo ""
print_title "Export des images Docker"

print_info "Sauvegarde des images (cela peut prendre plusieurs minutes)..."
print_warning "Taille attendue: 500MB - 2GB selon la configuration"
echo ""

image_names=(
    "gestion_fast_food-frontend"
    "gestion_fast_food-backend"
    "gestion_fast_food-backup"
)

docker save -o "$export_dir/$export_file" "${image_names[@]}" 2>&1
print_success "Images Docker exportées: $export_file"

# Copier les fichiers de configuration
echo ""
print_title "Copie des fichiers de configuration"

files_to_copy=(
    "docker-compose.yml"
    ".env.example"
    "import-app.ps1"
    "import-app.sh"
    "backup-database.ps1"
    "backup-database.sh"
    "restore-database.ps1"
    "restore-database.sh"
    "SETUP.md"
    "BACKUP.md"
)

for file in "${files_to_copy[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$export_dir/"
        print_info "  • $file"
    fi
done

# Créer .env.example s'il n'existe pas
if [ ! -f ".env.example" ]; then
    cat > "$export_dir/.env.example" << 'EOF'
# Base de données PostgreSQL
POSTGRES_USER=fastfood_user
POSTGRES_PASSWORD=CHANGEZ_MOI
POSTGRES_DB=fastfood_db
DATABASE_URL=postgresql://fastfood_user:CHANGEZ_MOI@postgres:5432/fastfood_db

# Backend API
PORT=3000
JWT_SECRET=GENERER_SECRET_ALEATOIRE
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:3000
EOF
fi

# Rendre les scripts exécutables
chmod +x "$export_dir"/*.sh 2>/dev/null || true

print_success "Fichiers de configuration copiés"

# Créer le README d'installation
echo ""
print_title "Création du guide d'installation"

cat > "$export_dir/README.txt" << EOF
# 🍔 Fast Food Management System - Installation Offline

## 📦 Contenu du package

Ce package contient tout le nécessaire pour installer l'application sur un PC sans connexion internet :

- Images Docker pré-construites
- Fichiers de configuration
- Scripts d'installation et de gestion
- Documentation

## 🚀 Installation rapide

### Windows

1. **Installer Docker Desktop** (si pas déjà fait)
   - Télécharger depuis: https://www.docker.com/products/docker-desktop
   - Installer et redémarrer l'ordinateur
   - Vérifier que Docker Desktop est en cours d'exécution

2. **Importer l'application**
   \`\`\`powershell
   .\import-app.ps1
   \`\`\`

3. **Configurer l'environnement**
   - Le script vous guidera pour créer le fichier .env
   - Définissez un mot de passe PostgreSQL sécurisé

4. **Démarrer l'application**
   \`\`\`powershell
   docker compose up -d
   \`\`\`

5. **Accéder à l'application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Identifiants par défaut:
     - Email: admin@fastfood.com
     - Mot de passe: admin123

### Linux / macOS

1. **Installer Docker** (si pas déjà fait)
   - Suivre: https://docs.docker.com/get-docker/

2. **Importer l'application**
   \`\`\`bash
   chmod +x import-app.sh
   ./import-app.sh
   \`\`\`

3. **Configurer et démarrer**
   \`\`\`bash
   docker compose up -d
   \`\`\`

## 📋 Informations importantes

- **Changez le mot de passe admin** après la première connexion
- **Backups automatiques** toutes les 12 heures dans ./backups/
- **Pour arrêter**: \`docker compose down\`
- **Pour redémarrer**: \`docker compose restart\`

## 🆘 Support

Consultez SETUP.md et BACKUP.md pour plus de détails.

---

Package créé le: $(date '+%d/%m/%Y à %H:%M')
EOF

print_success "Guide d'installation créé"

# Calculer la taille totale
echo ""
print_title "Résumé de l'export"

total_size=$(du -sh "$export_dir" | cut -f1)
echo ""
print_info "Emplacement: $export_dir/"
print_info "Taille totale: $total_size"
print_info "Fichier principal: $export_file"
echo ""

# Instructions finales
print_title "Export terminé avec succès !"

echo ""
print_success "Package prêt pour le transfert"
echo ""

print_info "Prochaines étapes:"
echo ""
echo -e "  ${NC}1. Copiez le dossier '$export_dir' sur:${NC}"
echo -e "     ${YELLOW}• Clé USB${NC}"
echo -e "     ${YELLOW}• Disque dur externe${NC}"
echo -e "     ${YELLOW}• Réseau local${NC}"
echo ""
echo -e "  ${NC}2. Sur le PC de destination:${NC}"
echo -e "     ${YELLOW}• Copiez le dossier complet${NC}"
echo -e "     ${YELLOW}• Exécutez: ./import-app.sh (Linux/Mac)${NC}"
echo -e "     ${YELLOW}• Ou: .\\import-app.ps1 (Windows)${NC}"
echo ""

print_warning "IMPORTANT:"
print_info "  • Docker doit être installé sur le PC de destination"
print_info "  • Le package contient TOUTES les images nécessaires"
print_info "  • Aucune connexion internet requise après l'import"
echo ""

# Demander si on veut compresser
read -p "Voulez-vous compresser le dossier en tar.gz? (o/N): " compress
if [[ "$compress" =~ ^[oO]$ ]]; then
    print_info "Compression en cours..."
    tar_file="fastfood-app-$timestamp.tar.gz"
    tar -czf "$tar_file" "$export_dir"
    print_success "Archive créée: $tar_file"
    tar_size=$(du -sh "$tar_file" | cut -f1)
    print_info "Taille du tar.gz: $tar_size"
fi

echo ""
print_success "Export terminé !"
