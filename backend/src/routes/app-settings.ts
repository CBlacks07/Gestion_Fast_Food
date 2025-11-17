import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function appSettingsRoutes(app: FastifyInstance) {
  // GET /api/app-settings - Récupère les paramètres actifs de l'application
  app.get('/', async (request, reply) => {
    try {
      // Récupérer les paramètres actifs (ou créer par défaut s'ils n'existent pas)
      let settings = await prisma.appSettings.findFirst({
        where: { isActive: true },
      });

      // Si aucun paramètre actif n'existe, créer les paramètres par défaut
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            appName: 'Gestion Fast-Food',
            appIcon: '🍔',
            primaryColor: '#ef4444',
            currency: 'FCFA',
            currencySymbol: 'FCFA',
            taxRate: 0,
            isActive: true,
          },
        });
      }

      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des paramètres',
      });
    }
  });

  // GET /api/app-settings/:id - Récupère des paramètres spécifiques par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const settings = await prisma.appSettings.findUnique({
        where: { id },
      });

      if (!settings) {
        return reply.status(404).send({
          success: false,
          error: 'Paramètres non trouvés',
        });
      }

      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des paramètres',
      });
    }
  });

  // PUT /api/app-settings - Mettre à jour les paramètres actifs
  app.put('/', async (request, reply) => {
    try {
      const {
        appName,
        appIcon,
        slogan,
        logoUrl,
        primaryColor,
        secondaryColor,
        companyName,
        companyEmail,
        companyPhone,
        companyAddress,
        currency,
        currencySymbol,
        taxRate,
        receiptHeader,
        receiptFooter,
        userId,
      } = request.body as {
        appName?: string;
        appIcon?: string;
        slogan?: string;
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        companyName?: string;
        companyEmail?: string;
        companyPhone?: string;
        companyAddress?: string;
        currency?: string;
        currencySymbol?: string;
        taxRate?: number;
        receiptHeader?: string;
        receiptFooter?: string;
        userId?: string;
      };

      // Récupérer les paramètres actifs actuels
      let settings = await prisma.appSettings.findFirst({
        where: { isActive: true },
      });

      if (!settings) {
        // Créer de nouveaux paramètres s'ils n'existent pas
        settings = await prisma.appSettings.create({
          data: {
            appName: appName || 'Gestion Fast-Food',
            appIcon: appIcon || '🍔',
            slogan,
            logoUrl,
            primaryColor: primaryColor || '#ef4444',
            secondaryColor,
            companyName,
            companyEmail,
            companyPhone,
            companyAddress,
            currency: currency || 'FCFA',
            currencySymbol: currencySymbol || 'FCFA',
            taxRate: taxRate || 0,
            receiptHeader,
            receiptFooter,
            isActive: true,
          },
        });
      } else {
        // Mettre à jour les paramètres existants
        settings = await prisma.appSettings.update({
          where: { id: settings.id },
          data: {
            ...(appName !== undefined && { appName }),
            ...(appIcon !== undefined && { appIcon }),
            ...(slogan !== undefined && { slogan }),
            ...(logoUrl !== undefined && { logoUrl }),
            ...(primaryColor !== undefined && { primaryColor }),
            ...(secondaryColor !== undefined && { secondaryColor }),
            ...(companyName !== undefined && { companyName }),
            ...(companyEmail !== undefined && { companyEmail }),
            ...(companyPhone !== undefined && { companyPhone }),
            ...(companyAddress !== undefined && { companyAddress }),
            ...(currency !== undefined && { currency }),
            ...(currencySymbol !== undefined && { currencySymbol }),
            ...(taxRate !== undefined && { taxRate }),
            ...(receiptHeader !== undefined && { receiptHeader }),
            ...(receiptFooter !== undefined && { receiptFooter }),
            updatedAt: new Date(),
          },
        });
      }

      // Log activity
      if (userId) {
        await logActivity({
          type: 'SYSTEM_ERROR', // Utiliser un type existant ou créer un nouveau
          userId,
          targetId: settings.id,
          description: `Paramètres de l'application modifiés`,
          metadata: JSON.stringify({ appName: settings.appName }),
        });
      }

      return reply.send({
        success: true,
        data: settings,
        message: 'Paramètres mis à jour avec succès',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour des paramètres',
      });
    }
  });

  // POST /api/app-settings/reset - Réinitialiser aux paramètres par défaut
  app.post('/reset', async (request, reply) => {
    try {
      const { userId } = request.body as { userId?: string };

      // Désactiver tous les paramètres existants
      await prisma.appSettings.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Créer de nouveaux paramètres par défaut
      const settings = await prisma.appSettings.create({
        data: {
          appName: 'Gestion Fast-Food',
          appIcon: '🍔',
          primaryColor: '#ef4444',
          currency: 'FCFA',
          currencySymbol: 'FCFA',
          taxRate: 0,
          isActive: true,
        },
      });

      // Log activity
      if (userId) {
        await logActivity({
          type: 'SYSTEM_ERROR',
          userId,
          targetId: settings.id,
          description: `Paramètres de l'application réinitialisés aux valeurs par défaut`,
        });
      }

      return reply.send({
        success: true,
        data: settings,
        message: 'Paramètres réinitialisés aux valeurs par défaut',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la réinitialisation des paramètres',
      });
    }
  });
}
