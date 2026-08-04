import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { join } from 'path';

// Import des routes
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import ingredientsRoutes from './routes/ingredients';
import usersRoutes from './routes/users';
import closuresRoutes from './routes/closures';
import appSettingsRoutes from './routes/app-settings';
import uploadRoutes from './routes/upload';
import { dbHealthCheckMiddleware, checkDbConnection } from './middleware/dbHealthCheck';

dotenv.config();

// Sur Vercel le système de fichiers est en lecture seule et éphémère : pas de
// dossier uploads/ à servir, et le rate-limit en mémoire n'a plus de sens
// (chaque invocation peut tomber sur une instance différente).
export const isServerless = Boolean(process.env.VERCEL);

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
  });

  // Configuration CORS sécurisée
  // En déploiement Vercel mono-projet, le front est servi par le même domaine
  // que l'API : les appels sont relatifs (same-origin) et CORS ne s'applique pas.
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
  app.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? (allowedOrigins ?? false) : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });

  // Headers de sécurité avec Helmet - Désactiver CSP pour permettre les images
  app.register(helmet, {
    contentSecurityPolicy: false, // Désactiver pour éviter les problèmes avec les images
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permettre le chargement cross-origin
  });

  // Configuration JWT
  app.register(jwt, {
    secret: (() => {
      const s = process.env.JWT_SECRET;
      if (process.env.NODE_ENV === 'production' && (!s || s.length < 32)) {
        // En serverless on ne peut pas process.exit() : on lève, ce qui fait
        // échouer l'invocation avec un message explicite dans les logs.
        throw new Error(
          'FATAL: JWT_SECRET manquant ou trop court (< 32 caractères) en production.'
        );
      }
      return s || 'dev-only-insecure-secret-change-me';
    })(),
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
  });

  // Rate limiting global (par instance ; en serverless c'est une protection
  // best-effort, pas une garantie globale)
  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
    }),
  });

  // Multipart pour l'upload de fichiers
  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  });

  if (!isServerless) {
    // Servir les fichiers statiques (uploads) - uniquement hors serverless
    app.register(fastifyStatic, {
      root: join(process.cwd(), 'uploads'),
      prefix: '/uploads/',
      decorateReply: false, // Ne pas décorer reply pour éviter les conflits
    });

    // Hook pour ajouter les headers CORS aux fichiers statiques
    app.addHook('onSend', async (request, reply) => {
      if (request.url.startsWith('/uploads/')) {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Cross-Origin-Resource-Policy', 'cross-origin');
      }
    });
  }

  // Routes de base
  const healthHandler = async () => {
    const dbConnected = await checkDbConnection();
    return {
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  };

  // /health pour le mode serveur classique, /api/health pour Vercel où seules
  // les routes sous /api/ sont routées vers la fonction serverless.
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.get('/', async () => {
    return {
      message: 'API Gestion Fast-Food',
      version: '1.0.0',
    };
  });

  // Hook global pour vérifier la santé de la DB avant les routes API.
  // En serverless on saute cette sonde : elle ajoute un aller-retour SQL à
  // chaque requête, et une base injoignable se signalera d'elle-même.
  if (!isServerless) {
    app.addHook('onRequest', async (request, reply) => {
      if (request.url.startsWith('/api/')) {
        await dbHealthCheckMiddleware(request, reply);
      }
    });
  }

  // Hook global d'authentification : toutes les routes /api/ exigent un JWT valide,
  // sauf une liste blanche d'endpoints publics nécessaires avant connexion.
  const PUBLIC_ENDPOINTS: Array<{ method: string; path: string }> = [
    { method: 'POST', path: '/api/auth/login' },
    { method: 'GET', path: '/api/app-settings' }, // logo/nom affichés sur l'écran de login
    { method: 'GET', path: '/api/health' }, // sonde de disponibilité
  ];

  app.addHook('onRequest', async (request, reply) => {
    if (reply.sent) return; // déjà géré (ex: DB indisponible)
    if (!request.url.startsWith('/api/')) return;

    // Le chemin peut contenir une query string -> ne comparer que la partie path
    const path = request.url.split('?')[0];
    const isPublic = PUBLIC_ENDPOINTS.some(
      (e) => e.method === request.method && path === e.path
    );
    if (isPublic) return;

    try {
      const payload = await request.jwtVerify();
      request.user = payload as any;
    } catch {
      return reply.status(401).send({
        success: false,
        error: 'Non authentifié. Token invalide ou expiré.',
      });
    }
  });

  // Enregistrement des routes API
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(categoriesRoutes, { prefix: '/api/categories' });
  app.register(productsRoutes, { prefix: '/api/products' });
  app.register(ordersRoutes, { prefix: '/api/orders' });
  app.register(paymentsRoutes, { prefix: '/api/payments' });
  app.register(ingredientsRoutes, { prefix: '/api/ingredients' });
  app.register(usersRoutes, { prefix: '/api/users' });
  app.register(closuresRoutes, { prefix: '/api/closures' });
  app.register(appSettingsRoutes, { prefix: '/api/app-settings' });
  app.register(uploadRoutes, { prefix: '/api/upload' });

  return app;
}

export default buildApp;
