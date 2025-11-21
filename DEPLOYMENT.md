# 🚀 Guide de Déploiement Production - Mode Offline

Ce guide explique comment créer un build de production optimisé et le déployer sur plusieurs PC **sans connexion internet**.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Build de production](#build-de-production)
3. [Export pour déploiement offline](#export-pour-déploiement-offline)
4. [Import sur d'autres machines](#import-sur-dautres-machines)
5. [Gestion multi-PC](#gestion-multi-pc)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

### Scénario d'utilisation

Ce système est conçu pour un déploiement **local multi-PC sans internet** :

- Restaurant avec plusieurs postes de vente (POS)
- Cuisine avec écran de commandes
- Bureau administratif
- **Pas besoin d'internet** après l'installation initiale
- Synchronisation en réseau local via PostgreSQL partagé

### Workflow de déploiement

```
[PC Principal]                      [PC Secondaires]
     │                                    │
     ├─ 1. Build production               │
     ├─ 2. Export app                     │
     ├─ 3. Copier sur USB ────────────────┤
     │                                    ├─ 4. Import app
     │                                    ├─ 5. Configurer
     │                                    └─ 6. Démarrer
     │
     └─ Mise à jour : répéter 1-6
```

---

## 🏗️ Build de production

### Étape 1 : Préparer l'environnement

**Sur le PC principal** (celui avec internet) :

```bash
# Vérifier que Docker est installé
docker --version

# Cloner ou avoir le code source
cd Gestion_Fast_Food
```

### Étape 2 : Lancer le build de production

**Windows:**
```powershell
.\build-production.ps1
```

**Linux/Mac:**
```bash
./build-production.sh
```

### Ce que fait le script

1. ✅ Vérifie Docker
2. ✅ Vérifie le fichier .env
3. ✅ Demande si vous voulez importer les 43 catégories par défaut
4. ✅ Nettoie les anciennes images
5. ✅ Build optimisé (minifié, compressé)
6. ✅ Test automatique des services
7. ✅ Affiche la taille des images

### Options de build

Le script demande :

```
Importer les 43 catégories fast-food par défaut dans le build? (O/n):
```

- **O** : Les catégories seront déjà présentes dans l'application
- **n** : Base de données vide, vous créerez vos propres catégories

### Optimisations incluses

- **Frontend** :
  - Minification JavaScript/CSS
  - Tree-shaking (suppression du code inutilisé)
  - Compression des assets
  - Build Vite en mode production

- **Backend** :
  - Compilation TypeScript → JavaScript
  - Suppression des dev dependencies
  - Image Docker optimisée

- **Images Docker** :
  - Multi-stage builds
  - Cache layers optimisés
  - Taille réduite ~40-50% vs dev

### Taille attendue

- Frontend: ~100-150 MB
- Backend: ~200-300 MB
- Backup: ~50-80 MB
- **Total: ~500 MB - 1 GB**

---

## 📦 Export pour déploiement offline

### Étape 3 : Exporter l'application

Après un build réussi, exportez tout pour le transfert :

**Windows:**
```powershell
.\export-app.ps1
```

**Linux/Mac:**
```bash
./export-app.sh
```

### Ce que contient l'export

```
fastfood-export/
├── fastfood-app-YYYYMMDD-HHMMSS.tar   # Images Docker (500MB-2GB)
├── docker-compose.yml                  # Configuration orchestration
├── .env.example                        # Template configuration
├── import-app.ps1                      # Script import Windows
├── import-app.sh                       # Script import Linux/Mac
├── backup-database.ps1                 # Backup Windows
├── backup-database.sh                  # Backup Linux/Mac
├── restore-database.ps1                # Restore Windows
├── restore-database.sh                 # Restore Linux/Mac
├── SETUP.md                            # Documentation
├── BACKUP.md                           # Guide backups
└── README.txt                          # Instructions rapides
```

### Compression optionnelle

Le script propose de compresser le tout :

- **Windows** : Crée un fichier `.zip`
- **Linux/Mac** : Crée un fichier `.tar.gz`

Cela réduit la taille de **30-50%** pour le transfert.

### Transférer le package

Copiez le dossier `fastfood-export` (ou l'archive) sur :

- 💾 **Clé USB** (recommandé pour 2-3 PC)
- 💾 **Disque dur externe** (recommandé pour 5+ PC)
- 🌐 **Réseau local** (partage réseau Windows/Samba)
- ☁️ **Serveur local** (NAS, serveur de fichiers)

⚠️ **Ne pas utiliser** :
- Email (fichiers trop gros)
- Services cloud publics (pas d'internet sur les PC cibles)

---

## 📥 Import sur d'autres machines

### Prérequis sur chaque PC

1. **Docker installé** :
   - Windows/Mac : [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux : [Docker Engine](https://docs.docker.com/engine/install/)

2. **Le package copié** sur le PC

### Étape 4 : Importer l'application

**Windows:**
```powershell
cd fastfood-export
.\import-app.ps1
```

**Linux/Mac:**
```bash
cd fastfood-export
chmod +x import-app.sh
./import-app.sh
```

### Processus d'import

Le script va :

1. ✅ Vérifier Docker
2. ✅ Trouver le fichier .tar
3. ✅ Charger les images Docker (5-10 min)
4. ✅ Créer le fichier .env (configuration)
5. ✅ Demander le mot de passe PostgreSQL
6. ✅ Créer le dossier backups
7. ✅ Proposer de démarrer l'application

### Configuration réseau

#### Mode 1 : PC Standalone (1 seul PC)

Chaque PC a sa propre base de données :

```env
# .env
DATABASE_URL=postgresql://fastfood_user:password@postgres:5432/fastfood_db
```

✅ Simple, pas de configuration réseau
❌ Données isolées par PC

#### Mode 2 : Multi-PC avec DB partagée

Un PC héberge PostgreSQL, les autres s'y connectent :

**Sur le PC serveur (ex: PC Admin)** :

```yaml
# docker-compose.yml
postgres:
  ports:
    - "5432:5432"  # Exposer PostgreSQL au réseau
```

**Sur les PC clients (ex: PC Caisse 1, 2)** :

```env
# .env
DATABASE_URL=postgresql://fastfood_user:password@192.168.1.100:5432/fastfood_db
```

Remplacez `192.168.1.100` par l'IP du PC serveur.

**Configuration du serveur** :

Ne lancez que backend + frontend sur les PC clients :

```powershell
# Ne pas lancer postgres localement
docker compose up -d frontend backend
```

✅ Base de données centralisée
✅ Synchronisation en temps réel
⚠️ Nécessite réseau local stable

---

## 🖥️ Gestion multi-PC

### Architecture réseau recommandée

```
┌─────────────────┐
│   PC ADMIN      │  Backend + Frontend + PostgreSQL + Backup
│   192.168.1.100 │  Gère: utilisateurs, paramètres, stats
└────────┬────────┘
         │
    ┌────┴─────┐
    │  Switch  │  Réseau local
    └────┬─────┘
         │
    ┌────┴────────────────────┐
    │                         │
┌───┴──────┐          ┌───────┴───┐
│ CAISSE 1 │          │ CAISSE 2  │  Frontend uniquement
│ .101     │          │ .102      │  Prend les commandes
└──────────┘          └───────────┘
    │                         │
┌───┴──────┐          ┌───────┴───┐
│ CUISINE  │          │ BAR       │  Frontend uniquement
│ .103     │          │ .104      │  Affiche les commandes
└──────────┘          └───────────┘
```

### Configuration par type de PC

#### PC Admin (Serveur)

```yaml
# docker-compose.yml - Tous les services
services:
  postgres:
    ports:
      - "5432:5432"
  backend:
    ports:
      - "3000:3000"
  frontend:
    ports:
      - "5173:5173"
  backup:
    # ...
```

```env
# .env
DATABASE_URL=postgresql://fastfood_user:password@postgres:5432/fastfood_db
```

#### PC Caisse / POS

```yaml
# docker-compose.yml - Frontend uniquement
services:
  frontend:
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://192.168.1.100:3000
```

```env
# .env
VITE_API_URL=http://192.168.1.100:3000
```

#### PC Cuisine

Même configuration que PC Caisse.

### Démarrage des services

**PC Admin:**
```bash
docker compose up -d
```

**PC Caisses/Cuisine:**
```bash
# Seulement le frontend
docker compose up -d frontend
```

### Sécurité réseau local

1. **Firewall Windows** :
   ```powershell
   # Autoriser Docker
   New-NetFirewallRule -DisplayName "Docker PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Docker Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

2. **IP statiques recommandées** :
   - Évite les changements d'IP au redémarrage
   - Configuration dans les paramètres réseau Windows/Linux

3. **Mots de passe forts** :
   - PostgreSQL
   - Admin application
   - Ne jamais utiliser les mots de passe par défaut !

---

## 🔄 Mise à jour de l'application

### Sur toutes les machines

1. **Arrêter l'application**
   ```bash
   docker compose down
   ```

2. **Backup de la base** (PC Admin uniquement)
   ```powershell
   .\backup-database.ps1
   ```

3. **Importer la nouvelle version**
   - Copier le nouveau package
   - Exécuter `import-app.ps1` ou `import-app.sh`

4. **Redémarrer**
   ```bash
   docker compose up -d
   ```

### Mise à jour sans downtime

Si vous avez 2+ caisses :

1. Mettre à jour caisse 1
2. Tester
3. Mettre à jour caisse 2
4. Mettre à jour le serveur en dernier

---

## 🐛 Troubleshooting

### Images Docker non trouvées après import

**Symptôme** :
```
Error: No such image: gestion_fast_food-backend
```

**Solution** :
```bash
# Vérifier les images
docker images

# Si vides, réimporter
docker load -i fastfood-app-YYYYMMDD-HHMMSS.tar
```

### Erreur de connexion PostgreSQL entre PC

**Symptôme** :
```
ECONNREFUSED 192.168.1.100:5432
```

**Solutions** :

1. Vérifier que PostgreSQL écoute sur le réseau :
   ```bash
   docker compose logs postgres
   ```

2. Tester la connexion :
   ```bash
   # Depuis PC client
   telnet 192.168.1.100 5432
   # Ou
   nc -zv 192.168.1.100 5432
   ```

3. Vérifier le firewall :
   ```powershell
   # Windows
   Test-NetConnection -ComputerName 192.168.1.100 -Port 5432
   ```

4. Vérifier l'IP du serveur :
   ```bash
   # Sur le PC serveur
   ipconfig       # Windows
   ip addr show   # Linux
   ```

### Frontend ne se connecte pas au backend

**Symptôme** :
```
Network Error: Failed to fetch
```

**Solution** :

Vérifier la variable d'environnement :

```env
# .env
VITE_API_URL=http://192.168.1.100:3000
```

Rebuild le frontend si changé :
```bash
docker compose up -d --build frontend
```

### Espace disque insuffisant

**Symptôme** :
```
Error: No space left on device
```

**Solution** :

```bash
# Nettoyer les anciennes images
docker system prune -a

# Voir l'utilisation
docker system df
```

### Application lente

**Optimisations** :

1. **Augmenter les ressources Docker** :
   - Docker Desktop → Settings → Resources
   - CPU: 4+ cores
   - RAM: 4+ GB

2. **Utiliser SSD** pour les volumes Docker

3. **Réseau local** :
   - Câble Ethernet > WiFi
   - Switch Gigabit

---

## 📊 Monitoring multi-PC

### Vérifier l'état de tous les PC

Créer un script de monitoring :

**check-all-pcs.ps1** :
```powershell
$pcs = @("192.168.1.100", "192.168.1.101", "192.168.1.102")

foreach ($pc in $pcs) {
    Write-Host "Checking $pc..."
    $health = Invoke-WebRequest -Uri "http://${pc}:3000/health" -TimeoutSec 5 2>$null
    if ($health.StatusCode -eq 200) {
        Write-Host "  ✓ OK" -ForegroundColor Green
    } else {
        Write-Host "  ✗ DOWN" -ForegroundColor Red
    }
}
```

### Logs centralisés

Sur le PC Admin, voir les logs de la DB partagée :

```bash
docker compose logs -f postgres --tail=100
```

---

## 📚 Ressources supplémentaires

- [SETUP.md](./SETUP.md) - Installation initiale
- [BACKUP.md](./BACKUP.md) - Système de backup
- [README.md](./README.md) - Documentation générale

---

## ✅ Checklist de déploiement

### PC Principal (Build)

- [ ] Docker installé et fonctionnel
- [ ] Code source à jour
- [ ] Fichier .env configuré
- [ ] Build production réussi (`.\build-production.ps1`)
- [ ] Export créé (`.\export-app.ps1`)
- [ ] Package copié sur USB/disque

### Chaque PC Secondaire

- [ ] Docker installé et fonctionnel
- [ ] Package copié sur le PC
- [ ] Import réussi (`.\import-app.ps1`)
- [ ] Fichier .env configuré (IP du serveur si multi-PC)
- [ ] Application démarrée (`docker compose up -d`)
- [ ] Test de connexion (http://localhost:5173)
- [ ] Mot de passe admin changé

### Réseau (si multi-PC)

- [ ] Tous les PC sur le même réseau local
- [ ] IP statiques configurées
- [ ] Firewall autorise ports 3000 et 5432
- [ ] Test de connectivité entre PC
- [ ] Backup automatique activé sur PC serveur

---

**Bon déploiement ! 🚀**
