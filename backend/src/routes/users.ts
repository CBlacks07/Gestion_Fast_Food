import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';
import { requireAuth, requireRole } from '../middleware/auth';

const SALT_ROUNDS = 10;

export default async function usersRoutes(app: FastifyInstance) {
// GET /api/users - Liste tous les utilisateurs (ADMIN uniquement)
app.get('/', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { includeInactive } = request.query as { includeInactive?: string };

const users = await prisma.user.findMany({
where: includeInactive === 'true' ? { restaurantId } : { isActive: true, restaurantId },
select: {
id: true,
email: true,
username: true,
firstName: true,
lastName: true,
role: true,
isActive: true,
createdAt: true,
},
orderBy: { username: 'asc' },
});

return reply.send({
success: true,
data: users,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération des utilisateurs',
});
}
});

// POST /api/users - Créer un nouvel utilisateur (ADMIN uniquement)
app.post('/', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { email, username, password, firstName, lastName, role } = request.body as {
email: string;
username: string;
password: string;
firstName?: string;
lastName?: string;
role: string;
};

// Validation des rôles autorisés
const validRoles = ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'];
if (!validRoles.includes(role)) {
return reply.status(400).send({
success: false,
error: `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}`,
});
}

// Vérifier si l'email ou le username existe déjà dans ce restaurant
const existingUser = await prisma.user.findFirst({
where: {
restaurantId,
OR: [{ email }, { username }],
},
});

if (existingUser) {
return reply.status(400).send({
success: false,
error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà',
});
}

// Hasher le mot de passe avec bcrypt
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

const user = await prisma.user.create({
data: {
email,
username,
password: hashedPassword,
firstName,
lastName,
role: role as any,
restaurantId,
},
select: {
id: true,
email: true,
username: true,
firstName: true,
lastName: true,
role: true,
isActive: true,
createdAt: true,
},
});

return reply.status(201).send({
success: true,
data: user,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la création de l\'utilisateur',
});
}
});

// PUT /api/users/:id - Mettre à jour un utilisateur (ADMIN uniquement)
app.put('/:id', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
try {
const { id } = request.params as { id: string };
const restaurantId = request.user!.restaurantId;
const { email, username, password, firstName, lastName, role, isActive } = request.body as {
email?: string;
username?: string;
password?: string;
firstName?: string;
lastName?: string;
role?: string;
isActive?: boolean;
};

const existing = await prisma.user.findFirst({ where: { id, restaurantId } });
if (!existing) {
return reply.status(404).send({
success: false,
error: 'Utilisateur non trouvé',
});
}

// Validation du rôle si fourni
if (role) {
const validRoles = ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER'];
if (!validRoles.includes(role)) {
return reply.status(400).send({
success: false,
error: `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}`,
});
}
}

// Vérifier si l'email ou le username existe déjà (pour un autre utilisateur du même restaurant)
if (email || username) {
const existingUser = await prisma.user.findFirst({
where: {
AND: [
{ id: { not: id } },
{ restaurantId },
{
OR: [
email ? { email } : {},
username ? { username } : {},
].filter((obj) => Object.keys(obj).length > 0),
},
],
},
});

if (existingUser) {
return reply.status(400).send({
success: false,
error: 'Un autre utilisateur avec cet email ou ce nom d\'utilisateur existe déjà',
});
}
}

const updateData: any = {};
if (email !== undefined) updateData.email = email;
if (username !== undefined) updateData.username = username;
if (password !== undefined) {
// Hasher le nouveau mot de passe avec bcrypt
updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
}
if (firstName !== undefined) updateData.firstName = firstName;
if (lastName !== undefined) updateData.lastName = lastName;
if (role !== undefined) updateData.role = role;
if (isActive !== undefined) updateData.isActive = isActive;

const user = await prisma.user.update({
where: { id },
data: updateData,
select: {
id: true,
email: true,
username: true,
firstName: true,
lastName: true,
role: true,
isActive: true,
createdAt: true,
},
});

return reply.send({
success: true,
data: user,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la mise à jour de l\'utilisateur',
});
}
});

// DELETE /api/users/:id - Supprimer (désactiver) un utilisateur (ADMIN uniquement)
app.delete('/:id', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
try {
const { id } = request.params as { id: string };
const restaurantId = request.user!.restaurantId;
// SÉCURITÉ: Utiliser le JWT au lieu du body pour éviter l'escalade de privilèges
const currentUserId = request.user!.userId;

// Récupérer l'utilisateur à supprimer (scopé au restaurant)
const targetUser = await prisma.user.findFirst({
where: { id, restaurantId },
select: { id: true, role: true, username: true },
});

if (!targetUser) {
return reply.status(404).send({
success: false,
error: 'Utilisateur non trouvé',
});
}

// Empêcher un utilisateur de se supprimer lui-même
if (id === currentUserId) {
return reply.status(403).send({
success: false,
error: 'Vous ne pouvez pas vous supprimer vous-même',
});
}

// Empêcher la suppression d'un admin
if (targetUser.role === 'ADMIN') {
return reply.status(403).send({
success: false,
error: 'Impossible de supprimer un administrateur',
});
}

const user = await prisma.user.update({
where: { id },
data: { isActive: false },
select: {
id: true,
email: true,
username: true,
firstName: true,
lastName: true,
role: true,
isActive: true,
},
});

// Logger l'activité
await logActivity({
type: 'USER_DELETED',
restaurantId,
userId: currentUserId,
targetId: id,
description: `Utilisateur désactivé: ${targetUser.username}`,
});

return reply.send({
success: true,
data: user,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la suppression de l\'utilisateur',
});
}
});

