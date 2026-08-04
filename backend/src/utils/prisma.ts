import { PrismaClient } from '@prisma/client';

const isServerless = Boolean(process.env.VERCEL);

// Un seul client par processus. Sur Vercel, une instance Lambda « chaude »
// réexécute le module : sans ce cache global on accumulerait des pools de
// connexions et on épuiserait le quota Neon.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (isServerless) {
  // En serverless, Prisma se connecte paresseusement à la première requête.
  // Une boucle de reconnexion au chargement du module consommerait le budget
  // d'exécution du cold start sans rien apporter.
  globalForPrisma.prisma = prisma;
} else {
  // Serveur long-vivant : on établit la connexion au démarrage, avec retries,
  // pour absorber une base qui met du temps à être prête (docker compose...).
  const MAX_RETRIES = 5;
  const INITIAL_RETRY_DELAY = 2000; // 2 secondes

  const connectWithRetry = async (retries = 0): Promise<void> => {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      if (retries < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
        console.log(
          `Database connection failed. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`
        );
        console.error('Connection error:', error);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return connectWithRetry(retries + 1);
      }
      console.error('Failed to connect to database after', MAX_RETRIES, 'attempts');
      throw error;
    }
  };

  connectWithRetry().catch((error) => {
    console.error('Fatal database connection error:', error);
    // Ne pas quitter le processus : l'application gère l'indisponibilité.
  });

  // Arrêt propre
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;
