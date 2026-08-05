// Type definitions for Fastify JWT authentication

export interface JWTPayload {
userId: string;
restaurantId: string;
role: string;
email: string;
}

// Payload distinct pour le superadmin de la plateforme : n'appartient à aucun
// restaurant, jamais mélangé avec JWTPayload (voir middleware/platformAuth.ts).
export interface PlatformAdminJWTPayload {
platformAdminId: string;
email: string;
}

declare module 'fastify' {
interface FastifyRequest {
user?: JWTPayload;
platformAdmin?: PlatformAdminJWTPayload;
}
}

declare module '@fastify/jwt' {
interface FastifyJWT {
user: JWTPayload;
}
}
