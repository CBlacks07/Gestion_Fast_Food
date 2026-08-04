/**
 * Point d'entrée du serveur classique (développement local, VPS, Docker).
 *
 * Le déploiement Vercel n'utilise PAS ce fichier : il passe par
 * `api/[...path].ts` à la racine du dépôt, qui importe `buildApp()` et
 * n'appelle jamais `listen()`.
 */
import { buildApp } from './app';

const app = buildApp();

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3010;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`Server ready at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
