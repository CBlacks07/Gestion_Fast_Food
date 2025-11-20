import { PrismaClient } from '@prisma/client';

// Create Prisma client with retry logic
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Connection retry configuration
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

// Exponential backoff retry logic
async function connectWithRetry(retries = 0): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
      console.log(`⚠️  Database connection failed. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      console.error('Connection error:', error);

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retries + 1);
    } else {
      console.error('❌ Failed to connect to database after', MAX_RETRIES, 'attempts');
      throw error;
    }
  }
}

// Initiate connection with retry logic
connectWithRetry().catch((error) => {
  console.error('Fatal database connection error:', error);
  // Don't exit the process, let the application handle it gracefully
});

// Graceful shutdown
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

export default prisma;
