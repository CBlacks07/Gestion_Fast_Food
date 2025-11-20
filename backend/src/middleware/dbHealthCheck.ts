import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../utils/prisma';

let isDbConnected = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 5000; // 5 secondes

// Vérifier la connexion à la base de données
export async function checkDbConnection(): Promise<boolean> {
  const now = Date.now();

  // Utiliser le cache si la dernière vérification date de moins de 5 secondes
  if (isDbConnected && (now - lastCheckTime) < CHECK_INTERVAL) {
    return true;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    lastCheckTime = now;
    return true;
  } catch (error) {
    isDbConnected = false;
    lastCheckTime = now;
    console.error('Database health check failed:', error);
    return false;
  }
}

// Middleware pour vérifier la santé de la DB avant les requêtes
export async function dbHealthCheckMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const isConnected = await checkDbConnection();

  if (!isConnected) {
    return reply.status(503).send({
      success: false,
      error: 'Service temporairement indisponible. La base de données est en cours de connexion...',
      retryAfter: 5,
    });
  }
}
