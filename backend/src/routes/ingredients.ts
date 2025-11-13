import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function ingredientsRoutes(app: FastifyInstance) {
  // GET /api/ingredients - Liste tous les ingrédients
  app.get('/', async (request, reply) => {
    try {
      const { lowStock } = request.query as { lowStock?: string };

      const where: any = { isActive: true };

      const ingredients = await prisma.ingredient.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      // Filtrer les ingrédients en stock bas si demandé
      const filteredIngredients = lowStock === 'true'
        ? ingredients.filter(ing => Number(ing.currentStock) <= Number(ing.minStock))
        : ingredients;

      return reply.send({
        success: true,
        data: filteredIngredients,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des ingrédients',
      });
    }
  });

  // GET /api/ingredients/:id - Récupère un ingrédient par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const ingredient = await prisma.ingredient.findUnique({
        where: { id },
        include: {
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          recipes: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!ingredient) {
        return reply.status(404).send({
          success: false,
          error: 'Ingrédient non trouvé',
        });
      }

      return reply.send({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de l\'ingrédient',
      });
    }
  });

  // POST /api/ingredients - Créer un nouvel ingrédient
  app.post('/', async (request, reply) => {
    try {
      const { name, description, unit, currentStock, minStock, unitCost } = request.body as {
        name: string;
        description?: string;
        unit: string;
        currentStock: number;
        minStock: number;
        unitCost: number;
      };

      const ingredient = await prisma.ingredient.create({
        data: {
          name,
          description,
          unit: unit as any,
          currentStock,
          minStock,
          unitCost,
        },
      });

      return reply.status(201).send({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création de l\'ingrédient',
      });
    }
  });

  // PUT /api/ingredients/:id - Mettre à jour un ingrédient
  app.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, description, unit, minStock, unitCost, isActive } = request.body as any;

      const ingredient = await prisma.ingredient.update({
        where: { id },
        data: {
          name,
          description,
          unit,
          minStock,
          unitCost,
          isActive,
        },
      });

      return reply.send({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour de l\'ingrédient',
      });
    }
  });

  // POST /api/ingredients/:id/stock - Ajouter ou retirer du stock
  app.post('/:id/stock', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { type, quantity, reason, reference } = request.body as {
        type: string;
        quantity: number;
        reason?: string;
        reference?: string;
      };

      // Récupérer l'ingrédient actuel
      const ingredient = await prisma.ingredient.findUnique({
        where: { id },
      });

      if (!ingredient) {
        return reply.status(404).send({
          success: false,
          error: 'Ingrédient non trouvé',
        });
      }

      // Calculer le nouveau stock
      const newStock = Number(ingredient.currentStock) + Number(quantity);

      if (newStock < 0) {
        return reply.status(400).send({
          success: false,
          error: 'Le stock ne peut pas être négatif',
        });
      }

      // Créer le mouvement de stock et mettre à jour l'ingrédient
      const [movement, updatedIngredient] = await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            ingredientId: id,
            type: type as any,
            quantity,
            reason,
            reference,
          },
        }),
        prisma.ingredient.update({
          where: { id },
          data: {
            currentStock: newStock,
          },
        }),
      ]);

      return reply.status(201).send({
        success: true,
        data: {
          movement,
          ingredient: updatedIngredient,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour du stock',
      });
    }
  });

  // GET /api/ingredients/alerts/low-stock - Alertes de stock bas
  app.get('/alerts/low-stock', async (request, reply) => {
    try {
      const ingredients = await prisma.ingredient.findMany({
        where: {
          isActive: true,
        },
      });

      const lowStockIngredients = ingredients.filter(
        ing => Number(ing.currentStock) <= Number(ing.minStock)
      );

      return reply.send({
        success: true,
        data: lowStockIngredients,
        count: lowStockIngredients.length,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des alertes',
      });
    }
  });
}
