# 🍔 Gestion Fast-Food

Application de gestion complète pour fast-food avec architecture Local-First.

## 🚀 Installation Rapide

### Prérequis

- Node.js >= 18
- PostgreSQL installé et démarré localement
- Rust (pour Tauri)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer PostgreSQL

Créez la base de données :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE fastfood_db;

# Quitter
\q
```

Modifiez `backend/.env` si vos identifiants PostgreSQL sont différents :
```env
DATABASE_URL="postgresql://votre_user:votre_password@localhost:5432/fastfood_db?schema=public"
```

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:migrate

# Peupler avec des données de test
npm run db:seed
```

### 4. Lancer l'application

```bash
# Démarre backend + frontend
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`
Le frontend sera accessible sur `http://localhost:5173`

## 📁 Structure

```
Gestion_Fast_Food/
├── backend/           # API Node.js + Fastify + Prisma
├── frontend/          # Desktop App Tauri + React
└── package.json       # Scripts racine
```

## 🛠️ Scripts Utiles

```bash
npm run dev              # Démarre tout
npm run dev:backend      # Démarre uniquement le backend
npm run dev:frontend     # Démarre uniquement le frontend
npm run db:migrate       # Migrer la DB
npm run db:seed          # Peupler la DB
```

## 👥 Utilisateurs par Défaut

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@fastfood.com | admin123 | ADMIN |
| cashier@fastfood.com | cashier123 | CASHIER |

## 🔧 Technologies

- **Backend**: Node.js, Fastify, Prisma, PostgreSQL
- **Frontend**: Tauri, React, TypeScript, TailwindCSS
