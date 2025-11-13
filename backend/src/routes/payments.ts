import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function paymentsRoutes(app: FastifyInstance) {
  // GET /api/payments - Liste tous les paiements
  app.get('/', async (request, reply) => {
    try {
      const { orderId, method, status, date } = request.query as {
        orderId?: string;
        method?: string;
        status?: string;
        date?: string;
      };

      const where: any = {};

      if (orderId) {
        where.orderId = orderId;
      }

      if (method) {
        where.method = method;
      }

      if (status) {
        where.status = status;
      }

      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        data: payments,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des paiements',
      });
    }
  });

  // GET /api/payments/:id - Récupère un paiement par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          order: true,
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

      if (!payment) {
        return reply.status(404).send({
          success: false,
          error: 'Paiement non trouvé',
        });
      }

      return reply.send({
        success: true,
        data: payment,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération du paiement',
      });
    }
  });

  // POST /api/payments - Créer un nouveau paiement
  app.post('/', async (request, reply) => {
    try {
      const { orderId, method, amount, reference, userId } = request.body as {
        orderId: string;
        method: string;
        amount: number;
        reference?: string;
        userId: string;
      };

      // Vérifier que la commande existe
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          payments: true,
        },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Commande non trouvée',
        });
      }

      // Vérifier que la commande n'est pas déjà complètement payée
      const totalPaid = order.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const remaining = Number(order.total) - totalPaid;

      if (remaining <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Cette commande est déjà complètement payée',
        });
      }

      if (amount > remaining) {
        return reply.status(400).send({
          success: false,
          error: `Le montant dépasse le montant restant (${remaining} FCFA)`,
        });
      }

      // Créer le paiement
      const payment = await prisma.payment.create({
        data: {
          orderId,
          method: method as any,
          amount,
          reference,
          userId,
          status: 'COMPLETED',
        },
        include: {
          order: true,
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

      // Si la commande est complètement payée, mettre à jour son statut
      const newTotalPaid = totalPaid + amount;
      if (newTotalPaid >= Number(order.total)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' },
        });
      }

      return reply.status(201).send({
        success: true,
        data: payment,
        remaining: remaining - amount,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création du paiement',
      });
    }
  });

  // PATCH /api/payments/:id/status - Mettre à jour le statut d'un paiement
  app.patch('/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const payment = await prisma.payment.update({
        where: { id },
        data: { status: status as any },
        include: {
          order: true,
        },
      });

      return reply.send({
        success: true,
        message: `Paiement mis à jour: ${status}`,
        data: payment,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
      });
    }
  });

  // GET /api/payments/order/:orderId - Récupère tous les paiements d'une commande
  app.get('/order/:orderId', async (request, reply) => {
    try {
      const { orderId } = request.params as { orderId: string };

      const payments = await prisma.payment.findMany({
        where: { orderId },
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
        orderBy: { createdAt: 'asc' },
      });

      // Calculer le total payé
      const totalPaid = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Récupérer le total de la commande
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { total: true },
      });

      const remaining = order ? Number(order.total) - totalPaid : 0;

      return reply.send({
        success: true,
        data: {
          payments,
          totalPaid,
          remaining,
          isPaid: remaining <= 0,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des paiements',
      });
    }
  });

  // GET /api/payments/stats/today - Statistiques des paiements du jour
  app.get('/stats/today', async (request, reply) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: 'COMPLETED',
        },
      });

      // Statistiques par méthode de paiement
      const byMethod = payments.reduce((acc: any, payment) => {
        const method = payment.method;
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += Number(payment.amount);
        return acc;
      }, {});

      const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      return reply.send({
        success: true,
        data: {
          totalPayments: payments.length,
          totalAmount,
          byMethod,
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
