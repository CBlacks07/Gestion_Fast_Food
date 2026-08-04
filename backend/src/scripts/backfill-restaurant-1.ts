/**
 * Backfill du passage multi-tenant : crée le restaurant n°1 et lui rattache
 * toutes les lignes existantes (restaurantId encore NULL) de chaque modèle
 * racine. Idempotent : ré-exécutable sans risque (n'affecte que les lignes
 * dont restaurantId est encore NULL).
 *
 * Usage : npx tsx src/scripts/backfill-restaurant-1.ts --code=RESTO1 --name="Mon Restaurant"
 */
import prisma from '../utils/prisma';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const arg = args.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.slice(flag.length + 3) : undefined;
  };
  return { code: get('code'), name: get('name') };
}

async function main() {
  const { code, name } = parseArgs();
  if (!code || !name) {
    console.error('Usage: npx tsx src/scripts/backfill-restaurant-1.ts --code=RESTO1 --name="Mon Restaurant"');
    process.exit(1);
  }
  const normalizedCode = code.trim().toUpperCase();

  console.log('Backfill du restaurant n°1...\n');

  const restaurant = await prisma.restaurant.upsert({
    where: { code: normalizedCode },
    update: {},
    create: { code: normalizedCode, name, isActive: true },
  });
  console.log(`Restaurant: ${restaurant.name} (${restaurant.code}) — id ${restaurant.id}\n`);

  const models = [
    { name: 'User', fn: () => prisma.user.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Category', fn: () => prisma.category.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Product', fn: () => prisma.product.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Option', fn: () => prisma.option.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Ingredient', fn: () => prisma.ingredient.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Table', fn: () => prisma.table.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Order', fn: () => prisma.order.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'Payment', fn: () => prisma.payment.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'DailyClosure', fn: () => prisma.dailyClosure.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'ActivityLog', fn: () => prisma.activityLog.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
    { name: 'AppSettings', fn: () => prisma.appSettings.updateMany({ where: { restaurantId: null }, data: { restaurantId: restaurant.id } }) },
  ];

  for (const model of models) {
    const result = await model.fn();
    console.log(`${model.name}: ${result.count} ligne(s) rattachée(s)`);
  }

  console.log('\nBackfill terminé. Vérification (doit afficher 0 partout) :');
  const checks = [
    { name: 'User', count: await prisma.user.count({ where: { restaurantId: null } }) },
    { name: 'Category', count: await prisma.category.count({ where: { restaurantId: null } }) },
    { name: 'Product', count: await prisma.product.count({ where: { restaurantId: null } }) },
    { name: 'Option', count: await prisma.option.count({ where: { restaurantId: null } }) },
    { name: 'Ingredient', count: await prisma.ingredient.count({ where: { restaurantId: null } }) },
    { name: 'Table', count: await prisma.table.count({ where: { restaurantId: null } }) },
    { name: 'Order', count: await prisma.order.count({ where: { restaurantId: null } }) },
    { name: 'Payment', count: await prisma.payment.count({ where: { restaurantId: null } }) },
    { name: 'DailyClosure', count: await prisma.dailyClosure.count({ where: { restaurantId: null } }) },
    { name: 'ActivityLog', count: await prisma.activityLog.count({ where: { restaurantId: null } }) },
    { name: 'AppSettings', count: await prisma.appSettings.count({ where: { restaurantId: null } }) },
  ];
  for (const check of checks) {
    console.log(`  ${check.name}: ${check.count} ligne(s) restante(s) sans restaurantId`);
  }
}

main()
  .catch((error) => {
    console.error('Erreur lors du backfill:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
