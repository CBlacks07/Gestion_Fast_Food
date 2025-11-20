import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log('ℹ️  Database already seeded, skipping...');
      return;
    }

    console.log('📦 Creating categories...');
    const burgers = await prisma.category.create({
      data: {
        name: 'Burgers',
        description: 'Nos délicieux burgers',
        icon: '🍔',
        displayOrder: 1,
      },
    });

    const drinks = await prisma.category.create({
      data: {
        name: 'Boissons',
        description: 'Boissons fraîches',
        icon: '🥤',
        displayOrder: 2,
      },
    });

    const sides = await prisma.category.create({
      data: {
        name: 'Accompagnements',
        description: 'Frites, salades, etc.',
        icon: '🍟',
        displayOrder: 3,
      },
    });

    const desserts = await prisma.category.create({
      data: {
        name: 'Desserts',
        description: 'Desserts gourmands',
        icon: '🍰',
        displayOrder: 4,
      },
    });

    console.log('✅ Categories created');

    console.log('📦 Creating ingredients...');
    await prisma.ingredient.createMany({
      data: [
        { name: 'Pain burger', unit: 'PIECE', currentStock: 100, minStock: 20, unitCost: 0.5 },
        { name: 'Steak haché', unit: 'GRAM', currentStock: 5000, minStock: 1000, unitCost: 0.01 },
        { name: 'Fromage', unit: 'GRAM', currentStock: 2000, minStock: 500, unitCost: 0.015 },
        { name: 'Salade', unit: 'GRAM', currentStock: 3000, minStock: 500, unitCost: 0.005 },
        { name: 'Tomate', unit: 'GRAM', currentStock: 3000, minStock: 500, unitCost: 0.008 },
        { name: 'Oignon', unit: 'GRAM', currentStock: 2000, minStock: 500, unitCost: 0.006 },
        { name: 'Sauce burger', unit: 'MILLILITER', currentStock: 5000, minStock: 1000, unitCost: 0.003 },
        { name: 'Pommes de terre', unit: 'GRAM', currentStock: 10000, minStock: 2000, unitCost: 0.002 },
        { name: 'Coca-Cola', unit: 'LITER', currentStock: 50, minStock: 10, unitCost: 1.5 },
        { name: 'Fanta', unit: 'LITER', currentStock: 40, minStock: 10, unitCost: 1.5 },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Ingredients created');

    console.log('📦 Creating products...');
    await prisma.product.createMany({
      data: [
        {
          name: 'Burger Classic',
          description: 'Notre burger signature',
          price: 5.99,
          cost: 2.5,
          type: 'FOOD',
          categoryId: burgers.id,
          preparationTime: 10,
        },
        {
          name: 'Cheeseburger',
          description: 'Burger avec fromage',
          price: 6.99,
          cost: 2.8,
          type: 'FOOD',
          categoryId: burgers.id,
          preparationTime: 10,
        },
        {
          name: 'Burger Bacon',
          description: 'Burger avec bacon croustillant',
          price: 7.99,
          cost: 3.2,
          type: 'FOOD',
          categoryId: burgers.id,
          preparationTime: 12,
        },
        {
          name: 'Frites',
          description: 'Frites croustillantes',
          price: 2.99,
          cost: 0.8,
          type: 'SIDE',
          categoryId: sides.id,
          preparationTime: 5,
        },
        {
          name: 'Salade César',
          description: 'Salade fraîche avec poulet',
          price: 4.99,
          cost: 2.0,
          type: 'SIDE',
          categoryId: sides.id,
          preparationTime: 5,
        },
        {
          name: 'Coca-Cola',
          description: 'Coca-Cola 33cl',
          price: 1.99,
          cost: 0.5,
          type: 'DRINK',
          categoryId: drinks.id,
          preparationTime: 1,
        },
        {
          name: 'Fanta',
          description: 'Fanta Orange 33cl',
          price: 1.99,
          cost: 0.5,
          type: 'DRINK',
          categoryId: drinks.id,
          preparationTime: 1,
        },
        {
          name: 'Eau minérale',
          description: 'Eau minérale 50cl',
          price: 1.49,
          cost: 0.3,
          type: 'DRINK',
          categoryId: drinks.id,
          preparationTime: 1,
        },
        {
          name: 'Brownie',
          description: 'Brownie au chocolat',
          price: 3.99,
          cost: 1.5,
          type: 'DESSERT',
          categoryId: desserts.id,
          preparationTime: 2,
        },
        {
          name: 'Sundae',
          description: 'Glace vanille avec sauce chocolat',
          price: 4.49,
          cost: 1.8,
          type: 'DESSERT',
          categoryId: desserts.id,
          preparationTime: 3,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Products created');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
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
