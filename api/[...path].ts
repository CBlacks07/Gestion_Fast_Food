/**
 * Entrée serverless Vercel.
 *
 * Le routage par système de fichiers de Vercel dirige toute requête `/api/*`
 * vers ce fichier, en conservant l'URL d'origine dans `req.url`. Les routes
 * Fastify sont déjà préfixées par `/api/`, elles correspondent donc directement.
 *
 * On ne démarre jamais de serveur : `app.server.emit('request', ...)` injecte la
 * requête dans le routeur Fastify comme si elle venait du réseau.
 */
import type { IncomingMessage, ServerResponse } from 'http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../backend/src/app';

// Réutilisé entre invocations tant que l'instance Lambda reste chaude :
// on ne reconstruit pas l'app (ni le pool Prisma) à chaque requête.
let appPromise: Promise<FastifyInstance> | null = null;

function getApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    const app = buildApp();
    appPromise = (async () => {
      await app.ready();
      return app;
    })();
    // Une app qui échoue à s'initialiser ne doit pas rester en cache :
    // sinon toutes les requêtes suivantes de cette instance échouent aussi.
    appPromise.catch(() => {
      appPromise = null;
    });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
  } catch (error) {
    console.error("Échec de l'initialisation de l'API:", error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: "Erreur d'initialisation du serveur.",
      })
    );
  }
}
