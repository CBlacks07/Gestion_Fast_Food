-- Script pour ajouter la table app_settings
-- Date: 2025-11-17

-- Créer la table app_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS "app_settings" (
"id" TEXT NOT NULL PRIMARY KEY,
"appName" TEXT NOT NULL DEFAULT 'Gestion Fast-Food',
"appIcon" TEXT NOT NULL DEFAULT '',
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

-- Insérer les paramètres par défaut s'ils n'existent pas
INSERT INTO "app_settings" (
"id",
"appName",
"appIcon",
"primaryColor",
"currency",
"currencySymbol",
"taxRate",
"isActive",
"createdAt",
"updatedAt"
)
SELECT
'default-settings-id',
'Gestion Fast-Food',
'',
'#ef4444',
'FCFA',
'FCFA',
0,
true,
CURRENT_TIMESTAMP,
CURRENT_TIMESTAMP
WHERE NOT EXISTS (
SELECT 1 FROM "app_settings" WHERE "isActive" = true
);

-- Message de confirmation
DO $$
BEGIN
RAISE NOTICE '==============================================';
RAISE NOTICE 'Table app_settings creee avec succes!';
RAISE NOTICE 'Parametres par defaut initialises';
RAISE NOTICE '==============================================';
END $$;
