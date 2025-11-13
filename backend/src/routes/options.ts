import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function optionsRoutes(app: FastifyInstance) {
  // GET /api/options - Liste toutes les options
  app.get('/', async (request, reply) => {
    try {
      const { type } = request.query as { type?: string };

      const where: any = { isActive: true };

      if (type) {
        where.type = type;
      }

      const options = await prisma.option.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return reply.send({
        success: true,
        data: options,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des options',
      });
    }
  });

  // GET /api/options/:id - Récupère une option par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const option = await prisma.option.findUnique({
        where: { id },
      });

      if (!option) {
        return reply.status(404).send({
          success: false,
          error: 'Option non trouvée',
        });
      }

      return reply.send({
        success: true,
        data: option,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de l\'option',
      });
    }
  });

  // POST /api/options - Créer une nouvelle option
  app.post('/', async (request, reply) => {
    try {
      const { name, type, price } = request.body as {
        name: string;
        type: string;
        price: number;
      };

      const option = await prisma.option.create({
        data: {
          name,
          type: type as any,
          price,
        },
      });

      return reply.status(201).send({
        success: true,
        data: option,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création de l\'option',
      });
    }
  });

  // PUT /api/options/:id - Mettre à jour une option
  app.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, type, price, isActive } = request.body as any;

      const option = await prisma.option.update({
        where: { id },
        data: {
          name,
          type,
          price,
          isActive,
        },
      });

      return reply.send({
        success: true,
        data: option,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour de l\'option',
      });
    }
  });

  // DELETE /api/options/:id - Supprimer une option
  app.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const option = await prisma.option.update({
        where: { id },
        data: { isActive: false },
      });

      return reply.send({
        success: true,
        message: 'Option désactivée avec succès',
        data: option,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la suppression de l\'option',
      });
    }
  });
}
