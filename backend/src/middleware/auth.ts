import { FastifyRequest, FastifyReply } from 'fastify';

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

// Augmenter le type FastifyRequest pour inclure user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Vérifier le token JWT
    const payload = await request.jwtVerify() as JWTPayload;
    request.user = payload;
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: 'Non authentifié. Token invalide ou expiré.',
    });
  }
}

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * @param roles - Liste des rôles autorisés
 */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // D'abord vérifier l'authentification
    await requireAuth(request, reply);

    // Si l'authentification a échoué, ne pas continuer
    if (reply.sent) return;

    const user = request.user as JWTPayload;

    // Vérifier si l'utilisateur a le rôle requis
    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        success: false,
        error: `Accès refusé. Rôles requis: ${roles.join(', ')}`,
      });
    }
  };
}

/**
 * Middleware optionnel d'authentification
 * Charge l'utilisateur s'il est authentifié, mais ne bloque pas la requête
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = await request.jwtVerify() as JWTPayload;
    request.user = payload;
  } catch (err) {
    // Ne pas bloquer la requête, juste ne pas charger l'utilisateur
    request.user = undefined;
  }
}
