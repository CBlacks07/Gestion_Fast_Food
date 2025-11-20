import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';
import { requireAuth } from '../middleware/auth';

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login - Connexion avec rate limiting strict
  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      try {
        const { username, password } = request.body as {
          username: string;
          password: string;
        };

        // Validation basique
        if (!username || !password) {
          return reply.status(400).send({
            success: false,
            error: 'Nom d\'utilisateur et mot de passe requis',
          });
        }

        // Rechercher l'utilisateur
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username }, { email: username }],
            isActive: true,
          },
        });

        if (!user) {
          // Log tentative de connexion échouée
          await logActivity({
            type: 'SYSTEM_ERROR',
            description: `Tentative de connexion échouée: ${username}`,
            ipAddress: request.ip,
            metadata: { username },
          });

          return reply.status(401).send({
            success: false,
            error: 'Nom d\'utilisateur ou mot de passe incorrect',
          });
        }

        // Vérifier le mot de passe avec bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          // Log tentative de connexion échouée
          await logActivity({
            type: 'SYSTEM_ERROR',
            userId: user.id,
            description: `Tentative de connexion échouée: ${user.username} (mauvais mot de passe)`,
            ipAddress: request.ip,
            metadata: { username: user.username },
          });

          return reply.status(401).send({
            success: false,
            error: 'Nom d\'utilisateur ou mot de passe incorrect',
          });
        }

        // Générer le token JWT
        const token = app.jwt.sign({
          userId: user.id,
          role: user.role,
          email: user.email,
        });

        // Retourner l'utilisateur sans le mot de passe + token
        const { password: _, ...userWithoutPassword } = user;

        // Log activité de connexion réussie
        await logActivity({
          type: 'USER_LOGIN',
          userId: user.id,
          description: `Connexion réussie: ${user.username}`,
          ipAddress: request.ip,
        });

        return reply.send({
          success: true,
          data: {
            user: userWithoutPassword,
            token,
          },
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erreur lors de la connexion',
        });
      }
    }
  );

  // GET /api/auth/me - Récupérer l'utilisateur actuel (protégé par JWT)
  app.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

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

  // POST /api/auth/logout - Déconnexion (pour le logging)
  app.post('/logout', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      // Log activité de déconnexion
      await logActivity({
        type: 'USER_LOGOUT',
        userId,
        description: 'Déconnexion',
        ipAddress: request.ip,
      });

      return reply.send({
        success: true,
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la déconnexion',
      });
    }
  });
}
