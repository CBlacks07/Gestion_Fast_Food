import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

// Fonction pour générer un numéro de commande unique
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CMD${year}${month}${day}${random}`;
}

export default async function ordersRoutes(app: FastifyInstance) {
  // GET /api/orders - Liste toutes les commandes
  app.get('/', async (request, reply) => {
    try {
      const { status, type, date } = request.query as {
        status?: string;
        type?: string;
        date?: string;
      };

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
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

      const orders = await prisma.order.findMany({
        where,
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
          table: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        data: orders,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des commandes',
      });
    }
  });

  // GET /api/orders/:id - Récupère une commande par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const order = await prisma.order.findUnique({
        where: { id },
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
          table: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: true,
        },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Commande non trouvée',
        });
      }

      return reply.send({
        success: true,
        data: order,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de la commande',
      });
    }
  });

  // POST /api/orders - Créer une nouvelle commande
  app.post('/', async (request, reply) => {
    try {
      const {
        type,
        tableId,
        customerName,
        customerPhone,
        notes,
        items,
        userId,
      } = request.body as {
        type: string;
        tableId?: string;
        customerName?: string;
        customerPhone?: string;
        notes?: string;
        userId: string;
        items: Array<{
          productId: string;
          quantity: number;
          notes?: string;
          options?: Array<{
            optionId: string;
          }>;
        }>;
      };

      // Calculer les totaux
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: `Produit ${item.productId} non trouvé`,
          });
        }

        let itemTotal = Number(product.price) * item.quantity;

        // Ajouter le prix des options
        if (item.options && item.options.length > 0) {
          for (const opt of item.options) {
            const option = await prisma.option.findUnique({
              where: { id: opt.optionId },
            });
            if (option) {
              itemTotal += Number(option.price) * item.quantity;
            }
          }
        }

        subtotal += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          total: itemTotal,
          notes: item.notes,
          options: item.options,
        });
      }

      const tax = 0; // Vous pouvez calculer la taxe ici
      const discount = 0;
      const total = subtotal + tax - discount;

      // Générer un numéro de commande unique
      let orderNumber = generateOrderNumber();
      let exists = await prisma.order.findUnique({ where: { orderNumber } });
      while (exists) {
        orderNumber = generateOrderNumber();
        exists = await prisma.order.findUnique({ where: { orderNumber } });
      }

      // Créer la commande avec les items
      const order = await prisma.order.create({
        data: {
          orderNumber,
          type: type as any,
          tableId,
          customerName,
          customerPhone,
          notes,
          subtotal,
          tax,
          discount,
          total,
          userId,
          items: {
            create: orderItemsData.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              notes: item.notes,
              options: item.options ? {
                create: item.options.map(opt => ({
                  optionId: opt.optionId,
                  price: 0, // À récupérer depuis l'option
                })),
              } : undefined,
            })),
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
          table: true,
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

      // TODO: Déstockage automatique des ingrédients

      // Log activity
      await logActivity({
        type: 'ORDER_CREATED',
        userId,
        targetId: order.id,
        description: `Commande créée: ${orderNumber} (${total.toFixed(2)} F CFA)`,
        metadata: { type, total, itemCount: items.length },
      });

      return reply.status(201).send({
        success: true,
        data: order,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création de la commande',
      });
    }
  });

  // PATCH /api/orders/:id/status - Mettre à jour le statut d'une commande
  app.patch('/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      // Vérifier si la commande est déjà annulée
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        select: { status: true, orderNumber: true },
      });

      if (!existingOrder) {
        return reply.status(404).send({
          success: false,
          error: 'Commande introuvable',
        });
      }

      if (existingOrder.status === 'CANCELLED') {
        return reply.status(400).send({
          success: false,
          error: 'Impossible de modifier une commande annulée',
        });
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status: status as any },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: `Commande mise à jour: ${status}`,
        data: order,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
      });
    }
  });

  // DELETE /api/orders/:id - Annuler une commande
  app.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId?: string };

      // Supprimer d'abord tous les paiements associés à cette commande
      await prisma.payment.deleteMany({
        where: { orderId: id },
      });

      // Ensuite, marquer la commande comme annulée
      const order = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: true,
        },
      });

      // Log activity
      if (userId) {
        await logActivity({
          type: 'ORDER_CANCELLED',
          userId,
          targetId: id,
          description: `Commande annulée: ${order.orderNumber} (paiements supprimés)`,
          metadata: { total: order.total },
        });
      }

      return reply.send({
        success: true,
        message: 'Commande annulée avec succès (paiements supprimés)',
        data: order,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de l\'annulation de la commande',
      });
    }
  });

  // GET /api/orders/stats/today - Statistiques du jour
  app.get('/stats/today', async (request, reply) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          payments: true,
        },
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return reply.send({
        success: true,
        data: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          orders,
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
