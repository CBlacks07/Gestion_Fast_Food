# 🔐 MISE À JOUR DE SÉCURITÉ - ACTIONS REQUISES

## ⚠️ IMPORTANT - À LIRE AVANT DE DÉMARRER L'APPLICATION

Cette mise à jour introduit des mesures de sécurité **CRITIQUES** pour protéger votre application.

---

## 🚀 ACTIONS IMMÉDIATES REQUISES

### 1️⃣ Hasher les mots de passe existants (OBLIGATOIRE)

```bash
cd backend
npm run hash-passwords
```

⚠️ **Ce script doit être exécuté UNE SEULE FOIS** avant de démarrer l'application.
Il va hasher tous les mots de passe en clair dans la base de données avec bcrypt.

### 2️⃣ Vérifier les variables d'environnement

Éditer `backend/.env` et vérifier que ces variables existent:

```bash
# Sécurité
JWT_SECRET="fastfood-jwt-secret-change-in-production-use-openssl-rand-base64-64"
JWT_EXPIRES_IN="24h"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

✅ Pour production, générer un secret fort:
```bash
openssl rand -base64 64
```

### 3️⃣ Le frontend ne fonctionne PAS encore avec JWT

⚠️ **ATTENTION**: Le frontend n'a PAS été mis à jour pour utiliser JWT.

**Vous avez 2 options**:

#### Option A: Continuer sans le frontend (tester l'API uniquement)
- L'API backend fonctionne avec JWT
- Utiliser Postman/Insomnia pour tester:
  1. POST `/api/auth/login` → récupérer le `token`
  2. Ajouter header: `Authorization: Bearer <token>`
  3. Tester les routes protégées

#### Option B: Mettre à jour le frontend (recommandé)
Voir le guide complet dans `SECURITY.md` section "Étape 4: Mettre à Jour le Frontend"

---

## 📋 CE QUI A ÉTÉ FAIT

### ✅ Sécurité Implémentée

1. **JWT Authentication**
   - Tokens signés avec secret
   - Expiration après 24h
   - Middleware requireAuth() créé

2. **Hachage des mots de passe (bcrypt)**
   - Tous les nouveaux mots de passe hashés
   - Script de migration créé
   - 10 rounds de salage

3. **Routes Protégées**
   - `/api/auth/*` - Login avec rate limiting
   - `/api/users/*` - ADMIN uniquement
   - `/api/products/*` (POST/PUT/DELETE) - ADMIN/MANAGER

4. **Rate Limiting**
   - Global: 100 req/min
   - Login: 5 tentatives/15min

5. **CORS Sécurisé**
   - Whitelist configurée pour production
   - Permissif en développement

6. **Logging Amélioré**
   - Tentatives de connexion échouées
   - IP addresses enregistrées

### ⚠️ Routes NON Protégées (À FAIRE)

Les routes suivantes nécessitent encore une protection:

- `/api/orders/*` - Toutes les routes
- `/api/payments/*` - Toutes les routes
- `/api/categories/*` (POST/PUT/DELETE)
- `/api/closures/*` - Toutes les routes
- `/api/app-settings/*` - PUT uniquement
- `/api/ingredients/*` - Toutes les routes

**Ces routes sont actuellement PUBLIQUES !**

---

## 🎯 DÉMARRAGE RAPIDE

### Backend

```bash
cd backend

# 1. Hasher les mots de passe (UNE FOIS)
npm run hash-passwords

# 2. Démarrer le serveur
npm run dev
```

### Frontend (ne fonctionne pas encore avec JWT)

```bash
cd frontend
npm run dev
```

⚠️ Le frontend va échouer car il n'envoie pas de token JWT.

---

## 🔑 COMPTES PAR DÉFAUT

Après avoir exécuté `hash-passwords`, vous pouvez vous connecter avec:

- **Email**: `admin@fastfood.com`
- **Username**: `admin`
- **Password**: `Admin123`

⚠️ **Changez ce mot de passe en production !**

---

## 📖 DOCUMENTATION COMPLÈTE

Pour plus de détails:
- `SECURITY.md` - Documentation complète de sécurité
- Guide de migration frontend
- Liste des vulnérabilités corrigées
- Checklist de sécurité

---

## ❓ PROBLÈMES FRÉQUENTS

### "401 Unauthorized" sur toutes les requêtes
➡️ Le frontend n'envoie pas le token JWT. Voir Option B ci-dessus.

### "hash-passwords script failed"
➡️ Exécutez d'abord: `cd backend && npm run prisma:generate`

### "CORS blocked"
➡️ Vérifiez `ALLOWED_ORIGINS` dans `backend/.env`

### "Too many requests"
➡️ Rate limiting activé. Attendez quelques minutes.

---

## 📞 BESOIN D'AIDE ?

1. Consultez `SECURITY.md` pour la documentation complète
2. Vérifiez les logs du serveur backend
3. Utilisez Postman pour tester l'API directement

---

**Version**: 1.0.0
**Date**: 2025-01-18
**Status**: ✅ Backend sécurisé | ⚠️ Frontend à mettre à jour
