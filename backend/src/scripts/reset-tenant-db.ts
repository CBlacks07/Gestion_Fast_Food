/**
 * Supprime intégralement les données d'UN restaurant (et le restaurant
 * lui-même). Remplace l'ancien reset-db.ts qui videait TOUTE la base sans
 * filtre — inutilisable sur une base multi-tenant partagée.
 *
 * Toutes les tables liées à un restaurant ont `onDelete: Cascade` vers
 * Restaurant dans le schéma Prisma : supprimer la ligne Restaurant suffit,
 * Postgres cascade vers users/categories/products/orders/... automatiquement.
 *
 * Garde-fous : nécessite ALLOW_DESTRUCTIVE_RESET=yes-i-am-sure, et refuse de
 * s'exécuter si DATABASE_URL pointe vers un hôte Neon sans le flag explicite
 * --i-know-this-is-prod (pour éviter un accident sur la base de prod).
 *
 * Usage : ALLOW_DESTRUCTIVE_RESET=yes-i-am-sure npx tsx src/scripts/reset-tenant-db.ts --restaurant=CHEZFATOU
 */
import prisma from '../utils/prisma';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const arg = args.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.slice(flag.length + 3) : undefined;
  };
  return {
    restaurantCode: get('restaurant'),
    knowsProd: args.includes('--i-know-this-is-prod'),
  };
}

async function main() {
  const { restaurantCode, knowsProd } = parseArgs();

  if (!restaurantCode) {
    console.error('Usage: ALLOW_DESTRUCTIVE_RESET=yes-i-am-sure npx tsx src/scripts/reset-tenant-db.ts --restaurant=CHEZFATOU');
    process.exit(1);
  }

  if (process.env.ALLOW_DESTRUCTIVE_RESET !== 'yes-i-am-sure') {
    console.error('Refusé : définir ALLOW_DESTRUCTIVE_RESET=yes-i-am-sure pour confirmer cette opération destructive.');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('neon.tech') && !knowsProd) {
    console.error(
      'Refusé : DATABASE_URL pointe vers Neon (probablement la production). ' +
      'Ajouter --i-know-this-is-prod si c\'est vraiment voulu.'
    );
    process.exit(1);
  }

  const normalizedCode = restaurantCode.trim().toUpperCase();
  const restaurant = await prisma.restaurant.findUnique({ where: { code: normalizedCode } });

  if (!restaurant) {
    console.error(`Aucun restaurant avec le code "${normalizedCode}".`);
    process.exit(1);
  }

  console.log(`Suppression du restaurant "${restaurant.name}" (${restaurant.code}) et de toutes ses données...`);
  await prisma.restaurant.delete({ where: { id: restaurant.id } });
  console.log('Terminé.');
}

main()
  .catch((error) => {
    console.error('Erreur lors de la réinitialisation:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
