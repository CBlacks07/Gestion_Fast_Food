import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function closuresRoutes(app: FastifyInstance) {
  // GET /api/closures - Liste toutes les clôtures (avec filtrage optionnel par userId)
  app.get('/', async (request, reply) => {
    try {
      const { userId } = request.query as { userId?: string };

      const where: any = {};
      if (userId) {
        where.closedBy = userId;
      }

      const closures = await prisma.dailyClosure.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      return reply.send({
        success: true,
        data: closures,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des clôtures',
      });
    }
  });

  // GET /api/closures/:date - Récupérer une clôture par date
  app.get('/:date', async (request, reply) => {
    try {
      const { date } = request.params as { date: string };
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const closure = await prisma.dailyClosure.findUnique({
        where: { date: targetDate },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!closure) {
        return reply.status(404).send({
          success: false,
          error: 'Clôture non trouvée pour cette date',
        });
      }

      return reply.send({
        success: true,
        data: closure,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de la clôture',
      });
    }
  });

  // POST /api/closures - Créer une clôture pour une date donnée
  app.post('/', async (request, reply) => {
    try {
      const { date, userId, notes } = request.body as {
        date: string;
        userId: string;
        notes?: string;
      };

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Vérifier si une clôture existe déjà pour cette date
      const existingClosure = await prisma.dailyClosure.findUnique({
        where: { date: targetDate },
      });

      if (existingClosure) {
        return reply.status(400).send({
          success: false,
          error: 'Une clôture existe déjà pour cette date',
        });
      }

      // Récupérer toutes les commandes de la journée
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: targetDate,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      // Calculer les statistiques
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
      const totalRevenue = orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, order) => sum + Number(order.total), 0);

      // Récupérer tous les paiements de la journée
      const payments = await prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: targetDate,
            lte: endOfDay,
          },
        },
      });

      // Calculer les totaux par méthode de paiement
      const paymentsByMethod: Record<string, number> = {
        CASH: 0,
        TMONEY: 0,
        FLOOZ: 0,
        CARD: 0,
        MOBILE: 0,
        OTHER: 0,
      };

      payments.forEach((payment) => {
        paymentsByMethod[payment.method] += Number(payment.amount);
      });

      // Générer un rapport détaillé par utilisateur
      const userStats: Record<string, any> = {};

      orders.forEach((order) => {
        const userId = order.userId;
        if (!userStats[userId]) {
          userStats[userId] = {
            user: order.user,
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            revenue: 0,
            products: {},
          };
        }

        userStats[userId].totalOrders += 1;
        if (order.status === 'DELIVERED') {
          userStats[userId].completedOrders += 1;
          userStats[userId].revenue += Number(order.total);
        }
        if (order.status === 'CANCELLED') {
          userStats[userId].cancelledOrders += 1;
        }

        // Compter les produits vendus
        order.items.forEach((item) => {
          const productId = item.productId;
          if (!userStats[userId].products[productId]) {
            userStats[userId].products[productId] = {
              name: item.product.name,
              quantity: 0,
              revenue: 0,
            };
          }
          userStats[userId].products[productId].quantity += Number(item.quantity);
          userStats[userId].products[productId].revenue += Number(item.total);
        });
      });

      // Rapport détaillé en JSON
      const detailedReport = JSON.stringify({
        date: targetDate.toISOString(),
        summary: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
          paymentsByMethod,
        },
        userStats: Object.values(userStats),
        timestamp: new Date().toISOString(),
      });

      // Créer la clôture
      const closure = await prisma.dailyClosure.create({
        data: {
          date: targetDate,
          closedBy: userId,
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
          totalCash: paymentsByMethod.CASH,
          totalTmoney: paymentsByMethod.TMONEY,
          totalFlooz: paymentsByMethod.FLOOZ,
          totalCard: paymentsByMethod.CARD,
          totalMobile: paymentsByMethod.MOBILE,
          totalOther: paymentsByMethod.OTHER,
          detailedReport,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Logger l'activité
      await logActivity({
        type: 'DAILY_CLOSURE',
        userId,
        targetId: closure.id,
        description: `Clôture de journée effectuée pour le ${targetDate.toLocaleDateString('fr-FR')}`,
        metadata: {
          totalRevenue,
          totalOrders,
        },
      });

      return reply.status(201).send({
        success: true,
        data: closure,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création de la clôture',
      });
    }
  });

  // GET /api/closures/check/:date - Vérifier si une clôture existe pour une date (optionnellement pour un utilisateur)
  app.get('/check/:date', async (request, reply) => {
    try {
      const { date } = request.params as { date: string };
      const { userId } = request.query as { userId?: string };
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Si userId est fourni, vérifier si cet utilisateur a déjà clôturé cette date
      if (userId) {
        const closure = await prisma.dailyClosure.findFirst({
          where: {
            date: targetDate,
            closedBy: userId,
          },
          select: { id: true, closedAt: true },
        });

        return reply.send({
          success: true,
          data: {
            exists: !!closure,
            closure,
          },
        });
      }

      // Sinon, vérifier si la date a été clôturée par n'importe qui (pour admin)
      const closure = await prisma.dailyClosure.findUnique({
        where: { date: targetDate },
        select: { id: true, closedAt: true },
      });

      return reply.send({
        success: true,
        data: {
          exists: !!closure,
          closure,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la vérification',
      });
    }
  });
}
