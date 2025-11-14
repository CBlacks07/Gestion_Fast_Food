import prisma from '../utils/prisma';

async function resetDatabase() {
  console.log('🔄 Réinitialisation de la base de données...');

  try {
    // Supprimer toutes les données dans l'ordre approprié (en respectant les contraintes de clés étrangères)
    console.log('Suppression des données existantes...');

    await prisma.stockMovement.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.orderItemOption.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productOption.deleteMany({});
    await prisma.option.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Toutes les données ont été supprimées');

    // Optionnel : Réinsérer des données de seed de base
    console.log('Création de l\'utilisateur admin par défaut...');

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@fastfood.com',
        username: 'admin',
        password: 'admin123', // En production, utiliser un hash
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Utilisateur admin créé (username: admin, password: admin123)');

    console.log('Création de catégories par défaut...');

    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Burgers',
          description: 'Nos délicieux burgers',
          icon: '🍔',
          displayOrder: 1,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Boissons',
          description: 'Boissons fraîches et chaudes',
          icon: '🥤',
          displayOrder: 2,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Desserts',
          description: 'Desserts et sucreries',
          icon: '🍰',
          displayOrder: 3,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Accompagnements',
          description: 'Frites, salades, etc.',
          icon: '🍟',
          displayOrder: 4,
          isActive: true,
        },
      }),
    ]);

    console.log('✅ Catégories créées');

    console.log('Création de tables par défaut...');

    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push(
        prisma.table.create({
          data: {
            number: i,
            capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
            isActive: true,
          },
        })
      );
    }
    await Promise.all(tables);

    console.log('✅ 10 tables créées');

    console.log('Création d\'options par défaut...');

    await Promise.all([
      prisma.option.create({
        data: {
          name: 'Fromage Supplémentaire',
          type: 'SUPPLEMENT',
          price: 500,
          isActive: true,
        },
      }),
      prisma.option.create({
        data: {
          name: 'Bacon',
          type: 'SUPPLEMENT',
          price: 750,
          isActive: true,
        },
      }),
      prisma.option.create({
        data: {
          name: 'Sans Oignon',
          type: 'REMOVAL',
          price: 0,
          isActive: true,
        },
      }),
      prisma.option.create({
        data: {
          name: 'Sans Salade',
          type: 'REMOVAL',
          price: 0,
          isActive: true,
        },
      }),
    ]);

    console.log('✅ Options créées');

    console.log('Création de quelques ingrédients par défaut...');

    await Promise.all([
      prisma.ingredient.create({
        data: {
          name: 'Pain à Burger',
          unit: 'PIECE',
          currentStock: 100,
          minStock: 20,
          unitCost: 150,
          isActive: true,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Viande Hachée',
          unit: 'KILOGRAM',
          currentStock: 50,
          minStock: 10,
          unitCost: 5000,
          isActive: true,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Fromage',
          unit: 'KILOGRAM',
          currentStock: 20,
          minStock: 5,
          unitCost: 3000,
          isActive: true,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Laitue',
          unit: 'KILOGRAM',
          currentStock: 15,
          minStock: 5,
          unitCost: 1000,
          isActive: true,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: 'Tomate',
          unit: 'KILOGRAM',
          currentStock: 20,
          minStock: 5,
          unitCost: 800,
          isActive: true,
        },
      }),
    ]);

    console.log('✅ Ingrédients créés');

    console.log('\n✨ Réinitialisation terminée avec succès!\n');
    console.log('Compte admin:');
    console.log('  Email: admin@fastfood.com');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nVous pouvez maintenant vous connecter et ajouter vos produits.\n');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
resetDatabase()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
