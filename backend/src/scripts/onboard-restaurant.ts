/**
 * Crée un nouveau restaurant client : établissement + compte admin, et
 * optionnellement des catégories de départ. Remplace l'ancien
 * create-admin.ts (qui créait un admin global unique, incompatible
 * multi-tenant).
 *
 * Usage :
 *   npx tsx src/scripts/onboard-restaurant.ts \
 *     --code=CHEZFATOU --name="Chez Fatou" \
 *     --admin-username=fatou --admin-email=fatou@example.com \
 *     [--admin-password=...] [--with-default-categories]
 */
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import prisma from '../utils/prisma';
import { DEFAULT_FASTFOOD_CATEGORIES } from '../data/default-fastfood-categories';

const SALT_ROUNDS = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const arg = args.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.slice(flag.length + 3) : undefined;
  };
  return {
    code: get('code'),
    name: get('name'),
    adminUsername: get('admin-username'),
    adminEmail: get('admin-email'),
    adminPassword: get('admin-password'),
    withDefaultCategories: args.includes('--with-default-categories'),
  };
}

function generatePassword(): string {
  return randomBytes(9).toString('base64url');
}

async function main() {
  const { code, name, adminUsername, adminEmail, adminPassword, withDefaultCategories } = parseArgs();

  if (!code || !name || !adminUsername || !adminEmail) {
    console.error(
      'Usage: npx tsx src/scripts/onboard-restaurant.ts --code=CHEZFATOU --name="Chez Fatou" --admin-username=fatou --admin-email=fatou@example.com [--admin-password=...] [--with-default-categories]'
    );
    process.exit(1);
  }

  const normalizedCode = code.trim().toUpperCase();

  const existing = await prisma.restaurant.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    console.error(`Le code établissement "${normalizedCode}" est déjà utilisé.`);
    process.exit(1);
  }

  const plainPassword = adminPassword || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: { code: normalizedCode, name, isActive: true },
    });

    const admin = await tx.user.create({
      data: {
        restaurantId: restaurant.id,
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        firstName: 'Administrateur',
        lastName: name,
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (withDefaultCategories) {
      await tx.category.createMany({
        data: DEFAULT_FASTFOOD_CATEGORIES.map((c) => ({ ...c, restaurantId: restaurant.id })),
      });
    }

    await tx.appSettings.create({
      data: {
        restaurantId: restaurant.id,
        appName: name,
        appIcon: '🍔',
        primaryColor: '#ef4444',
        currency: 'FCFA',
        currencySymbol: 'FCFA',
        taxRate: 0,
      },
    });

    return { restaurant, admin };
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Restaurant créé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` Nom            : ${result.restaurant.name}`);
  console.log(` Code           : ${result.restaurant.code}`);
  console.log(` Admin username : ${result.admin.username}`);
  console.log(` Admin email    : ${result.admin.email}`);
  console.log(` Admin password : ${plainPassword}`);
  if (withDefaultCategories) {
    console.log(` Catégories     : ${DEFAULT_FASTFOOD_CATEGORIES.length} catégories de départ créées`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' IMPORTANT: transmettre ces identifiants au client et lui');
  console.log(' demander de changer le mot de passe après la première connexion.');
  console.log('');
}

main()
  .catch((error) => {
    console.error('Erreur lors de la création du restaurant:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
