# 🪟 Instructions pour Windows

## 🚀 Réparation Complète du Logo (RECOMMANDÉ)

Ouvrez **PowerShell** et exécutez :

```powershell
# 1. Récupérer le dernier code
git pull origin claude/order-sorting-daily-filter-01NWwgDgNZH5MopPM7RUiLJD

# 2. Exécuter le script de réparation (VERSION CORRIGÉE)
.\fix-everything-v2.ps1
```

**OU la version rapide (sans nettoyage de BDD) :**

```powershell
.\rebuild-quick.ps1
```

Ces scripts font **TOUT automatiquement** :
- ✅ Nettoie et reconstruit le frontend
- ✅ Corrige les URLs en base de données (v2 uniquement)
- ✅ Redémarre les containers

---

## 🔧 Options Alternatives

### Option 1 : Reconstruction Rapide (RECOMMANDÉ)

La plus simple et la plus rapide :

```powershell
.\rebuild-quick.ps1
```

### Option 2 : Nettoyer uniquement la base de données

Si le frontend est déjà reconstruit, mais les URLs sont incorrectes :

```powershell
.\clean-database.ps1
```

---

## ✅ Vérification après Exécution

1. **Videz le cache du navigateur** : `Ctrl + Shift + Del`
2. **Rafraîchissez** : `Ctrl + F5`
3. Allez dans **Paramètres App**
4. **Uploadez une nouvelle image**

### Les logs doivent afficher :

```
🔄 Upload du logo en cours... [VERSION 2.0 - URL RELATIVE]
✅ Logo uploadé avec succès. URL: /uploads/logo-xxx.png
🎯 Type URL: ✅ RELATIVE (NOUVEAU CODE!)
```

**❌ Si vous voyez encore `📍 API_BASE_URL` = ancien code, réessayez le script**

---

## 🐛 Problèmes Courants

### Erreur "Execution Policy"

Si PowerShell bloque l'exécution :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Puis réessayez le script.

### Docker Desktop non démarré

Assurez-vous que **Docker Desktop** est en cours d'exécution avant de lancer les scripts.

### Nettoyage Complet (si rien ne marche)

```powershell
docker-compose down
docker system prune -a -f
docker-compose build --no-cache
docker-compose up -d
```

---

## 🎨 Fonctionnalités Ajoutées

✅ Le logo s'affiche maintenant sur :
- La **sidebar** (menu de gauche)
- La **page de login**
- Les **tickets de caisse** (lors de l'impression)

✅ Fallback automatique vers l'icône emoji si pas de logo

---

## 📊 Vérifier les Logs

```powershell
docker-compose logs -f frontend
docker-compose logs -f backend
```

Appuyez sur `Ctrl + C` pour arrêter l'affichage des logs.
