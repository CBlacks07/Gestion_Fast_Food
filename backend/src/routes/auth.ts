import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login - Connexion
  app.post('/login', async (request, reply) => {
    try {
      const { username, password } = request.body as {
        username: string;
        password: string;
      };

      // Rechercher l'utilisateur
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: username },
          ],
          isActive: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'Nom d\'utilisateur ou mot de passe incorrect',
        });
      }

      // Vérifier le mot de passe (en clair pour le moment - à hasher en production)
      if (user.password !== password) {
        return reply.status(401).send({
          success: false,
          error: 'Nom d\'utilisateur ou mot de passe incorrect',
        });
      }

      // Retourner l'utilisateur sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;

      // Log activity
      await logActivity({
        type: 'USER_LOGIN',
        userId: user.id,
        description: `Connexion réussie: ${user.username}`,
        ipAddress: request.ip,
      });

      return reply.send({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la connexion',
      });
    }
  });

  // GET /api/auth/me - Récupérer l'utilisateur actuel
  app.get('/me', async (request, reply) => {
    try {
      const { userId } = request.query as { userId: string };

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'Non authentifié',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé',
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      return reply.send({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de l\'utilisateur',
      });
    }
  });
}
