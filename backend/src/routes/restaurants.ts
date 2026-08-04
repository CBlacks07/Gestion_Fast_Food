import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';

export default async function restaurantsRoutes(app: FastifyInstance) {
// GET /api/restaurants/branding?code=XXX - Branding public d'un restaurant,
// utilisé sur l'écran de connexion (avant authentification). Ne renvoie
// volontairement que des champs non sensibles.
app.get('/branding', async (request, reply) => {
try {
const { code } = request.query as { code?: string };

if (!code) {
return reply.status(400).send({
success: false,
error: 'Code établissement requis',
});
}

const restaurant = await prisma.restaurant.findUnique({
where: { code: code.trim().toUpperCase() },
select: {
isActive: true,
appSettings: {
select: {
appName: true,
appIcon: true,
logoUrl: true,
primaryColor: true,
slogan: true,
},
},
},
});

if (!restaurant || !restaurant.isActive || !restaurant.appSettings) {
return reply.status(404).send({
success: false,
error: 'Restaurant introuvable',
});
}

return reply.send({
success: true,
data: restaurant.appSettings,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération du branding',
});
}
});
}
