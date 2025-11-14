-- Script de réinitialisation de la base de données
-- ATTENTION: Ce script supprime TOUTES les données et ne garde que l'utilisateur admin
-- Date: 2025-11-14

-- Désactiver temporairement les contraintes de clés étrangères
SET session_replication_role = 'replica';

-- Supprimer toutes les données dans l'ordre inverse des dépendances
TRUNCATE TABLE "activity_logs" CASCADE;
TRUNCATE TABLE "daily_closures" CASCADE;
TRUNCATE TABLE "stock_movements" CASCADE;
TRUNCATE TABLE "recipes" CASCADE;
TRUNCATE TABLE "order_item_options" CASCADE;
TRUNCATE TABLE "order_items" CASCADE;
TRUNCATE TABLE "payments" CASCADE;
TRUNCATE TABLE "orders" CASCADE;
TRUNCATE TABLE "product_options" CASCADE;
TRUNCATE TABLE "products" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "options" CASCADE;
TRUNCATE TABLE "ingredients" CASCADE;
TRUNCATE TABLE "tables" CASCADE;
TRUNCATE TABLE "users" CASCADE;

-- Réactiver les contraintes de clés étrangères
SET session_replication_role = 'origin';

-- Recréer l'utilisateur admin par défaut
-- Username: admin
-- Password: admin123
-- Hash bcrypt généré pour 'admin123'
INSERT INTO "users" (
  "id",
  "email",
  "username",
  "password",
  "firstName",
  "lastName",
  "role",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-default-id',
  'admin@fastfood.com',
  'admin',
  '$2b$10$YourBcryptHashHere',  -- Ce hash sera remplacé par le script
  'Admin',
  'System',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Base de donnees reinitialisee avec succes!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Utilisateur admin cree:';
  RAISE NOTICE '  Username: admin';
  RAISE NOTICE '  Password: admin123';
  RAISE NOTICE '  Email: admin@fastfood.com';
  RAISE NOTICE '==============================================';
END $$;
