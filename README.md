# 🍔 Système de Gestion Fast-Food

Application complète de gestion de fast-food avec point de vente, gestion des stocks, clôtures journalières et bien plus.

## 📋 Table des matières

- [Technologies](#technologies)
- [Fonctionnalités](#fonctionnalités)
- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [Documentation](#documentation)

## 🛠️ Technologies

### Backend
- **Node.js** v18+
- **Fastify** - Framework web rapide
- **Prisma** - ORM moderne
- **PostgreSQL** - Base de données
- **TypeScript** - Typage statique

### Frontend
- **Tauri** - Application desktop
- **React** 18 - Interface utilisateur
- **TypeScript** - Typage statique
- **TailwindCSS** - Styling
- **Zustand** - Gestion d'état
- **React Router** - Navigation

## ✨ Fonctionnalités

### Pour tous les utilisateurs
- 🛒 **Point de Vente (POS)** - Interface rapide pour prendre les commandes
- 📋 **Gestion des commandes** - Suivi en temps réel
- 📊 **Statistiques** - Tableaux de bord personnalisés
- 📦 **Gestion des stocks** - Suivi des ingrédients
- 🔒 **Clôtures journalières** - Chaque utilisateur clôture sa propre journée
- 🖨️ **Impression de reçus** - Tickets professionnels

### Pour les administrateurs
- 👥 **Gestion d'équipe** - Visualisation de l'équipe
- 🍔 **Gestion des produits** - CRUD complet
- 📂 **Gestion des catégories** - Organisation du menu
- 👤 **Gestion des utilisateurs** - Création et gestion des comptes
- 🔒 **Vue globale des clôtures** - Toutes les clôtures de tous les utilisateurs
- 📈 **Logs d'activités** - Traçabilité complète

### Sécurité
- ✅ Protection contre la suppression d'admins
- ✅ Soft delete pour toutes les suppressions
- ✅ Système de logs d'activités complet
- ✅ Authentification par rôles (Admin, Manager, Cashier, Kitchen, Waiter)

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** v18 ou supérieur
- **PostgreSQL** v14 ou supérieur
- **Rust** (pour Tauri)

### Choisissez votre guide selon votre système d'exploitation:

#### 🪟 Windows
Consultez [DEMARRAGE-WINDOWS.md](./DEMARRAGE-WINDOWS.md)

```powershell
# Script automatique
.\setup-database.ps1

# Puis démarrez l'application
cd backend
npm run dev

# Dans un autre terminal
cd frontend
npm run tauri dev
```

#### 🐧 Linux / 🍎 macOS
Consultez [DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md)

```bash
# Script automatique
./setup-database.sh

# Puis démarrez l'application
cd backend
npm run dev

# Dans un autre terminal
cd frontend
npm run tauri dev
```

## 📁 Structure du Projet

```
Gestion_Fast_Food/
├── backend/                      # API Node.js + Fastify
│   ├── prisma/
│   │   └── schema.prisma        # Schéma de base de données
│   ├── src/
│   │   ├── routes/              # Routes API
│   │   │   ├── auth.ts          # Authentification
│   │   │   ├── products.ts      # Produits
│   │   │   ├── categories.ts    # Catégories
│   │   │   ├── orders.ts        # Commandes
│   │   │   ├── payments.ts      # Paiements
│   │   │   ├── users.ts         # Utilisateurs
│   │   │   ├── closures.ts      # Clôtures journalières
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── prisma.ts        # Client Prisma
│   │   │   └── activityLogger.ts # Logger d'activités
│   │   └── index.ts             # Point d'entrée
│   ├── .env                     # Configuration
│   └── package.json
│
├── frontend/                     # Application Tauri + React
│   ├── src/
│   │   ├── pages/               # Pages React
│   │   │   ├── POSPage.tsx      # Point de vente
│   │   │   ├── OrdersPage.tsx   # Commandes
│   │   │   ├── StockPage.tsx    # Stocks
│   │   │   ├── ClosuresPage.tsx # Clôtures
│   │   │   └── ...
│   │   ├── components/          # Composants réutilisables
│   │   ├── services/            # API client
│   │   │   └── api.ts           # Axios client
│   │   ├── store/               # Zustand stores
│   │   │   └── authStore.ts     # Store d'authentification
│   │   └── App.tsx              # Application principale
│   ├── src-tauri/               # Code Rust pour Tauri
│   └── package.json
│
├── setup-database.sh            # Script setup Linux/macOS
├── setup-database.ps1           # Script setup Windows
├── DEMARRAGE-RAPIDE.md         # Guide Linux/macOS
├── DEMARRAGE-WINDOWS.md        # Guide Windows
└── README.md                    # Ce fichier
```

## 📖 Documentation

### Configuration

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:Admin123@localhost:5432/fastfood_db?schema=public"
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### Identifiants par défaut

Après avoir exécuté `npm run reset-db` dans le backend:

- **Username:** `admin`
- **Password:** `admin123`

### Scripts disponibles

**Backend:**
```bash
npm run dev        # Démarre le serveur en mode développement
npm run build      # Compile TypeScript
npm run start      # Démarre le serveur en production
npm run migrate    # Exécute les migrations Prisma
npm run reset-db   # Réinitialise la base de données avec des données de test
```

**Frontend:**
```bash
npm run dev           # Démarre en mode développement (web)
npm run tauri dev     # Démarre l'application Tauri
npm run build         # Build pour production
npm run tauri build   # Build l'application Tauri
```

## 🔧 Résolution de problèmes

### Erreurs 500 au démarrage

Les tables de la base de données n'existent pas encore. Exécutez:

**Windows:**
```powershell
.\setup-database.ps1
```

**Linux/macOS:**
```bash
./setup-database.sh
```

### PostgreSQL ne démarre pas

**Windows:**
- Services Windows → postgresql-x64-XX → Démarrer
- Ou via pgAdmin

**Linux:**
```bash
sudo service postgresql start
# ou
sudo systemctl start postgresql
```

### Erreur "psql n'est pas reconnu"

PostgreSQL n'est pas dans le PATH système. Ajoutez-le ou utilisez pgAdmin.

## 📊 Base de données

### Modèles principaux

- **User** - Utilisateurs et rôles
- **Product** - Produits du menu
- **Category** - Catégories de produits
- **Order** - Commandes clients
- **Payment** - Paiements
- **Ingredient** - Ingrédients pour les recettes
- **DailyClosure** - Clôtures journalières par utilisateur
- **ActivityLog** - Logs de toutes les activités

### Migrations

La migration SQL se trouve dans: `backend/add_closures_and_logs.sql`

Elle crée:
- Table `daily_closures` avec contrainte unique sur (date, closedBy)
- Table `activity_logs` avec 17 types d'activités
- Enum `ActivityType`
- Indexes pour les performances

## 🎯 Roadmap

- [x] Système de Point de Vente
- [x] Gestion des commandes
- [x] Gestion des stocks
- [x] Clôtures journalières par utilisateur
- [x] Logs d'activités
- [x] Gestion des utilisateurs
- [x] Impression de reçus
- [ ] Rapports avancés
- [ ] Dashboard analytics
- [ ] Application mobile
- [ ] Mode hors ligne

## 📝 License

Ce projet est développé pour usage interne.

## 🤝 Support

Pour toute question ou problème:
1. Consultez la documentation appropriée (DEMARRAGE-WINDOWS.md ou DEMARRAGE-RAPIDE.md)
2. Vérifiez que PostgreSQL est bien démarré
3. Vérifiez les logs du backend et frontend
4. Consultez les logs PostgreSQL via pgAdmin

---

**Développé avec ❤️ pour simplifier la gestion de votre fast-food**
