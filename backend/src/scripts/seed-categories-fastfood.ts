import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🍔 Starting fast-food categories seeding...');

  try {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log('ℹ️  Categories already exist, skipping...');
      return;
    }

    console.log('📦 Creating 43 fast-food categories...');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../../add-categories-fastfood.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Nettoyer le SQL des commandes PostgreSQL spécifiques
    const cleanedSql = sqlContent
      .replace(/SET session_replication_role = 'replica';/g, '')
      .replace(/SET session_replication_role = 'origin';/g, '')
      .replace(/DO \$\$[\s\S]*?END \$\$/g, ''); // Retirer le bloc DO

    // Exécuter le SQL via Prisma
    await prisma.$executeRawUnsafe(cleanedSql);

    const categoryCount = await prisma.category.count();
    console.log(`✅ ${categoryCount} categories created successfully!`);
    console.log('');
    console.log('Categories disponibles:');
    console.log('  🍔 Burgers, Pizzas, Tacos, Wraps, Sandwichs');
    console.log('  🍗 Poulet Frit, Nuggets, Ailes');
    console.log('  🥗 Salades, Végétarien, Bowls');
    console.log('  🍟 Frites et Accompagnements');
    console.log('  🍰 Desserts, Glaces, Milkshakes, Donuts');
    console.log('  🥤 Sodas, Jus, Smoothies, Cafés, Thés');
    console.log('  📦 Menus et Formules');
    console.log('  ... et plus encore!');
    console.log('');
  } catch (error) {
    console.error('❌ Error during categories seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
