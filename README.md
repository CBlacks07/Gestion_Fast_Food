# 🍔 Gestion Fast-Food

Application de gestion complète pour fast-food avec architecture **Local-First**. Cette application permet de gérer les commandes, les stocks, les paiements et les statistiques de votre restaurant en mode local, avec possibilité de migration cloud.

## 📋 Fonctionnalités

### ✅ Point de Vente (POS)
- Interface tactile rapide et intuitive
- Gestion des commandes (sur place, à emporter, livraison)
- Support de plusieurs méthodes de paiement (Espèces, TMoney, Flooz, Carte)
- Gestion des tables
- Options et suppléments personnalisables

### 📦 Gestion des Stocks
- Suivi en temps réel des ingrédients
- Alertes de stock minimum
- Déstockage automatique lors des ventes
- Historique des mouvements de stock
- Système de recettes (produits → ingrédients)

### 📊 Rapports et Statistiques
- Rapports de ventes quotidiens/mensuels
- Statistiques par produit, catégorie, mode de paiement
- Analyse des performances
- Export des données

### 👥 Gestion des Utilisateurs
- Système de rôles (Admin, Manager, Cashier, Kitchen, Waiter)
- Authentification sécurisée
- Traçabilité des actions

## 🛠️ Stack Technique

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify (API REST ultra-rapide)
- **ORM**: Prisma
- **Base de données**: PostgreSQL 15
- **Langage**: TypeScript

### Frontend
- **Framework Desktop**: Tauri (application native légère)
- **UI Framework**: React 18
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Bundler**: Vite
- **Langage**: TypeScript