// GET /api/users/:id/stats - Statistiques d'un utilisateur (MANAGER, ADMIN, ou soi-même)
app.get('/:id/stats', { preHandler: requireAuth }, async (request, reply) => {
try {
const { id } = request.params as { id: string };
const restaurantId = request.user!.restaurantId;
const { date } = request.query as { date?: string };

// Déterminer la plage de dates (par défaut aujourd'hui)
const targetDate = date ? new Date(date) : new Date();
const startOfDay = new Date(targetDate);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(targetDate);
endOfDay.setHours(23, 59, 59, 999);

// Récupérer l'utilisateur (scopé au restaurant)
const user = await prisma.user.findFirst({
where: { id, restaurantId },
select: {
id: true,
username: true,
firstName: true,
lastName: true,
role: true,
},
});

if (!user) {
return reply.status(404).send({
success: false,
error: 'Utilisateur non trouvé',
});
}

// SÉCURITÉ: Vérifier les permissions (soi-même, MANAGER ou ADMIN)
const currentUser = request.user!;
const canViewStats =
currentUser.userId === id ||
currentUser.role === 'ADMIN' ||
currentUser.role === 'MANAGER';

if (!canViewStats) {
return reply.status(403).send({
success: false,
error: 'Vous n\'avez pas la permission de voir ces statistiques',
});
}

// Commandes créées par cet utilisateur (exclure les annulées des stats)
const orders = await prisma.order.findMany({
where: {
userId: id,
restaurantId,
createdAt: {
gte: startOfDay,
lte: endOfDay,
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
payments: true,
},
orderBy: { createdAt: 'desc' },
});

// Paiements traités par cet utilisateur
const payments = await prisma.payment.findMany({
where: {
userId: id,
restaurantId,
createdAt: {
gte: startOfDay,
lte: endOfDay,
},
},
include: {
order: true,
},
});

// Calculer les statistiques (exclure les commandes annulées du chiffre d'affaires)
const totalOrders = orders.length;
const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

// Revenu total : seulement les commandes NON annulées
const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
const totalRevenue = activeOrders.reduce((sum, order) => sum + Number(order.total), 0);
const activeOrdersCount = activeOrders.length;

// Produits vendus avec quantités
const productsSold: Record<string, { name: string; quantity: number; revenue: number }> = {};
orders.forEach(order => {
if (order.status !== 'CANCELLED') {
order.items.forEach(item => {
const productId = item.productId;
const productName = item.product.name;
const quantity = Number(item.quantity);
const revenue = Number(item.total);

if (productsSold[productId]) {
productsSold[productId].quantity += quantity;
productsSold[productId].revenue += revenue;
} else {
productsSold[productId] = {
name: productName,
quantity,
revenue,
};
}
});
}
});

// Répartition des paiements par méthode
const paymentsByMethod: Record<string, { count: number; total: number }> = {};
payments.forEach(payment => {
if (payment.status === 'COMPLETED') {
const method = payment.method;
const amount = Number(payment.amount);

if (paymentsByMethod[method]) {
paymentsByMethod[method].count += 1;
paymentsByMethod[method].total += amount;
} else {
paymentsByMethod[method] = {
count: 1,
total: amount,
};
}
}
});

// Produits les plus vendus (top 10)
const topProducts = Object.entries(productsSold)
.map(([id, data]) => ({ id, ...data }))
.sort((a, b) => b.quantity - a.quantity)
.slice(0, 10);

return reply.send({
success: true,
data: {
user: {
id: user.id,
username: user.username,
firstName: user.firstName,
lastName: user.lastName,
role: user.role,
},
date: targetDate.toISOString().split('T')[0],
stats: {
totalOrders,
completedOrders,
cancelledOrders,
totalRevenue,
averageOrderValue: activeOrdersCount > 0 ? totalRevenue / activeOrdersCount : 0,
},
orders,
topProducts,
paymentsByMethod,
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

// GET /api/users/stats/all - Statistiques de tous les utilisateurs pour une date donnée (ADMIN, MANAGER)
app.get('/stats/all', { preHandler: requireRole('ADMIN', 'MANAGER') }, async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { date } = request.query as { date?: string };

// Déterminer la plage de dates (par défaut aujourd'hui)
const targetDate = date ? new Date(date) : new Date();
const startOfDay = new Date(targetDate);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(targetDate);
endOfDay.setHours(23, 59, 59, 999);

// Récupérer tous les utilisateurs actifs du restaurant
const users = await prisma.user.findMany({
where: { isActive: true, restaurantId },
select: {
id: true,
username: true,
firstName: true,
lastName: true,
role: true,
},
});

// Pour chaque utilisateur, calculer ses stats
const userStats = await Promise.all(
users.map(async (user) => {
// Commandes
const orders = await prisma.order.findMany({
where: {
userId: user.id,
restaurantId,
createdAt: {
gte: startOfDay,
lte: endOfDay,
},
},
});

// Paiements
const payments = await prisma.payment.findMany({
where: {
userId: user.id,
restaurantId,
status: 'COMPLETED',
createdAt: {
gte: startOfDay,
lte: endOfDay,
},
},
});

const totalOrders = orders.length;
const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
// Exclure les commandes annulées du chiffre d'affaires
const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
const totalRevenue = activeOrders.reduce((sum, order) => sum + Number(order.total), 0);
const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

return {
user: {
id: user.id,
username: user.username,
firstName: user.firstName,
lastName: user.lastName,
role: user.role,
},
totalOrders,
completedOrders,
totalRevenue,
totalPayments,
};
})
);

// Trier par chiffre d'affaires décroissant
userStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

return reply.send({
success: true,
data: {
date: targetDate.toISOString().split('T')[0],
users: userStats,
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
