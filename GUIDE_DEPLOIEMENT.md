# 🚀 Guide de Déploiement en Production - Fast-Food

## 📋 TABLE DES MATIÈRES

1. [Matériel Nécessaire](#matériel-nécessaire)
2. [Architecture Recommandée](#architecture-recommandée)
3. [Installation et Configuration](#installation-et-configuration)
4. [Sécurité en Production](#sécurité-en-production)
5. [Formation du Personnel](#formation-du-personnel)
6. [Maintenance et Support](#maintenance-et-support)
7. [Personnalisation](#personnalisation)
8. [Checklist de Déploiement](#checklist-de-déploiement)

---

## 🖥️ MATÉRIEL NÉCESSAIRE

### Configuration Minimale (Petit Restaurant)

#### Option 1: Solution Simple (1 seul ordinateur)
**Pour**: Petit fast-food, 1-2 employés maximum

```
💻 1 PC Principal (serveur + caisse)
   - Windows 10/11 ou Ubuntu 20.04+
   - Processeur: Intel i3 ou équivalent
   - RAM: 8 GB minimum
   - Disque: 256 GB SSD
   - Prix: ~400-600€

📱 Tablettes/Smartphones (optionnel)
   - Pour serveurs/livreurs
   - Android/iOS avec navigateur Chrome/Safari
   - Prix: ~150-300€ par appareil

🖨️ Imprimante thermique
   - Pour tickets de caisse
   - USB ou réseau (Ethernet/WiFi)
   - Exemple: Epson TM-T20III (~200€)

📶 Routeur WiFi (si tablettes)
   - TP-Link ou équivalent
   - Prix: ~50-100€
```

#### Option 2: Solution Professionnelle (Recommandée)

**Pour**: Fast-food moyen à grand, 3+ employés

```
🖥️ 1 Serveur (backend + base de données)
   - Mini PC ou petit serveur
   - Ubuntu Server 22.04 LTS
   - Processeur: Intel i5 ou AMD Ryzen 5
   - RAM: 16 GB
   - Disque: 512 GB SSD
   - Prix: ~600-1000€

💻 2-4 Postes Caisse (frontend uniquement)
   - PC All-in-One avec écran tactile (recommandé)
   - Windows 10/11
   - RAM: 4-8 GB suffisant
   - Prix: ~300-500€ par poste

📱 2-4 Tablettes (cuisine, serveurs)
   - Android ou iPad
   - 10 pouces minimum
   - Prix: ~200-400€ par tablette

🖨️ Imprimantes
   - 1-2 imprimantes tickets (caisses)
   - 1-2 imprimantes cuisine (bons de commande)
   - Prix: ~200-300€ chacune

📶 Réseau professionnel
   - Switch réseau 8 ports
   - Point d'accès WiFi professionnel (Ubiquiti)
   - Prix: ~200-400€

🔌 Onduleur (UPS)
   - Pour protéger le serveur
   - 1000 VA minimum
   - Prix: ~150-300€
```

### Budget Total Estimé

| Configuration | Petit restaurant | Restaurant moyen |
|---------------|------------------|------------------|
| Matériel | 1000-2000€ | 4000-8000€ |
| Installation | 500-1000€ | 1500-3000€ |
| **TOTAL** | **1500-3000€** | **5500-11000€** |

---

## 🏗️ ARCHITECTURE RECOMMANDÉE

### Architecture Simple (1 ordinateur)

```
┌─────────────────────────────────────┐
│      PC Principal (Tout-en-un)      │
│                                     │
│  ┌──────────┐      ┌──────────┐   │
│  │ Frontend │◄────►│ Backend  │   │
│  │(Chrome)  │      │(Node.js) │   │
│  └──────────┘      └────┬─────┘   │
│                          │          │
│                    ┌─────▼──────┐  │
│                    │PostgreSQL  │  │
│                    │  Database  │  │
│                    └────────────┘  │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Imprimante   │
    │   Tickets    │
    └──────────────┘
```

### Architecture Professionnelle (Recommandée)

```
                    ┌──────────────────┐
                    │     Serveur      │
                    │                  │
                    │  ┌────────────┐  │
                    │  │  Backend   │  │
                    │  │ (Node.js)  │  │
                    │  └─────┬──────┘  │
                    │        │         │
                    │  ┌─────▼──────┐  │
                    │  │PostgreSQL  │  │
                    │  │  Database  │  │
                    │  └────────────┘  │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │  Switch Réseau   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐        ┌────▼─────┐        ┌────▼─────┐
   │  Caisse  │        │  Caisse  │        │Tablette  │
   │    #1    │        │    #2    │        │ Cuisine  │
   │          │        │          │        │          │
   │[Frontend]│        │[Frontend]│        │[Frontend]│
   └────┬─────┘        └────┬─────┘        └──────────┘
        │                   │
   ┌────▼─────┐        ┌────▼─────┐
   │Imprimante│        │Imprimante│
   │  Ticket  │        │  Ticket  │
   └──────────┘        └──────────┘
```

---

## ⚙️ INSTALLATION ET CONFIGURATION

### Étape 1: Préparer le Serveur

#### 1.1 Installer Ubuntu Server (Recommandé)

```bash
# Sur un PC avec Ubuntu Server 22.04 LTS installé

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Git
sudo apt install -y git

# Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2
```

#### 1.2 Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql:
CREATE DATABASE fastfood_db;
CREATE USER fastfood_admin WITH PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE fastfood_db TO fastfood_admin;
\q

# Configurer PostgreSQL pour accepter les connexions réseau
sudo nano /etc/postgresql/14/main/postgresql.conf
# Modifier: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Ajouter: host all all 192.168.1.0/24 md5
# (Remplacer 192.168.1.0/24 par votre réseau local)

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

#### 1.3 Configurer l'IP statique

```bash
# Trouver votre interface réseau
ip a

# Éditer la configuration réseau (exemple pour Ubuntu Server)
sudo nano /etc/netplan/00-installer-config.yaml
```

Exemple de configuration:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:  # Remplacer par votre interface
      addresses:
        - 192.168.1.100/24  # IP statique du serveur
      routes:
        - to: default
          via: 192.168.1.1  # IP de votre box/routeur
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

```bash
# Appliquer la configuration
sudo netplan apply
```

### Étape 2: Déployer l'Application

#### 2.1 Cloner et installer

```bash
# Créer un utilisateur dédié (sécurité)
sudo adduser fastfood
sudo usermod -aG sudo fastfood

# Se connecter avec cet utilisateur
sudo su - fastfood

# Cloner le projet
cd ~
git clone https://github.com/VotreCompte/Gestion_Fast_Food.git
cd Gestion_Fast_Food

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

#### 2.2 Configurer l'environnement

```bash
cd ~/Gestion_Fast_Food/backend

# Créer le fichier .env
nano .env
```

Contenu du `.env` pour production:
```bash
# Database
DATABASE_URL="postgresql://fastfood_admin:VotreMotDePasseSecurise123!@localhost:5432/fastfood_db?schema=public"

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Security - GÉNÉRER DES SECRETS FORTS !
JWT_SECRET="$(openssl rand -base64 64)"
JWT_EXPIRES_IN="24h"

# CORS - IP des postes clients
ALLOWED_ORIGINS="http://192.168.1.101,http://192.168.1.102,http://192.168.1.103"

# Nom du restaurant
RESTAURANT_NAME="Mon Fast-Food"
```

#### 2.3 Initialiser la base de données

```bash
cd ~/Gestion_Fast_Food/backend

# Générer Prisma Client
npm run prisma:generate

# Créer les tables
npm run migrate:deploy

# ⚠️ IMPORTANT: Hasher le mot de passe admin
npm run hash-passwords

# Ajouter les catégories de base
psql -U fastfood_admin -d fastfood_db -f backend/add-categories-fastfood.sql
```

#### 2.4 Builder le frontend pour production

```bash
cd ~/Gestion_Fast_Food/frontend

# Configurer l'URL de l'API
nano .env.production
```

Contenu de `.env.production`:
```bash
VITE_API_URL=http://192.168.1.100:3000
```

```bash
# Builder
npm run build

# Le dossier "dist" contient les fichiers à servir
```

#### 2.5 Installer et configurer Nginx (serveur web)

```bash
# Installer Nginx
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/fastfood
```

Contenu:
```nginx
server {
    listen 80;
    server_name 192.168.1.100;  # IP de votre serveur

    # Frontend
    location / {
        root /home/fastfood/Gestion_Fast_Food/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/fastfood /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Supprimer le site par défaut

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

#### 2.6 Démarrer le backend avec PM2

```bash
cd ~/Gestion_Fast_Food/backend

# Démarrer avec PM2
pm2 start npm --name "fastfood-api" -- start

# Configurer le démarrage automatique
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs fastfood-api
```

### Étape 3: Configurer les Postes Clients

#### 3.1 Configuration Windows (Caisses)

Sur chaque poste caisse:

1. **Installer Chrome** (navigateur)
2. **Créer un raccourci sur le bureau**:
   - URL: `http://192.168.1.100` (IP du serveur)
   - Mode kiosque (plein écran)

**Créer un fichier `FastFood.bat` sur le bureau**:
```batch
@echo off
start chrome.exe --kiosk --no-first-run --disable-session-crashed-bubble "http://192.168.1.100"
```

3. **Configurer le démarrage automatique**:
   - Appuyez sur `Win + R`
   - Tapez: `shell:startup`
   - Copiez le fichier `FastFood.bat` dans ce dossier

4. **Désactiver les mises à jour automatiques Windows** (optionnel mais recommandé)

5. **Configurer l'imprimante**:
   - Installer les drivers de l'imprimante thermique
   - Définir comme imprimante par défaut

#### 3.2 Configuration Tablettes (Android/iOS)

1. **Installer un navigateur** (Chrome/Safari)
2. **Créer un favori** avec l'URL: `http://192.168.1.100`
3. **Mode guidé/kiosque** (optionnel):
   - Android: Utiliser "Mode Kiosque" dans les paramètres
   - iOS: Utiliser "Accès guidé" dans Réglages > Accessibilité

---

## 🔐 SÉCURITÉ EN PRODUCTION

### ✅ Checklist de Sécurité

```bash
# 1. Générer un JWT_SECRET fort
openssl rand -base64 64

# 2. Changer le mot de passe admin par défaut
# Via l'interface web après déploiement

# 3. Configurer le firewall
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 22/tcp      # SSH (administration)
sudo ufw enable

# 4. Limiter l'accès SSH
sudo nano /etc/ssh/sshd_config
# Ajouter: PermitRootLogin no
# Ajouter: AllowUsers fastfood
sudo systemctl restart sshd

# 5. Sauvegardes automatiques de la base de données
crontab -e
```

Ajouter cette ligne pour une sauvegarde quotidienne à 3h du matin:
```cron
0 3 * * * pg_dump -U fastfood_admin fastfood_db > /home/fastfood/backups/db_$(date +\%Y\%m\%d).sql
```

```bash
# Créer le dossier de sauvegarde
mkdir -p ~/backups

# Script de rotation (garder 30 jours)
echo '#!/bin/bash
find /home/fastfood/backups -name "db_*.sql" -mtime +30 -delete
' > ~/cleanup-backups.sh
chmod +x ~/cleanup-backups.sh

# Ajouter au cron (1x par semaine)
# 0 4 * * 0 /home/fastfood/cleanup-backups.sh
```

### 🔒 Sécurité Réseau

```bash
# Configurer PostgreSQL pour accepter uniquement le réseau local
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Remplacer:
# host all all 192.168.1.0/24 md5
# Par des IPs spécifiques si possible
```

### 📱 Accès à Distance Sécurisé (Optionnel)

Si vous voulez accéder au système depuis l'extérieur:

```bash
# Option 1: VPN avec WireGuard (Recommandé)
sudo apt install wireguard

# Option 2: Tailscale (Plus simple)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

**⚠️ NE JAMAIS exposer directement sur Internet sans VPN !**

---

## 👥 FORMATION DU PERSONNEL

### 📚 Documents à Créer

#### 1. Guide Caissier (1 page)

```markdown
# Guide Rapide - Caisse

## Démarrer
1. Allumer le PC
2. Le logiciel démarre automatiquement
3. Se connecter avec votre nom d'utilisateur

## Prendre une commande
1. Cliquer sur les produits souhaités
2. Modifier les options si nécessaire
3. Vérifier le panier à droite
4. Cliquer sur "PAYER"

## Encaisser
1. Choisir le mode de paiement (CB/Espèces)
2. Entrer le montant reçu si espèces
3. Rendre la monnaie affichée
4. Donner le ticket au client

## En cas de problème
- Appeler le gérant
- Noter l'heure et le problème
```

#### 2. Guide Cuisine (1 page)

```markdown
# Guide Rapide - Cuisine

## Écran Commandes
- Nouvelles commandes: en ORANGE
- En préparation: en BLEU
- Terminées: en VERT

## Préparer une commande
1. Cliquer sur la commande
2. Lire les détails
3. Cocher les produits préparés
4. Cliquer "TERMINER" quand tout est prêt

## Priorités
- Commandes sur place > À emporter
- Heure de commande affichée
```

### 🎓 Formation Pratique (2-3 heures)

**Jour 1**: Formation Caissiers
1. Demo du système (30 min)
2. Pratique supervisée (1h)
3. Questions/réponses (30 min)

**Jour 2**: Formation Cuisine
1. Demo écran cuisine (20 min)
2. Pratique (30 min)
3. Test avec vraies commandes

**Jour 3**: Formation Gérant
1. Gestion des utilisateurs (30 min)
2. Statistiques et rapports (30 min)
3. Clôture de caisse (30 min)
4. Gestion des produits (30 min)

---

## 🔧 MAINTENANCE ET SUPPORT

### Maintenance Quotidienne

```bash
# Vérifier l'état du système
pm2 status

# Vérifier les logs
pm2 logs fastfood-api --lines 100

# Vérifier l'espace disque
df -h
```

### Maintenance Hebdomadaire

```bash
# Nettoyer les logs anciens
pm2 flush

# Vérifier les sauvegardes
ls -lh ~/backups/

# Vérifier les mises à jour système
sudo apt update
sudo apt list --upgradable
```

### Maintenance Mensuelle

```bash
# Optimiser la base de données
sudo -u postgres psql fastfood_db -c "VACUUM ANALYZE;"

# Vérifier l'intégrité des sauvegardes
# Restaurer une sauvegarde sur une DB de test
```

### Procédure de Sauvegarde Manuelle

```bash
# Backup complet
cd ~/Gestion_Fast_Food
tar -czf backup_$(date +%Y%m%d).tar.gz \
    backend/.env \
    backend/prisma \
    ~/backups/db_*.sql

# Copier sur une clé USB ou cloud
```

### Procédure de Restauration

```bash
# Arrêter le backend
pm2 stop fastfood-api

# Restaurer la base de données
sudo -u postgres psql -d fastfood_db < ~/backups/db_20250118.sql

# Redémarrer
pm2 restart fastfood-api
```

---

## 🎨 PERSONNALISATION

### Logo et Couleurs

```bash
# 1. Préparer votre logo (format PNG, 500x500px)
# 2. Le placer dans: frontend/public/logo.png

# 3. Modifier les couleurs
cd ~/Gestion_Fast_Food/frontend/src
nano index.css
```

Modifier les couleurs:
```css
:root {
  --color-primary: #FF6B35;      /* Votre couleur principale */
  --color-secondary: #004E89;    /* Votre couleur secondaire */
}
```

```bash
# 4. Rebuild le frontend
cd ~/Gestion_Fast_Food/frontend
npm run build

# 5. Le nouveau design est actif !
```

### Nom du Restaurant

Via l'interface web:
1. Se connecter en ADMIN
2. Aller dans "Paramètres de l'application"
3. Modifier le nom, l'adresse, téléphone
4. Cliquer "Sauvegarder"

### Catégories et Produits

1. **Se connecter en ADMIN**
2. **Gérer les catégories**:
   - Aller dans "Gestion > Catégories"
   - Désactiver les catégories inutiles
   - Ajouter des catégories personnalisées

3. **Ajouter vos produits**:
   - Aller dans "Gestion > Produits"
   - Cliquer "Nouveau produit"
   - Remplir: nom, prix, catégorie, photo (optionnel)

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Avant le Déploiement

- [ ] Matériel acheté et reçu
- [ ] Réseau local configuré
- [ ] Serveur installé et testé
- [ ] Imprimantes installées
- [ ] Tests effectués en laboratoire

### Installation Jour J

- [ ] Installer physiquement le matériel
- [ ] Brancher le réseau
- [ ] Déployer l'application
- [ ] Hasher les mots de passe (`npm run hash-passwords`)
- [ ] Créer les comptes utilisateurs
- [ ] Configurer les imprimantes
- [ ] Ajouter les catégories
- [ ] Ajouter tous les produits
- [ ] Configurer les prix
- [ ] Tester chaque poste

### Formation

- [ ] Former les caissiers (2h)
- [ ] Former la cuisine (1h)
- [ ] Former le gérant (2h)
- [ ] Distribuer les guides rapides
- [ ] Session de questions/réponses

### Jour 1 d'Exploitation

- [ ] Être présent sur site
- [ ] Aider les employés
- [ ] Noter les problèmes
- [ ] Ajuster la configuration
- [ ] Vérifier les impressions
- [ ] Tester la clôture de caisse

### Suivi Post-Déploiement

- [ ] J+1: Appel de suivi
- [ ] J+7: Visite sur site
- [ ] J+30: Bilan mensuel
- [ ] Configuration des sauvegardes automatiques
- [ ] Formation continue si besoin

---

## 💰 COÛTS RÉCURRENTS

| Poste | Coût mensuel |
|-------|--------------|
| Électricité (+20%) | ~30-50€ |
| Connexion Internet | ~30-40€ |
| Maintenance/Support | ~0-200€ |
| **TOTAL** | **60-290€/mois** |

**ROI Estimé**:
- Gain de temps: ~5-10h/semaine
- Réduction d'erreurs: ~20-30%
- Meilleur suivi: Inestimable
- **Amortissement**: 3-6 mois

---

## 📞 SUPPORT ET ASSISTANCE

### Problèmes Courants

#### Le site ne charge pas
```bash
# Vérifier que le backend tourne
pm2 status

# Vérifier Nginx
sudo systemctl status nginx

# Vérifier la connexion réseau
ping 192.168.1.100
```

#### "401 Unauthorized"
```bash
# Le token JWT a expiré ou est invalide
# Solution: Déconnexion/reconnexion
```

#### Imprimante ne fonctionne pas
1. Vérifier que l'imprimante est allumée
2. Vérifier le câble USB/réseau
3. Vérifier les drivers installés
4. Tester une impression de test Windows

#### Lenteurs
```bash
# Vérifier la charge CPU/RAM
htop

# Vérifier la taille de la DB
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('fastfood_db'));"

# Si > 5GB, optimiser:
sudo -u postgres psql fastfood_db -c "VACUUM FULL;"
```

---

## 🎯 CONCLUSION

Ce guide vous permet de déployer l'application dans un vrai fast-food de manière **professionnelle** et **sécurisée**.

### Points Clés:
1. ✅ Architecture réseau locale (pas d'Internet requis pour fonctionner)
2. ✅ Sauvegardes automatiques
3. ✅ Formation du personnel
4. ✅ Maintenance simple
5. ✅ Personnalisation facile

### Support Supplémentaire

Pour une assistance personnalisée:
- Création d'un contrat de maintenance
- Formation sur site
- Personnalisation avancée
- Évolutions futures

**Bonne chance avec votre déploiement ! 🚀**

---

**Version**: 1.0.0
**Date**: 2025-01-18
**Auteur**: Guide de Déploiement Production
