import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

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
import { dbHealthCheckMiddleware, checkDbConnection } from './middleware/dbHealthCheck';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Configuration CORS sécurisée
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// Headers de sécurité avec Helmet
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

// Configuration JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
});

// Rate limiting global
app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    success: false,
    error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
  }),
});

// Routes de base
app.get('/health', async () => {
  const dbConnected = await checkDbConnection();
  return {
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };
});

app.get('/', async () => {
  return {
    message: 'API Gestion Fast-Food',
    version: '1.0.0',
  };
});

// Hook global pour vérifier la santé de la DB avant les routes API
app.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/')) {
    await dbHealthCheckMiddleware(request, reply);
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

// Démarrage du serveur
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`🚀 Server ready at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
