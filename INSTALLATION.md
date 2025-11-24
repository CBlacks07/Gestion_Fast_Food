# 📦 Installation de Gestion Fast-Food

Ce guide explique comment créer et installer l'application Gestion Fast-Food sur Windows.

## 🎯 Prérequis

- **Windows 10/11** (64 bits)
- **Docker Desktop** (sera vérifié lors de l'installation)
- **Connexion Internet** (pour le premier téléchargement des images Docker)

---

## 🚀 Option 1 : Installation avec l'Installeur (.exe)

### Étape 1 : Créer l'installeur

1. **Téléchargez et installez Inno Setup**
   - Téléchargez depuis : https://jrsoftware.org/isdl.php
   - Installez la version avec le préprocesseur (recommandé)

2. **Préparez l'icône de l'application**
   - Téléchargez une icône de nourriture au format `.ico`
   - Sites recommandés :
     - https://iconarchive.com/ (rechercher "food", "restaurant", "burger")
     - https://www.flaticon.com/ (convertir en .ico avec un outil en ligne)
     - https://icons8.com/
   - Renommez l'icône en `icon.ico` et placez-la à la racine du projet

3. **Compilez l'installeur**
   - Ouvrez `setup.iss` avec Inno Setup Compiler
   - Cliquez sur **Build** > **Compile**
   - L'installeur sera créé dans le dossier `installer/`

### Étape 2 : Installer l'application

1. **Double-cliquez sur** `GestionFastFood-Setup.exe`
2. **Suivez l'assistant d'installation**
   - L'installeur vérifiera si Docker Desktop est installé
   - Si Docker n'est pas installé, vous serez redirigé vers la page de téléchargement
3. **L'application sera installée** dans `C:\Program Files\GestionFastFood`
4. **Un raccourci sera créé** sur le bureau

### Étape 3 : Premier démarrage

1. **Double-cliquez sur le raccourci** "Gestion Fast-Food" sur le bureau
2. **Attendez** que les containers Docker démarrent (peut prendre 1-2 minutes la première fois)
3. **Accédez à l'application** sur http://localhost

---

## 🔧 Option 2 : Installation Manuelle (sans installeur)

### Méthode simple :

1. **Ouvrez PowerShell en Administrateur**
   - Clic droit sur le menu Démarrer
   - Choisir "Windows PowerShell (Admin)"

2. **Naviguez vers le dossier du projet**
   ```powershell
   cd C:\Users\VotreNom\Desktop\Gestion_Fast_Food
   ```

3. **Exécutez le script d'installation**
   ```powershell
   .\install.ps1
   ```

4. **Suivez les instructions à l'écran**

---

## 🎨 Icône de l'application

### Où trouver une icône de nourriture ?

1. **IconArchive.com**
   - Recherchez "restaurant", "food", "burger", "fork", "chef"
   - Téléchargez au format `.ico` (256x256 recommandé)
   - Exemples : 🍔 🍕 🍽️ 🥘

2. **Flaticon.com**
   - Téléchargez au format PNG
   - Convertissez en `.ico` avec : https://convertio.co/fr/png-ico/

3. **Icons8.com**
   - Recherchez "restaurant icon"
   - Téléchargez au format `.ico`

4. **Créer votre propre icône**
   - Utilisez Photoshop, GIMP ou Canva
   - Exportez en 256x256 pixels
   - Convertissez en `.ico`

### Appliquer l'icône

Une fois que vous avez `icon.ico` :

1. **Placez-le à la racine** du projet
2. **Décommentez ces lignes** dans `setup.iss` :
   ```
   SetupIconFile=icon.ico
   ```
   et
   ```
   Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"
   ```
3. **Recompilez l'installeur**

---

## 📋 Utilisation après installation

### Démarrer l'application

**Méthode 1** : Double-cliquez sur le raccourci "Gestion Fast-Food" sur le bureau

**Méthode 2** : Menu Démarrer > Gestion Fast-Food > Gestion Fast-Food

**Méthode 3** : Allez dans `C:\Program Files\GestionFastFood` et double-cliquez sur `Demarrer.bat`

### Arrêter l'application

**Méthode 1** : Menu Démarrer > Gestion Fast-Food > Arrêter Gestion Fast-Food

**Méthode 2** : Allez dans `C:\Program Files\GestionFastFood` et double-cliquez sur `Arreter.bat`

**Méthode 3** : PowerShell
```powershell
cd "C:\Program Files\GestionFastFood"
docker-compose down
```

### Accéder à l'application

Une fois démarrée, ouvrez votre navigateur et allez sur :
- **http://localhost**

### Identifiants par défaut

- **Administrateur** : `admin` / `Admin123`
- **Caissier** : `cashier` / `Cashier123`

---

## 🗑️ Désinstallation

### Méthode 1 : Via le Panneau de configuration

1. Panneau de configuration > Programmes > Désinstaller un programme
2. Sélectionnez "Gestion Fast-Food"
3. Cliquez sur "Désinstaller"

### Méthode 2 : Script de désinstallation

1. Ouvrez PowerShell en Administrateur
2. Exécutez :
   ```powershell
   cd "C:\Program Files\GestionFastFood"
   .\uninstall.ps1
   ```

### Supprimer complètement (y compris les données)

```powershell
docker-compose down -v
docker system prune -a
```

---

## ❓ Problèmes courants

### Docker Desktop ne démarre pas

- Redémarrez votre ordinateur
- Assurez-vous que la virtualisation est activée dans le BIOS
- Vérifiez que WSL 2 est installé : `wsl --install`

### Port 80 déjà utilisé

Si le port 80 est déjà utilisé, modifiez `docker-compose.yml` :
```yaml
ports:
  - "8080:80"  # Utiliser le port 8080 à la place
```

### Les containers ne démarrent pas

```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Support

**OPS CORPORATION**
📧 Email: cmaathey@gmail.com

Pour toute question ou problème :
- Consultez la documentation
- Contactez-nous par email à cmaathey@gmail.com
- Décrivez votre problème de manière détaillée

---

## 📝 Notes

- La première installation peut prendre 5-10 minutes (téléchargement des images Docker)
- Les démarrages suivants sont beaucoup plus rapides (30 secondes)
- Les données sont persistées dans des volumes Docker
- Même après désinstallation, les données restent (sauf si vous exécutez `docker volume prune`)
