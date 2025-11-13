import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function tablesRoutes(app: FastifyInstance) {
  // GET /api/tables - Liste toutes les tables
  app.get('/', async (request, reply) => {
    try {
      const tables = await prisma.table.findMany({
        where: { isActive: true },
        orderBy: { number: 'asc' },
        include: {
          orders: {
            where: {
              status: {
                in: ['PENDING', 'PREPARING'],
              },
            },
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        data: tables,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des tables',
      });
    }
  });

  // GET /api/tables/:id - Récupère une table par ID
  app.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const table = await prisma.table.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!table) {
        return reply.status(404).send({
          success: false,
          error: 'Table non trouvée',
        });
      }

      return reply.send({
        success: true,
        data: table,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération de la table',
      });
    }
  });

  // POST /api/tables - Créer une nouvelle table
  app.post('/', async (request, reply) => {
    try {
      const { number, capacity } = request.body as {
        number: number;
        capacity: number;
      };

      const table = await prisma.table.create({
        data: {
          number,
          capacity,
        },
      });

      return reply.status(201).send({
        success: true,
        data: table,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la création de la table',
      });
    }
  });

  // PUT /api/tables/:id - Mettre à jour une table
  app.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { number, capacity, isActive } = request.body as any;

      const table = await prisma.table.update({
        where: { id },
        data: {
          number,
          capacity,
          isActive,
        },
      });

      return reply.send({
        success: true,
        data: table,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la mise à jour de la table',
      });
    }
  });

  // DELETE /api/tables/:id - Supprimer une table
  app.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const table = await prisma.table.update({
        where: { id },
        data: { isActive: false },
      });

      return reply.send({
        success: true,
        message: 'Table désactivée avec succès',
        data: table,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la suppression de la table',
      });
    }
  });

  // GET /api/tables/available - Tables disponibles
  app.get('/status/available', async (request, reply) => {
    try {
      const tables = await prisma.table.findMany({
        where: { isActive: true },
        include: {
          orders: {
            where: {
              status: {
                in: ['PENDING', 'PREPARING'],
              },
            },
          },
        },
      });

      // Filtrer les tables sans commande en cours
      const availableTables = tables.filter(table => table.orders.length === 0);

      return reply.send({
        success: true,
        data: availableTables,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erreur lors de la récupération des tables disponibles',
      });
    }
  });
}
