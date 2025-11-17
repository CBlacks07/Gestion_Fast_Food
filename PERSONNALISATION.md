# Système de Personnalisation de l'Application

## Vue d'ensemble

Le système de personnalisation permet de modifier le nom de l'application, le logo, les couleurs et d'autres paramètres de branding pour adapter l'application à différents restaurants.

## Fonctionnalités

### Paramètres Personnalisables

#### 🎨 Identité de l'Application
- **Nom de l'application** : Le nom qui apparaît dans toute l'application
- **Icône / Emoji** : L'icône principale (par défaut : 🍔)
- **Slogan** : Un slogan optionnel
- **Logo URL** : URL d'un logo personnalisé

#### 🎨 Couleurs
- **Couleur principale** : Couleur utilisée pour les boutons et éléments principaux
- **Couleur secondaire** : Couleur secondaire optionnelle

#### 🏢 Informations de l'Entreprise
- **Nom de l'entreprise**
- **Email de contact**
- **Téléphone**
- **Adresse**

#### 💰 Paramètres Monétaires
- **Monnaie** : Nom de la monnaie (ex: FCFA, EUR, USD)
- **Symbole de la monnaie** : Symbole à afficher (ex: FCFA, €, $)
- **Taux de TVA** : Taux de TVA en pourcentage

#### 🧾 Paramètres de Reçus
- **En-tête de reçu** : Texte personnalisé en haut des reçus
- **Pied de page de reçu** : Texte personnalisé en bas des reçus

## Utilisation

### Accès à la Page de Paramètres

1. Connectez-vous en tant qu'**Administrateur**
2. Dans le menu latéral, section "Gestion", cliquez sur **⚙️ Paramètres**
3. Modifiez les paramètres souhaités
4. Cliquez sur **💾 Sauvegarder**

### Aperçu en Temps Réel

La page de paramètres inclut une section **👁️ Aperçu** qui affiche un aperçu de vos paramètres avant de les sauvegarder.

### Réinitialisation

Pour revenir aux paramètres par défaut, cliquez sur le bouton **🔄 Réinitialiser**.

## Architecture Technique

### Base de Données

**Table : `app_settings`**

```sql
CREATE TABLE "app_settings" (
  "id" TEXT PRIMARY KEY,
  "appName" TEXT NOT NULL DEFAULT 'Gestion Fast-Food',
  "appIcon" TEXT NOT NULL DEFAULT '🍔',
  "slogan" TEXT,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#ef4444',
  "secondaryColor" TEXT,
  "companyName" TEXT,
  "companyEmail" TEXT,
  "companyPhone" TEXT,
  "companyAddress" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'FCFA',
  "currencySymbol" TEXT NOT NULL DEFAULT 'FCFA',
  "taxRate" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "receiptHeader" TEXT,
  "receiptFooter" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

**GET `/api/app-settings`**
- Récupère les paramètres actifs de l'application
- Crée automatiquement des paramètres par défaut s'ils n'existent pas

**PUT `/api/app-settings`**
- Met à jour les paramètres de l'application
- Paramètres requis : Optionnels selon ce qui doit être modifié
- Paramètre optionnel : `userId` pour logger l'activité

**POST `/api/app-settings/reset`**
- Réinitialise les paramètres aux valeurs par défaut
- Paramètre optionnel : `userId` pour logger l'activité

### Frontend

**Store Zustand : `appSettingsStore`**

Le store gère l'état des paramètres côté client avec persistance locale.

```typescript
import { useAppSettingsStore } from './store/appSettingsStore';

// Dans un composant
const settings = useAppSettingsStore((state) => state.settings);
const setSettings = useAppSettingsStore((state) => state.setSettings);
```

**Composants Modifiés :**
- `Layout.tsx` : Utilise `appName` et `appIcon` dans la sidebar
- `LoginPage.tsx` : Utilise `appName`, `appIcon` et `slogan` sur la page de connexion
- `App.tsx` : Charge les paramètres au démarrage de l'application

**Page d'Administration :**
- `AppSettingsPage.tsx` : Interface complète pour gérer tous les paramètres

## Installation et Configuration

### 1. Créer la Table dans la Base de Données

Exécutez le script SQL fourni :

```bash
cd backend
psql -U postgres -d fastfood_db -f add_app_settings.sql
```

Ou si vous utilisez le fichier .env :

```bash
psql $DATABASE_URL -f backend/add_app_settings.sql
```

### 2. Générer le Client Prisma

```bash
cd backend
npx prisma generate
```

### 3. Démarrer l'Application

```bash
# Backend
cd backend
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm run dev
```

## Exemples d'Utilisation

### Exemple 1 : Restaurant de Pizza

```json
{
  "appName": "Pizzeria Milano",
  "appIcon": "🍕",
  "slogan": "La meilleure pizza en ville",
  "primaryColor": "#d32f2f",
  "companyName": "Pizzeria Milano SARL",
  "companyEmail": "contact@pizzeriamilano.com",
  "companyPhone": "+228 XX XX XX XX",
  "currency": "FCFA",
  "currencySymbol": "FCFA"
}
```

### Exemple 2 : Café

```json
{
  "appName": "Café Central",
  "appIcon": "☕",
  "slogan": "Votre café préféré",
  "primaryColor": "#6f4e37",
  "companyName": "Café Central",
  "companyEmail": "info@cafecentral.com",
  "currency": "EUR",
  "currencySymbol": "€"
}
```

### Exemple 3 : Restaurant Africain

```json
{
  "appName": "Le Goût d'Afrique",
  "appIcon": "🍲",
  "slogan": "Saveurs authentiques d'Afrique",
  "primaryColor": "#f57c00",
  "companyName": "Restaurant Le Goût d'Afrique",
  "companyPhone": "+228 XX XX XX XX",
  "currency": "FCFA",
  "currencySymbol": "FCFA"
}
```

## Notes Importantes

1. **Permissions** : Seuls les administrateurs peuvent modifier les paramètres
2. **Rechargement** : Après modification, rechargez la page pour voir tous les changements
3. **Persistance** : Les paramètres sont stockés dans la base de données et dans le localStorage du navigateur
4. **Validation** : Les champs marqués avec * sont requis
5. **Couleurs** : Utilisez le format hexadécimal (#rrggbb) pour les couleurs

## Fichiers Modifiés

### Backend
- `backend/prisma/schema.prisma` : Ajout du modèle AppSettings
- `backend/src/routes/app-settings.ts` : Routes API pour les paramètres
- `backend/src/index.ts` : Enregistrement des routes
- `backend/add_app_settings.sql` : Script SQL de création de table

### Frontend
- `frontend/src/types/index.ts` : Type AppSettings
- `frontend/src/store/appSettingsStore.ts` : Store Zustand
- `frontend/src/pages/AppSettingsPage.tsx` : Page d'administration
- `frontend/src/components/Layout.tsx` : Intégration des paramètres
- `frontend/src/pages/LoginPage.tsx` : Intégration des paramètres
- `frontend/src/App.tsx` : Chargement des paramètres au démarrage

## Support

Pour toute question ou problème, consultez la documentation principale ou créez une issue sur le dépôt GitHub.

## Roadmap Future

- [ ] Upload d'image pour logo personnalisé
- [ ] Gestion de thèmes prédéfinis
- [ ] Personnalisation avancée des couleurs (palette complète)
- [ ] Prévisualisation en temps réel lors de la modification
- [ ] Multi-langue pour l'interface
- [ ] Export/Import de configurations
