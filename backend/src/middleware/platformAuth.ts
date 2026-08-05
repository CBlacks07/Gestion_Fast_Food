import { FastifyRequest, FastifyReply } from 'fastify';
import { PlatformAdminJWTPayload } from '../types/fastify';

/**
* Middleware d'authentification pour les routes /api/platform/*.
* Complètement indépendant de requireAuth/requireRole (routes tenant) :
* vérifie le JWT et exige un `platformAdminId`, jamais un `userId`/
* `restaurantId`. Le hook global de app.ts saute exprès la vérification
* tenant pour ce préfixe (voir app.ts), donc chaque route /api/platform/*
* DOIT utiliser ce middleware pour rester protégée.
*/
export async function requirePlatformAdmin(
request: FastifyRequest,
reply: FastifyReply
) {
try {
const payload = await request.jwtVerify<PlatformAdminJWTPayload>();
// Vérifier la forme, pas juste la signature : un token tenant (utilisateur
// de restaurant) est signé avec le même secret mais n'a pas de
// platformAdminId — sans ce contrôle il serait accepté ici aussi.
if (typeof payload.platformAdminId !== 'string') {
throw new Error('Not a platform admin token');
}
request.platformAdmin = payload;
} catch (err) {
return reply.status(401).send({
success: false,
error: 'Non authentifié en tant que superadmin. Token invalide ou expiré.',
});
}
}
