import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function usersRoutes(app: FastifyInstance) {
  // GET /api/users - Liste tous les utilisateurs actifs
  app.get('/', async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { username: 'asc' },
      });

      return reply.send({
        success: true,
        data: users,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  });

  // GET /api/users/:id/stats - Statistiques d'un utilisateur
  app.get('/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { date } = request.query as { date?: string };

      // Déterminer la plage de dates (par défaut aujourd'hui)
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé',
        });
      }

      // Commandes créées par cet utilisateur
      const orders = await prisma.order.findMany({
        where: {
          userId: id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              options: {
                include: {
                  option: true,
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Paiements traités par cet utilisateur
      const payments = await prisma.payment.findMany({
        where: {
          userId: id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          order: true,
        },
      });

      // Calculer les statistiques
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
      const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

      // Produits vendus avec quantités
      const productsSold: Record<string, { name: string; quantity: number; revenue: number }> = {};
      orders.forEach(order => {
        if (order.status !== 'CANCELLED') {
          order.items.forEach(item => {
            const productId = item.productId;
            const productName = item.product.name;
            const quantity = Number(item.quantity);
            const revenue = Number(item.total);

            if (productsSold[productId]) {
              productsSold[productId].quantity += quantity;
              productsSold[productId].revenue += revenue;
            } else {
              productsSold[productId] = {
                name: productName,
                quantity,
                revenue,
              };
            }
          });
        }
      });

      // Répartition des paiements par méthode
      const paymentsByMethod: Record<string, { count: number; total: number }> = {};
      payments.forEach(payment => {
        if (payment.status === 'COMPLETED') {
          const method = payment.method;
          const amount = Number(payment.amount);

          if (paymentsByMethod[method]) {
            paymentsByMethod[method].count += 1;
            paymentsByMethod[method].total += amount;
          } else {
            paymentsByMethod[method] = {
              count: 1,
              total: amount,
            };
          }
        }
      });

      // Produits les plus vendus (top 10)
      const topProducts = Object.entries(productsSold)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          date: targetDate.toISOString().split('T')[0],
          stats: {
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          },
          orders,
          topProducts,
          paymentsByMethod,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      });
    }
  });

  // GET /api/users/stats/all - Statistiques de tous les utilisateurs pour une date donnée
  app.get('/stats/all', async (request, reply) => {
    try {
      const { date } = request.query as { date?: string };

      // Déterminer la plage de dates (par défaut aujourd'hui)
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Récupérer tous les utilisateurs actifs
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      // Pour chaque utilisateur, calculer ses stats
      const userStats = await Promise.all(
        users.map(async (user) => {
          // Commandes
          const orders = await prisma.order.findMany({
            where: {
              userId: user.id,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });

          // Paiements
          const payments = await prisma.payment.findMany({
            where: {
              userId: user.id,
              status: 'COMPLETED',
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });

          const totalOrders = orders.length;
          const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
          const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
          const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

          return {
            user: {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            },
            totalOrders,
            completedOrders,
            totalRevenue,
            totalPayments,
          };
        })
      );

      // Trier par chiffre d'affaires décroissant
      userStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

      return reply.send({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          users: userStats,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
      });
    }
  });
}
