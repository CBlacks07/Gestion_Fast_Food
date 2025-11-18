-- ============================================
-- SCRIPT D'AJOUT DES CATÉGORIES DE FAST-FOOD
-- ============================================
-- Ce script ajoute toutes les catégories typiques d'un restaurant fast-food
-- avec des emojis appropriés et un ordre d'affichage logique
-- Date: 2025-01-18
-- ============================================

-- Supprimer les anciennes catégories (optionnel - décommenter si nécessaire)
-- TRUNCATE TABLE "categories" CASCADE;

-- Désactiver temporairement les contraintes
SET session_replication_role = 'replica';

-- CATÉGORIES PRINCIPALES - PLATS
INSERT INTO "categories" ("id", "name", "description", "icon", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-burgers', 'Burgers', 'Nos délicieux burgers faits maison', '🍔', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-pizzas', 'Pizzas', 'Pizzas fraîches à l''italienne', '🍕', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-tacos', 'Tacos', 'Tacos mexicains garnis', '🌮', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-wraps', 'Wraps', 'Wraps frais et savoureux', '🌯', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-sandwichs', 'Sandwichs', 'Sandwichs variés et copieux', '🥪', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-paninis', 'Paninis', 'Paninis chauds et croustillants', '🥖', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-kebabs', 'Kebabs', 'Kebabs généreux', '🥙', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-hot-dogs', 'Hot-Dogs', 'Hot-dogs américains', '🌭', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- POULET ET VIANDES
  ('cat-poulet-frit', 'Poulet Frit', 'Poulet croustillant et doré', '🍗', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-nuggets', 'Nuggets & Tenders', 'Nuggets et tenders de poulet', '🍿', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-ailes', 'Ailes de Poulet', 'Ailes de poulet épicées', '🍖', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- PLATS CHAUDS
  ('cat-pates', 'Pâtes', 'Pâtes fraîches et sauces maison', '🍝', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-plats-chauds', 'Plats Chauds', 'Plats du jour et spécialités', '🍲', 13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-grillades', 'Grillades', 'Viandes et poissons grillés', '🥩', 14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- OPTIONS SAINES
  ('cat-salades', 'Salades', 'Salades fraîches et composées', '🥗', 15, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-vegetarien', 'Végétarien', 'Options sans viande', '🥬', 16, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-bowls', 'Bowls', 'Bowls santé et équilibrés', '🥙', 17, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- ACCOMPAGNEMENTS
  ('cat-frites', 'Frites', 'Frites croustillantes', '🍟', 18, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-accompagnements', 'Accompagnements', 'Tous nos accompagnements', '🥔', 19, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-sauces', 'Sauces', 'Large choix de sauces', '🧉', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- PETITS DÉJEUNERS
  ('cat-petit-dej', 'Petit-Déjeuner', 'Options petit-déjeuner', '🥐', 21, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-viennoiseries', 'Viennoiseries', 'Croissants et pains au chocolat', '🥯', 22, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- DESSERTS
  ('cat-desserts', 'Desserts', 'Desserts gourmands', '🍰', 23, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-glaces', 'Glaces', 'Glaces et sundaes', '🍦', 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-milkshakes', 'Milkshakes', 'Milkshakes onctueux', '🥤', 25, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-patisseries', 'Pâtisseries', 'Gâteaux et douceurs', '🧁', 26, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-donuts', 'Donuts', 'Donuts moelleux', '🍩', 27, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-cookies', 'Cookies', 'Cookies maison', '🍪', 28, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- BOISSONS FROIDES
  ('cat-sodas', 'Sodas', 'Boissons gazeuses', '🥤', 29, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-jus', 'Jus de Fruits', 'Jus naturels et pressés', '🧃', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-smoothies', 'Smoothies', 'Smoothies fruits frais', '🍹', 31, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-eau', 'Eaux', 'Eaux plates et gazeuses', '💧', 32, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-boissons-froides', 'Boissons Fraîches', 'Boissons froides variées', '🧊', 33, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- BOISSONS CHAUDES
  ('cat-cafes', 'Cafés', 'Cafés et expressos', '☕', 34, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-thes', 'Thés', 'Thés et infusions', '🍵', 35, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-chocolats-chauds', 'Chocolats Chauds', 'Chocolats chauds gourmands', '🍫', 36, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- MENUS ET FORMULES
  ('cat-menus', 'Menus & Formules', 'Menus complets avantageux', '📦', 37, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-menu-enfant', 'Menu Enfant', 'Menus spéciaux pour enfants', '👶', 38, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-menu-midi', 'Menu Midi', 'Formules déjeuner rapide', '⏰', 39, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-menu-famille', 'Menu Famille', 'Formules pour toute la famille', '👨‍👩‍👧‍👦', 40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  -- SNACKS ET EXTRAS
  ('cat-snacks', 'Snacks', 'En-cas et petites faims', '🍿', 41, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-apero', 'Apéritif', 'Planches et tapas', '🍢', 42, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-extras', 'Extras', 'Suppléments et options', '➕', 43, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "icon" = EXCLUDED."icon",
  "displayOrder" = EXCLUDED."displayOrder",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Message de confirmation
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM "categories" WHERE "isActive" = true;

  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ CATÉGORIES AJOUTÉES AVEC SUCCÈS !';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total de catégories actives: %', category_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Catégories créées:';
  RAISE NOTICE '   • Burgers, Pizzas, Tacos, Wraps';
  RAISE NOTICE '   • Sandwichs, Paninis, Kebabs, Hot-Dogs';
  RAISE NOTICE '   • Poulet Frit, Nuggets, Ailes';
  RAISE NOTICE '   • Pâtes, Plats Chauds, Grillades';
  RAISE NOTICE '   • Salades, Végétarien, Bowls';
  RAISE NOTICE '   • Frites, Accompagnements, Sauces';
  RAISE NOTICE '   • Petit-Déjeuner, Viennoiseries';
  RAISE NOTICE '   • Desserts, Glaces, Milkshakes';
  RAISE NOTICE '   • Pâtisseries, Donuts, Cookies';
  RAISE NOTICE '   • Sodas, Jus, Smoothies, Eaux';
  RAISE NOTICE '   • Cafés, Thés, Chocolats Chauds';
  RAISE NOTICE '   • Menus & Formules';
  RAISE NOTICE '   • Snacks, Apéritif, Extras';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Conseil: Désactivez ou supprimez les catégories';
  RAISE NOTICE '   dont vous n''avez pas besoin dans l''interface admin';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$;
