const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runSQL() {
try {
console.log(' Lecture du fichier SQL...');
const sqlFile = fs.readFileSync(
path.join(__dirname, 'add_app_settings.sql'),
'utf-8'
);

// Séparer les commandes SQL (enlever les DO blocks qui peuvent poser problème)
const createTable = `
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
);`;

const insertData = `
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
);`;

console.log(' Création de la table app_settings...');
await prisma.$executeRawUnsafe(createTable);

console.log(' Insertion des paramètres par défaut...');
await prisma.$executeRawUnsafe(insertData);

console.log(' Script SQL exécuté avec succès!');
console.log('==============================================');
console.log('Table app_settings créée avec succès!');
console.log('Paramètres par défaut initialisés');
console.log('==============================================');

} catch (error) {
console.error(' Erreur lors de l\'exécution du SQL:', error);
process.exit(1);
} finally {
await prisma.$disconnect();
}
}

runSQL();
