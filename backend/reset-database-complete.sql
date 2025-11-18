-- ============================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE DE LA BASE DE DONNÉES
-- ============================================
-- Ce script supprime toutes les données et ne conserve que l'admin
-- Date: 2025-01-18
-- ============================================

-- Désactiver temporairement les contraintes de clés étrangères
SET session_replication_role = 'replica';

-- 1. SUPPRIMER TOUTES LES DONNÉES DES TABLES (dans l'ordre inverse des dépendances)
TRUNCATE TABLE "activity_logs" CASCADE;
TRUNCATE TABLE "daily_closures" CASCADE;
TRUNCATE TABLE "order_item_options" CASCADE;
TRUNCATE TABLE "order_items" CASCADE;
TRUNCATE TABLE "payments" CASCADE;
TRUNCATE TABLE "orders" CASCADE;
TRUNCATE TABLE "stock_movements" CASCADE;
TRUNCATE TABLE "recipes" CASCADE;
TRUNCATE TABLE "product_options" CASCADE;
TRUNCATE TABLE "products" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "options" CASCADE;
TRUNCATE TABLE "ingredients" CASCADE;
TRUNCATE TABLE "tables" CASCADE;
TRUNCATE TABLE "users" CASCADE;
TRUNCATE TABLE "app_settings" CASCADE;

-- Réactiver les contraintes de clés étrangères
SET session_replication_role = 'origin';

-- 2. CRÉER L'UTILISATEUR ADMIN PAR DÉFAUT
-- Mot de passe: Admin123 (en clair)
INSERT INTO "users" ("id", "email", "username", "password", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-default-id',
  'admin@fastfood.com',
  'admin',
  'Admin123',
  'Administrateur',
  'Système',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 3. CRÉER LES PARAMÈTRES PAR DÉFAUT DE L'APPLICATION
INSERT INTO "app_settings" (
  "id",
  "appName",
  "appIcon",
  "slogan",
  "primaryColor",
  "secondaryColor",
  "companyName",
  "currency",
  "currencySymbol",
  "taxRate",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  'default-settings-id',
  'Gestion Fast-Food',
  '🍔',
  'Votre solution de gestion complète',
  '#ef4444',
  '#6b7280',
  null,
  'FCFA',
  'FCFA',
  0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 4. MESSAGE DE CONFIRMATION
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ BASE DE DONNÉES RÉINITIALISÉE AVEC SUCCÈS !';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Compte administrateur créé :';
  RAISE NOTICE '   Email: admin@fastfood.com';
  RAISE NOTICE '   Username: admin';
  RAISE NOTICE '   Password: Admin123';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  Paramètres par défaut initialisés';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes :';
  RAISE NOTICE '   1. Connectez-vous avec le compte admin';
  RAISE NOTICE '   2. Configurez les paramètres de votre application';
  RAISE NOTICE '   3. Créez vos utilisateurs (caissiers, gérants, etc.)';
  RAISE NOTICE '   4. Configurez vos produits et catégories';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$;
