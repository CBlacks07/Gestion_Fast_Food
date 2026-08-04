import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

export default async function paymentsRoutes(app: FastifyInstance) {
// GET /api/payments - Liste tous les paiements
app.get('/', async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { orderId, method, status, date } = request.query as {
orderId?: string;
method?: string;
status?: string;
date?: string;
};

const where: any = { restaurantId };

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
const restaurantId = request.user!.restaurantId;

const payment = await prisma.payment.findFirst({
where: { id, restaurantId },
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
const restaurantId = request.user!.restaurantId;
const { orderId, method, amount, reference } = request.body as {
orderId: string;
method: string;
amount: number;
reference?: string;
};

// L'utilisateur est dérivé du token JWT, jamais du corps (anti-usurpation)
const userId = request.user!.userId;

if (!Number.isFinite(amount) || amount <= 0) {
return reply.status(400).send({
success: false,
error: 'Le montant du paiement doit être supérieur à 0',
});
}

// Vérifier que la commande existe et appartient au restaurant
const order = await prisma.order.findFirst({
where: { id: orderId, restaurantId },
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
restaurantId,
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

// La commande reste en attente après paiement, le staff la valide manuellement
const newTotalPaid = totalPaid + amount;

// Log activity
await logActivity({
type: 'PAYMENT_CREATED',
restaurantId,
userId,
targetId: payment.id,
description: `Paiement enregistré: ${amount.toFixed(2)} F CFA (${method})`,
metadata: { orderId, method, amount, orderNumber: order.orderNumber },
});

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
const restaurantId = request.user!.restaurantId;
const { status } = request.body as { status: string };

const existing = await prisma.payment.findFirst({ where: { id, restaurantId } });
if (!existing) {
return reply.status(404).send({
success: false,
error: 'Paiement non trouvé',
});
}

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
const restaurantId = request.user!.restaurantId;

const payments = await prisma.payment.findMany({
where: { orderId, restaurantId },
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
const order = await prisma.order.findFirst({
where: { id: orderId, restaurantId },
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
const restaurantId = request.user!.restaurantId;
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const payments = await prisma.payment.findMany({
where: {
restaurantId,
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
