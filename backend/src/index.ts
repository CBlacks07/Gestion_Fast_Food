import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';
import optionsRoutes from './routes/options';
import tablesRoutes from './routes/tables';
import ingredientsRoutes from './routes/ingredients';

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
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      options: '/api/options',
      tables: '/api/tables',
      ingredients: '/api/ingredients'
    }
  };
});

// Enregistrement des routes API
app.register(authRoutes, { prefix: '/api/auth' });
app.register(categoriesRoutes, { prefix: '/api/categories' });
app.register(productsRoutes, { prefix: '/api/products' });
app.register(ordersRoutes, { prefix: '/api/orders' });
app.register(paymentsRoutes, { prefix: '/api/payments' });
app.register(optionsRoutes, { prefix: '/api/options' });
app.register(tablesRoutes, { prefix: '/api/tables' });
app.register(ingredientsRoutes, { prefix: '/api/ingredients' });

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
