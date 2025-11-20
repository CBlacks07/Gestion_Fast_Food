# 📦 Système de Sauvegarde et Restauration

Ce projet inclut un système automatique de sauvegarde de la base de données PostgreSQL.

## 🤖 Sauvegarde Automatique

Les sauvegardes sont effectuées **automatiquement toutes les 12 heures** (à 00:00 et 12:00).

### Configuration
- **Fréquence** : Toutes les 12 heures
- **Rétention** : 14 sauvegardes maximum (7 jours)
- **Format** : PostgreSQL custom format (compressé)
- **Emplacement** : `./backups/`

### Conteneur de sauvegarde
Le conteneur `fastfood_backup` est automatiquement démarré avec `docker-compose up` et effectue les sauvegardes en arrière-plan.

## 💾 Sauvegarde Manuelle

### Windows (PowerShell)
```powershell
.\backup-database.ps1
```

### Linux / Mac
```bash
docker exec fastfood_backup /usr/local/bin/backup.sh
```

## 🔄 Restauration de Sauvegarde

### Windows (PowerShell)

**Restauration interactive** (choisir une sauvegarde) :
```powershell
.\restore-database.ps1
```

**Restaurer une sauvegarde spécifique** :
```powershell
.\restore-database.ps1 -BackupFile "fastfood_backup_20250120_120000.sql"
```

### Linux / Mac

**Restaurer la dernière sauvegarde** :
```bash
docker exec -it fastfood_backup /usr/local/bin/restore.sh
```

**Restaurer une sauvegarde spécifique** :
```bash
docker exec -it fastfood_backup /usr/local/bin/restore.sh /backups/fastfood_backup_20250120_120000.sql
```

## 📁 Fichiers de Sauvegarde

Les sauvegardes sont stockées dans le dossier `./backups/` avec le format :
```
fastfood_backup_YYYYMMDD_HHMMSS.sql
```

Exemple :
```
backups/
├── fastfood_backup_20250120_000000.sql  (12.5 MB)
├── fastfood_backup_20250120_120000.sql  (12.7 MB)
├── fastfood_backup_20250121_000000.sql  (13.1 MB)
└── latest.sql -> fastfood_backup_20250121_000000.sql
```

Le fichier `latest.sql` est un lien symbolique vers la dernière sauvegarde.

## 🚚 Migration vers une Nouvelle Machine

### 1. Copier le dossier backups
Sur l'ancienne machine :
```powershell
# Compresser les sauvegardes
Compress-Archive -Path .\backups\* -DestinationPath backups.zip
```

Sur la nouvelle machine :
```powershell
# Décompresser
Expand-Archive -Path backups.zip -DestinationPath .
```

### 2. Démarrer le projet
```powershell
docker-compose up -d
```

### 3. Restaurer la sauvegarde
```powershell
.\restore-database.ps1
```

## ⚠️ Avertissements

- **La restauration REMPLACE TOUTES LES DONNÉES** de la base de données
- Le backend est automatiquement arrêté pendant la restauration
- Les anciennes sauvegardes (> 14) sont automatiquement supprimées
- Les sauvegardes sont compressées pour économiser l'espace disque

## 🔍 Vérifier les Logs de Sauvegarde

```bash
docker logs fastfood_backup
```

## 🛠️ Dépannage

### Problème : Pas de sauvegardes créées

**Vérifier que le conteneur fonctionne** :
```bash
docker ps | grep fastfood_backup
```

**Vérifier les logs** :
```bash
docker logs fastfood_backup
```

### Problème : Restauration échoue

**Vérifier que la base de données est accessible** :
```bash
docker exec fastfood_backup pg_isready -h postgres -U fastfood_admin
```

**Vérifier l'intégrité du fichier de sauvegarde** :
```bash
docker exec fastfood_backup pg_restore --list /backups/latest.sql
```

## 📊 Taille des Sauvegardes

En moyenne, une sauvegarde complète occupe :
- **Base vide** : ~500 KB
- **Base avec données de démo** : ~2-5 MB
- **Base en production (estimé)** : ~10-50 MB

Les sauvegardes sont compressées (format custom avec compression niveau 9).
