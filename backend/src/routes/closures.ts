import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function closuresRoutes(app: FastifyInstance) {
// GET /api/closures - Liste toutes les clôtures (avec filtrage optionnel par userId)
app.get('/', async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { userId } = request.query as { userId?: string };

const where: any = { restaurantId };
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

// GET /api/closures/:date - Récupérer une clôture par date (obsolète, utilisez /check/:date à la place)
app.get('/:date', async (request, reply) => {
try {
const { date } = request.params as { date: string };
const restaurantId = request.user!.restaurantId;
const targetDate = new Date(date);
targetDate.setHours(0, 0, 0, 0);

const closure = await prisma.dailyClosure.findFirst({
where: { date: targetDate, restaurantId },
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
const restaurantId = request.user!.restaurantId;
const { date, userId, notes } = request.body as {
date: string;
userId: string;
notes?: string;
};

const targetDate = new Date(date);
targetDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(targetDate);
endOfDay.setHours(23, 59, 59, 999);

// Une seule clôture par restaurant et par jour (quel que soit l'utilisateur)
const existingClosure = await prisma.dailyClosure.findFirst({
where: {
date: targetDate,
restaurantId,
},
});

if (existingClosure) {
return reply.status(400).send({
success: false,
error: 'Cette date a déjà été clôturée',
});
}

// Récupérer toutes les commandes de la journée pour ce restaurant
const orders = await prisma.order.findMany({
where: {
restaurantId,
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

// Récupérer tous les paiements de la journée pour ce restaurant
const payments = await prisma.payment.findMany({
where: {
restaurantId,
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
const orderUserId = order.userId;
if (!userStats[orderUserId]) {
userStats[orderUserId] = {
user: order.user,
totalOrders: 0,
completedOrders: 0,
cancelledOrders: 0,
revenue: 0,
products: {},
};
}

userStats[orderUserId].totalOrders += 1;
if (order.status === 'DELIVERED') {
userStats[orderUserId].completedOrders += 1;
userStats[orderUserId].revenue += Number(order.total);
}
if (order.status === 'CANCELLED') {
userStats[orderUserId].cancelledOrders += 1;
}

// Compter les produits vendus
order.items.forEach((item) => {
const productId = item.productId;
if (!userStats[orderUserId].products[productId]) {
userStats[orderUserId].products[productId] = {
name: item.product.name,
quantity: 0,
revenue: 0,
};
}
userStats[orderUserId].products[productId].quantity += Number(item.quantity);
userStats[orderUserId].products[productId].revenue += Number(item.total);
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
restaurantId,
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
restaurantId,
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

// GET /api/closures/check/:date - Vérifier si une clôture existe pour une date
// (le paramètre userId reste accepté pour compatibilité ascendante mais n'a plus
// d'effet : une clôture est désormais par restaurant et par jour, pas par utilisateur)
app.get('/check/:date', async (request, reply) => {
try {
const { date } = request.params as { date: string };
const restaurantId = request.user!.restaurantId;
const targetDate = new Date(date);
targetDate.setHours(0, 0, 0, 0);

const closure = await prisma.dailyClosure.findFirst({
where: { date: targetDate, restaurantId },
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
