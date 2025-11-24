-- Nettoyer les URLs de logo en base de données
-- Remplacer http://localhost:3002/uploads/ par /uploads/

UPDATE "AppSettings"
SET "logoUrl" = REPLACE("logoUrl", 'http://localhost:3002/uploads/', '/uploads/')
WHERE "logoUrl" LIKE 'http://localhost:3002/uploads/%';

-- Afficher les URLs mises à jour
SELECT id, "appName", "logoUrl" FROM "AppSettings";
