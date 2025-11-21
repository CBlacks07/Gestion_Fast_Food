# 🚀 Guide d'Installation Fast Food Management System

Ce guide vous accompagne dans l'installation automatique du système de gestion Fast Food sur toutes les plateformes (Windows, Linux, macOS).

## 📋 Prérequis

Avant de commencer l'installation, assurez-vous d'avoir installé :

- **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
  - Windows/Mac: [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: [Installer Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (généralement inclus avec Docker Desktop)
- **Git** (pour cloner le projet)

### Vérification des prérequis

**Windows (PowerShell):**
```powershell
docker --version
docker-compose --version
git --version
```

**Linux/Mac (Terminal):**
```bash
docker --version
docker-compose --version
git --version
```

## 🎯 Installation Automatique

### Windows

1. **Ouvrir PowerShell en tant qu'administrateur**
2. **Naviguer vers le dossier du projet**
   ```powershell
   cd chemin\vers\Gestion_Fast_Food
   ```
3. **Exécuter le script d'installation**
   ```powershell
   .\setup.ps1
   ```

### Linux / macOS

1. **Ouvrir un Terminal**
2. **Naviguer vers le dossier du projet**
   ```bash
   cd /chemin/vers/Gestion_Fast_Food
   ```
3. **Exécuter le script d'installation**
   ```bash
   ./setup.sh
   ```

## 🔧 Configuration Interactive

Le script d'installation vous guidera à travers les étapes suivantes :

### 1. Vérification des prérequis
Le script vérifie automatiquement que Docker, Docker Compose et Git sont installés.

### 2. Configuration de l'environnement
- **Mot de passe PostgreSQL** : Définissez votre mot de passe pour la base de données
  - Par défaut: `fastfood123`
  - Recommandé: Utilisez un mot de passe fort en production
- **JWT Secret** : Généré automatiquement de manière sécurisée

### 3. Import des catégories
Le script vous demande si vous voulez importer les **43 catégories fast-food par défaut**.
- **Oui (O)** : Les catégories seront automatiquement importées au démarrage
- **Non (n)** : Base de données vide, vous devrez créer vos propres catégories

### 4. Build et démarrage
- Construction des images Docker (peut prendre 5-10 minutes)
- Démarrage automatique de tous les services
- Vérification de la santé des services

## 🌐 Accès à l'application

Une fois l'installation terminée :

### URLs d'accès
- **Frontend (Interface utilisateur)** : [http://localhost:5173](http://localhost:5173)
- **Backend (API)** : [http://localhost:3000](http://localhost:3000)
- **Health Check** : [http://localhost:3000/health](http://localhost:3000/health)

### Compte administrateur par défaut
```
Email    : admin@fastfood.com
Password : admin123
```

⚠️ **IMPORTANT** : Changez ce mot de passe après votre première connexion !

## 📂 Structure des fichiers après installation

```
Gestion_Fast_Food/
├── .env                          # Variables d'environnement (CRÉÉ)
├── setup.ps1                     # Script d'installation Windows
├── setup.sh                      # Script d'installation Linux/Mac
├── docker-compose.yml            # Configuration Docker
├── backups/                      # Dossier des sauvegardes DB (CRÉÉ)
├── backend/
├── frontend/
└── docker/
    └── backup/
```

## 🔄 Commandes utiles après installation

### Gestion des containers

**Voir les logs en temps réel:**
```bash
docker-compose logs -f
# Ou pour un service spécifique:
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Arrêter l'application:**
```bash
docker-compose down
```

**Redémarrer l'application:**
```bash
docker-compose restart
```

**Redémarrer avec reconstruction:**
```bash
docker-compose down
docker-compose up -d --build
```

**Voir l'état des containers:**
```bash
docker-compose ps
```

### Gestion de la base de données

**Backup manuel (Windows):**
```powershell
.\backup-database.ps1
```

**Backup manuel (Linux/Mac):**
```bash
./backup-database.sh
```

**Restaurer un backup (Windows):**
```powershell
.\restore-database.ps1
```

**Restaurer un backup (Linux/Mac):**
```bash
./restore-database.sh
```

### Rebuild complet

**Windows:**
```powershell
.\rebuild-all.ps1
```

**Linux/Mac:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 🐛 Dépannage

### Le script d'installation échoue

**Erreur : "Docker n'est pas installé"**
- Vérifiez que Docker Desktop est en cours d'exécution (Windows/Mac)
- Sur Linux, vérifiez le service : `sudo systemctl status docker`

**Erreur : "Permission denied"**
- Windows : Exécutez PowerShell en tant qu'administrateur
- Linux/Mac : Utilisez `sudo ./setup.sh` ou ajoutez votre utilisateur au groupe docker :
  ```bash
  sudo usermod -aG docker $USER
  # Puis déconnectez-vous et reconnectez-vous
  ```

### L'application ne démarre pas

**Le backend ne répond pas après 60 secondes:**
```bash
# Vérifier les logs du backend
docker-compose logs backend

# Vérifier que PostgreSQL est démarré
docker-compose ps postgres
```

**Erreur de connexion à la base de données:**
```bash
# Redémarrer tous les services
docker-compose restart

# Si le problème persiste, recréer les volumes
docker-compose down -v
docker-compose up -d
```

### Port déjà utilisé

Si les ports 3000 ou 5173 sont déjà utilisés :

1. **Modifier docker-compose.yml** :
   ```yaml
   frontend:
     ports:
       - "8080:5173"  # Utiliser le port 8080 au lieu de 5173

   backend:
     ports:
       - "8000:3000"  # Utiliser le port 8000 au lieu de 3000
   ```

2. **Mettre à jour le fichier .env** :
   ```env
   VITE_API_URL=http://localhost:8000
   ```

### Réinitialisation complète

Pour repartir de zéro :

```bash
# Arrêter et supprimer tous les containers, volumes et images
docker-compose down -v
docker rmi $(docker images 'gestion_fast_food*' -q)

# Supprimer le fichier .env
rm .env  # Linux/Mac
Remove-Item .env  # Windows

# Relancer le setup
./setup.sh  # Linux/Mac
.\setup.ps1  # Windows
```

## 🔐 Sécurité

### En développement
- Les mots de passe par défaut sont acceptables
- Le JWT secret est généré aléatoirement

### En production
1. **Changez TOUS les mots de passe** :
   - Administrateur de l'application
   - Base de données PostgreSQL
   - JWT Secret

2. **Utilisez HTTPS** :
   - Configurez un reverse proxy (Nginx, Traefik)
   - Obtenez un certificat SSL (Let's Encrypt)

3. **Configurez un firewall** :
   - N'exposez pas PostgreSQL (port 5432) publiquement
   - Limitez l'accès au backend (port 3000)

4. **Variables d'environnement** :
   - Ne commitez JAMAIS le fichier `.env` dans Git
   - Utilisez des secrets managers en production

## 📖 Documentation supplémentaire

- [BACKUP.md](./BACKUP.md) - Guide complet des sauvegardes et restaurations
- [README.md](./README.md) - Documentation générale du projet
- [docker-compose.yml](./docker-compose.yml) - Configuration Docker

## 🆘 Support

En cas de problème :

1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez l'état des services : `docker-compose ps`
3. Consultez la documentation Docker
4. Créez une issue sur le repository GitHub

## 🎓 Prochaines étapes

Après l'installation réussie :

1. **Première connexion** : Utilisez les identifiants par défaut
2. **Changez le mot de passe admin** : Paramètres → Gestion des utilisateurs
3. **Configurez les paramètres** : Logo, nom du restaurant, devise, etc.
4. **Créez vos utilisateurs** : Ajoutez vos employés (caissiers, cuisiniers, etc.)
5. **Personnalisez les catégories** : Si vous n'avez pas importé les catégories par défaut
6. **Ajoutez vos produits** : Menu fast-food
7. **Testez le point de vente** : Passez une commande test

## ✅ Checklist post-installation

- [ ] L'application est accessible sur http://localhost:5173
- [ ] Connexion réussie avec le compte admin
- [ ] Mot de passe admin changé
- [ ] Logo et paramètres personnalisés
- [ ] Au moins un utilisateur créé
- [ ] Catégories visibles
- [ ] Produits ajoutés
- [ ] Commande test réussie
- [ ] Backup automatique activé (vérifier avec `docker-compose ps`)

---

**Bonne utilisation de votre système Fast Food Management ! 🍔🍟🥤**