### DevOps
- **Containerisation**: Docker & Docker Compose
- **Monorepo**: npm workspaces

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.x ([Télécharger](https://nodejs.org/))
- **npm** >= 9.x (inclus avec Node.js)
- **Docker Desktop** ([Télécharger](https://www.docker.com/products/docker-desktop/))
- **Rust** >= 1.70 (pour Tauri) ([Télécharger](https://www.rust-lang.org/tools/install))

### Installation de Rust (pour Tauri)

**Linux/macOS** :
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Windows** :
Téléchargez et installez [rustup-init.exe](https://win.rustup.rs/)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd Gestion_Fast_Food
```

### 2. Installer les dépendances

```bash
# Installer les dépendances racine et de tous les workspaces
npm install
```

### 3. Démarrer la base de données

```bash
# Lancer PostgreSQL avec Docker
npm run docker:up

# Vérifier que PostgreSQL est bien démarré
docker ps
```

### 4. Configurer la base de données

```bash
# Générer le client Prisma
cd backend
npm run prisma:generate

# Créer les tables
npm run migrate

# Peupler avec des données de test
npm run seed

cd ..
```

### 5. Démarrer l'application

#### Option A : Tout démarrer ensemble

```bash
# Démarre le backend ET le frontend en même temps
npm run dev
```

#### Option B : Démarrer séparément

**Terminal 1 - Backend** :
```bash
npm run dev:backend
```

**Terminal 2 - Frontend (mode web)** :
```bash
npm run dev:frontend
```

**Terminal 2 - Frontend (mode desktop Tauri)** :
```bash
cd frontend
npm run tauri:dev
```

## 🏗️ Structure du Projet

```
Gestion_Fast_Food/
├── backend/                    # API Backend (Node.js + Fastify)
│   ├── prisma/
│   │   └── schema.prisma      # Schéma de base de données
│   ├── src/
│   │   ├── index.ts           # Point d'entrée
│   │   ├── seed.ts            # Script de peuplement
│   │   ├── routes/            # Routes API
│   │   ├── services/          # Logique métier
│   │   ├── models/            # Modèles de données
│   │   └── utils/             # Utilitaires
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Application Desktop (Tauri + React)
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── pages/             # Pages de l'application
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Services API
│   │   ├── store/             # Gestion d'état (Zustand)
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Utilitaires
│   │   ├── App.tsx            # Composant racine
│   │   ├── main.tsx           # Point d'entrée
│   │   └── index.css          # Styles globaux
│   ├── src-tauri/             # Configuration Tauri
│   │   ├── src/
│   │   │   └── main.rs        # Code Rust
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docker-compose.yml          # Configuration PostgreSQL
├── package.json                # Configuration monorepo
└── README.md
```

## 🔧 Scripts Disponibles

### Scripts Racine

```bash
npm run dev              # Démarre backend + frontend
npm run dev:backend      # Démarre uniquement le backend
npm run dev:frontend     # Démarre uniquement le frontend
npm run build            # Build backend + frontend
npm run docker:up        # Démarre PostgreSQL
npm run docker:down      # Arrête PostgreSQL
npm run db:migrate       # Exécute les migrations
npm run db:seed          # Peuple la base de données
```

### Scripts Backend

```bash
cd backend
npm run dev              # Mode développement avec hot-reload
npm run build            # Compile TypeScript
npm run start            # Démarre en production
npm run migrate          # Exécute les migrations Prisma
npm run seed             # Peuple la base de données
npm run prisma:generate  # Génère le client Prisma
npm run prisma:studio    # Interface graphique Prisma
```

### Scripts Frontend

```bash
cd frontend
npm run dev              # Mode développement web (Vite)
npm run tauri:dev        # Mode développement desktop (Tauri)
npm run build            # Build production web
npm run tauri:build      # Build production desktop
```

## 🗄️ Base de Données

### Schéma Principal

Le schéma de base de données comprend les tables suivantes :

- **users** : Utilisateurs et leurs rôles
- **categories** : Catégories de produits
- **products** : Produits du menu
- **options** : Options/suppléments
- **ingredients** : Ingrédients
- **recipes** : Recettes (lien produits ↔ ingrédients)
- **tables** : Tables du restaurant
- **orders** : Commandes
- **order_items** : Lignes de commande
- **payments** : Paiements
- **stock_movements** : Mouvements de stock

### Utilisateurs par Défaut (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@fastfood.com | admin123 | ADMIN |
| cashier@fastfood.com | cashier123 | CASHIER |

⚠️ **Changez ces mots de passe en production !**

### Accéder à Prisma Studio

Pour visualiser et modifier les données graphiquement :

```bash
cd backend
npm run prisma:studio
```

Ouvre l'interface sur `http://localhost:5555`

## 🐳 Docker

### Commandes Utiles

```bash
# Démarrer PostgreSQL
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter PostgreSQL
docker-compose down

# Supprimer les données (⚠️ destructif)
docker-compose down -v
```

### Configuration PostgreSQL

Par défaut, PostgreSQL est accessible sur :
- **Host** : localhost
- **Port** : 5432
- **Database** : fastfood_db
- **User** : fastfood_user
- **Password** : fastfood_password

Modifiez ces valeurs dans `docker-compose.yml` et `backend/.env` si nécessaire.

## 🔐 Sécurité

### En Développement

- Les mots de passe sont stockés en clair (à hasher avec bcrypt en production)
- CORS est ouvert à toutes les origines
- Les tokens JWT ne sont pas encore implémentés

### Pour la Production

- [ ] Implémenter le hashing des mots de passe (bcrypt)
- [ ] Configurer CORS pour les origines spécifiques
- [ ] Ajouter l'authentification JWT
- [ ] Chiffrer les données sensibles
- [ ] Configurer HTTPS
- [ ] Mettre en place des sauvegardes automatiques

## 📱 Mode Local-First

Cette application est conçue pour fonctionner **100% en local** :

1. **Backend** : Serveur API local (Node.js)
2. **Base de données** : PostgreSQL local (Docker)
3. **Frontend** : Application desktop native (Tauri)

### Migration Cloud (future)

Pour migrer vers le cloud :
- Héberger le backend sur un VPS/Cloud
- Migrer PostgreSQL vers un service cloud (AWS RDS, DigitalOcean, etc.)
- Synchroniser les données avec l'API cloud

## 🛠️ Développement

### Ajouter une Migration

```bash
cd backend
npx prisma migrate dev --name nom_de_la_migration
```

### Modifier le Schéma

1. Éditez `backend/prisma/schema.prisma`
2. Générez la migration : `npm run migrate`
3. Régénérez le client : `npm run prisma:generate`

### Ajouter une Route API

1. Créez un fichier dans `backend/src/routes/`
2. Enregistrez la route dans `backend/src/index.ts`

## 🐛 Dépannage

### PostgreSQL ne démarre pas

```bash
# Vérifier que le port 5432 n'est pas déjà utilisé
lsof -i :5432

# Redémarrer Docker
docker-compose down
docker-compose up -d
```

### Erreur "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### Tauri ne compile pas

```bash
# Vérifier l'installation de Rust
rustc --version

# Mettre à jour Rust
rustup update
```

## 📄 Licence

MIT

## 👨‍💻 Auteur

Votre Nom

---

**Bon développement ! 🚀**
