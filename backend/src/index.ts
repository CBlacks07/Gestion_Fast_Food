import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Plugins
app.register(cors, {
  origin: true, // En production, spécifier les origines autorisées
});

app.register(helmet);

// Routes de base
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };
});

app.get('/', async () => {
  return {
    message: 'API Gestion Fast-Food',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  };
});

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
