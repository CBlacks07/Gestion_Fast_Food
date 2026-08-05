/**
 * Crée le compte superadmin de la plateforme (aucun restaurant associé).
 * À exécuter une seule fois pour bootstrapper l'accès à /admin — ensuite,
 * d'autres superadmins peuvent être créés directement depuis l'interface
 * (si besoin) ou en relançant ce script.
 *
 * Usage :
 *   npx tsx src/scripts/create-platform-admin.ts \
 *     --username=ccl --email=ccl@exemple.com [--password=...]
 */
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import prisma from '../utils/prisma';

const SALT_ROUNDS = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const arg = args.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.slice(flag.length + 3) : undefined;
  };
  return { username: get('username'), email: get('email'), password: get('password') };
}

function generatePassword(): string {
  return randomBytes(9).toString('base64url');
}

async function main() {
  const { username, email, password } = parseArgs();

  if (!username || !email) {
    console.error('Usage: npx tsx src/scripts/create-platform-admin.ts --username=ccl --email=ccl@exemple.com [--password=...]');
    process.exit(1);
  }

  const existing = await prisma.platformAdmin.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) {
    console.error('Un superadmin avec cet identifiant ou cet email existe déjà.');
    process.exit(1);
  }

  const plainPassword = password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const admin = await prisma.platformAdmin.create({
    data: { username, email, password: hashedPassword, isActive: true },
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Superadmin créé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` Username : ${admin.username}`);
  console.log(` Email    : ${admin.email}`);
  console.log(` Password : ${plainPassword}`);
  console.log(' Connexion : /admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

main()
  .catch((error) => {
    console.error('Erreur lors de la création du superadmin:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
