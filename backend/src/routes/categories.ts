import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function categoriesRoutes(app: FastifyInstance) {
// GET /api/categories - Liste toutes les catégories actives
app.get('/', async (request, reply) => {
try {
const categories = await prisma.category.findMany({
where: { isActive: true },
orderBy: { displayOrder: 'asc' },
include: {
products: {
where: { isActive: true, isAvailable: true },
select: {
id: true,
name: true,
},
},
},
});

return reply.send({
success: true,
data: categories,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération des catégories',
});
}
});

// GET /api/categories/:id - Récupère une catégorie par ID
app.get('/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };

const category = await prisma.category.findUnique({
where: { id },
include: {
products: {
where: { isActive: true },
include: {
options: {
include: {
option: true,
},
},
},
},
},
});

if (!category) {
return reply.status(404).send({
success: false,
error: 'Catégorie non trouvée',
});
}

return reply.send({
success: true,
data: category,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération de la catégorie',
});
}
});

// POST /api/categories - Créer une nouvelle catégorie
app.post('/', async (request, reply) => {
try {
const { name, description, icon, image, displayOrder, userId } = request.body as {
name: string;
description?: string;
icon?: string;
image?: string;
displayOrder?: number;
userId?: string;
};

const category = await prisma.category.create({
data: {
name,
description,
icon,
image,
displayOrder: displayOrder || 0,
},
});

// Log activity
if (userId) {
await logActivity({
type: 'CATEGORY_CREATED',
userId,
targetId: category.id,
description: `Catégorie créée: ${name}`,
});
}

return reply.status(201).send({
success: true,
data: category,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la création de la catégorie',
});
}
});

// PUT /api/categories/:id - Mettre à jour une catégorie
app.put('/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };
const { name, description, icon, image, displayOrder, isActive, userId } = request.body as {
name?: string;
description?: string;
icon?: string;
image?: string;
displayOrder?: number;
isActive?: boolean;
userId?: string;
};

const category = await prisma.category.update({
where: { id },
data: {
name,
description,
icon,
image,
displayOrder,
isActive,
},
});

// Log activity
if (userId) {
await logActivity({
type: 'CATEGORY_UPDATED',
userId,
targetId: id,
description: `Catégorie modifiée: ${name || category.name}`,
metadata: { isActive },
});
}

return reply.send({
success: true,
data: category,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la mise à jour de la catégorie',
});
}
});

// DELETE /api/categories/:id - Supprimer une catégorie (soft delete)
app.delete('/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };
const { userId } = request.body as { userId?: string };

const category = await prisma.category.update({
where: { id },
data: { isActive: false },
});

// Log activity
if (userId) {
await logActivity({
type: 'CATEGORY_DELETED',
userId,
targetId: id,
description: `Catégorie désactivée: ${category.name}`,
});
}

return reply.send({
success: true,
message: 'Catégorie désactivée avec succès',
data: category,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la suppression de la catégorie',
});
}
});
}
