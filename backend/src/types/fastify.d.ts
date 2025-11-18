// Type definitions for Fastify JWT authentication

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JWTPayload;
  }
}
