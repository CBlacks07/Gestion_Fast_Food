import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function productsRoutes(app: FastifyInstance) {
  // GET /api/products - Liste tous les produits
  app.get('/', async (request, reply) => {
    try {
      const { categoryId, available } = request.query as {
        categoryId?: string;
        available?: string;
      };

      const where: any = { isActive: true };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (available === 'true') {
        where.isAvailable = true;
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          options: {
            include: {
              option: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      return reply.send({
        success: true,
        data: products,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des produits',
      });
    }
  });

  // GET /api/products/:id - Récupère un produit par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          options: {
            include: {
              option: true,
            },
          },
          recipes: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (!product) {
        return reply.status(404).send({
          success: false,
          error: 'Produit non trouvé',
        });
      }

      return reply.send({
        success: true,
        data: product,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération du produit',
      });
    }
  });

  // POST /api/products - Créer un nouveau produit
  app.post('/', async (request, reply) => {
    try {
      const {
        name,
        description,
        price,
        cost,
        image,
        type,
        categoryId,
        preparationTime,
        displayOrder,
        userId,
      } = request.body as {
        name: string;
        description?: string;
        price: number;
        cost?: number;
        image?: string;
        type: string;
        categoryId: string;
        preparationTime?: number;
        displayOrder?: number;
        userId?: string;
      };

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          cost,
          image,
          type: type as any,
          categoryId,
          preparationTime,
          displayOrder: displayOrder || 0,
        },
        include: {
          category: true,
        },
      });

      // Log activity
      if (userId) {
        await prisma.activityLog.create({
          data: {
            type: 'PRODUCT_CREATED',
            userId,
            targetId: product.id,
            description: `Produit créé: ${name}`,
            metadata: JSON.stringify({ price, categoryId }),
          },
        }).catch((err) => request.log.error('Failed to log activity:', err));
      }

      return reply.status(201).send({
        success: true,
        data: product,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création du produit',
      });
    }
  });

  // PUT /api/products/:id - Mettre à jour un produit
  app.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        name,
        description,
        price,
        cost,
        image,
        type,
        isAvailable,
        isActive,
        preparationTime,
        displayOrder,
        categoryId,
        userId,
      } = request.body as any;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          cost,
          image,
          type,
          isAvailable,
          isActive,
          preparationTime,
          displayOrder,
          categoryId,
        },
        include: {
          category: true,
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      // Log activity
      if (userId) {
        await prisma.activityLog.create({
          data: {
            type: 'PRODUCT_UPDATED',
            userId,
            targetId: id,
            description: `Produit modifié: ${name || product.name}`,
            metadata: JSON.stringify({ price, isAvailable, isActive }),
          },
        }).catch((err) => request.log.error('Failed to log activity:', err));
      }

      return reply.send({
        success: true,
        data: product,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour du produit',
      });
    }
  });

  // DELETE /api/products/:id - Supprimer un produit (soft delete)
  app.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId?: string };

      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      // Log activity
      if (userId) {
        await prisma.activityLog.create({
          data: {
            type: 'PRODUCT_DELETED',
            userId,
            targetId: id,
            description: `Produit désactivé: ${product.name}`,
          },
        }).catch((err) => request.log.error('Failed to log activity:', err));
      }

      return reply.send({
        success: true,
        message: 'Produit désactivé avec succès',
        data: product,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la suppression du produit',
      });
    }
  });

  // PATCH /api/products/:id/availability - Changer la disponibilité d'un produit
  app.patch('/:id/availability', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { isAvailable } = request.body as { isAvailable: boolean };

      const product = await prisma.product.update({
        where: { id },
        data: { isAvailable },
      });

      return reply.send({
        success: true,
        message: `Produit ${isAvailable ? 'disponible' : 'indisponible'}`,
        data: product,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour de la disponibilité',
      });
    }
  });
}
