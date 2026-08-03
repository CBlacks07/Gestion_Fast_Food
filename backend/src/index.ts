import Fastify from 'fastify';
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
exposedHeaders: ['Content-Length', 'Content-Type'],
});

// Headers de sécurité avec Helmet - Désactiver CSP pour permettre les images
app.register(helmet, {
contentSecurityPolicy: false, // Désactiver pour éviter les problèmes avec les images
crossOriginResourcePolicy: { policy: "cross-origin" }, // Permettre le chargement cross-origin
});

// Configuration JWT
app.register(jwt, {
secret: (() => {
const s = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!s || s.length < 32)) {
console.error('FATAL: JWT_SECRET manquant ou trop court (< 32 caractères) en production.');
process.exit(1);
}
return s || 'dev-only-insecure-secret-change-me';
})(),
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

// Multipart pour l'upload de fichiers
app.register(multipart, {
limits: {
fileSize: 5 * 1024 * 1024, // 5MB max
},
});

// Servir les fichiers statiques (uploads)
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

// Hook global d'authentification : toutes les routes /api/ exigent un JWT valide,
// sauf une liste blanche d'endpoints publics nécessaires avant connexion.
const PUBLIC_ENDPOINTS: Array<{ method: string; path: string }> = [
{ method: 'POST', path: '/api/auth/login' },
{ method: 'GET', path: '/api/app-settings' }, // logo/nom affichés sur l'écran de login
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

// Démarrage du serveur
const start = async () => {
try {
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

await app.listen({ port, host });

console.log(` Server ready at http://${host}:${port}`);
} catch (err) {
app.log.error(err);
process.exit(1);
}
};

start();
