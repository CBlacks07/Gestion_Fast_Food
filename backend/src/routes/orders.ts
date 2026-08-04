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
const restaurantId = request.user!.restaurantId;
const { status, type, date } = request.query as {
status?: string;
type?: string;
date?: string;
};

const where: any = { restaurantId };

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
payments: {
include: {
user: {
select: { id: true, username: true, firstName: true, lastName: true },
},
},
},
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
const restaurantId = request.user!.restaurantId;

const order = await prisma.order.findFirst({
where: { id, restaurantId },
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
payments: {
include: {
user: {
select: { id: true, username: true, firstName: true, lastName: true },
},
},
},
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
const restaurantId = request.user!.restaurantId;
const {
type,
tableId,
customerName,
customerPhone,
notes,
items,
} = request.body as {
type: string;
tableId?: string;
customerName?: string;
customerPhone?: string;
notes?: string;
items: Array<{
productId: string;
quantity: number;
notes?: string;
options?: Array<{
optionId: string;
}>;
}>;
};

// L'utilisateur est dérivé du token JWT, jamais du corps de la requête (anti-usurpation)
const userId = request.user!.userId;

if (!Array.isArray(items) || items.length === 0) {
return reply.status(400).send({
success: false,
error: 'La commande doit contenir au moins un article',
});
}

// La table référencée doit appartenir au même restaurant
if (tableId) {
const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
if (!table) {
return reply.status(400).send({
success: false,
error: 'Table invalide',
});
}
}

// Récupération groupée des produits (avec recettes) et des options -> évite le N+1
const productIds = [...new Set(items.map((i) => i.productId))];
const optionIds = [
...new Set(items.flatMap((i) => (i.options || []).map((o) => o.optionId))),
];

const [products, options] = await Promise.all([
prisma.product.findMany({
where: { id: { in: productIds }, restaurantId },
include: { recipes: true },
}),
optionIds.length
? prisma.option.findMany({ where: { id: { in: optionIds }, restaurantId } })
: Promise.resolve([] as any[]),
]);

const productMap = new Map(products.map((p) => [p.id, p]));
const optionMap = new Map(options.map((o: any) => [o.id, o]));

// Toute option demandée doit résoudre pour ce restaurant (sinon échec explicite
// plutôt que de l'ignorer silencieusement, ce qui fausserait le total facturé)
for (const optionId of optionIds) {
if (!optionMap.has(optionId)) {
return reply.status(400).send({
success: false,
error: `Option ${optionId} invalide`,
});
}
}

// Calcul des totaux + préparation des items + besoins en ingrédients
let subtotal = 0;
const orderItemsData: Array<{
productId: string;
quantity: number;
unitPrice: any;
total: number;
notes?: string;
options: Array<{ optionId: string; price: number }>;
}> = [];

// Agrégation des quantités d'ingrédients à déstocker (clé = ingredientId)
const ingredientNeeds = new Map<string, number>();

for (const item of items) {
const product = productMap.get(item.productId);
if (!product) {
return reply.status(404).send({
success: false,
error: `Produit ${item.productId} non trouvé`,
});
}
if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
return reply.status(400).send({
success: false,
error: `Quantité invalide pour le produit ${product.name}`,
});
}

let itemTotal = Number(product.price) * item.quantity;

const itemOptions: Array<{ optionId: string; price: number }> = [];
for (const opt of item.options || []) {
const option = optionMap.get(opt.optionId);
if (option) {
const optPrice = Number(option.price);
itemTotal += optPrice * item.quantity;
// Vrai prix de l'option figé au moment de la commande (corrige le prix bloqué à 0)
itemOptions.push({ optionId: opt.optionId, price: optPrice });
}
}

subtotal += itemTotal;

orderItemsData.push({
productId: item.productId,
quantity: item.quantity,
unitPrice: product.price,
total: itemTotal,
notes: item.notes,
options: itemOptions,
});

// Cumuler les besoins en ingrédients selon la recette du produit
for (const recipe of product.recipes) {
const needed = Number(recipe.quantity) * item.quantity;
ingredientNeeds.set(
recipe.ingredientId,
(ingredientNeeds.get(recipe.ingredientId) || 0) + needed
);
}
}

const tax = 0;
const discount = 0;
const total = subtotal + tax - discount;

// Générer un numéro de commande unique (scopé au restaurant)
let orderNumber = generateOrderNumber();
let exists = await prisma.order.findFirst({ where: { orderNumber, restaurantId } });
while (exists) {
orderNumber = generateOrderNumber();
exists = await prisma.order.findFirst({ where: { orderNumber, restaurantId } });
}

// Création de la commande + déstockage dans une transaction atomique :
// si le déstockage échoue, la commande n'est pas créée (cohérence garantie).
const order = await prisma.$transaction(async (tx) => {
const created = await tx.order.create({
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
restaurantId,
items: {
create: orderItemsData.map((item) => ({
productId: item.productId,
quantity: item.quantity,
unitPrice: item.unitPrice,
total: item.total,
notes: item.notes,
options: item.options.length
? { create: item.options.map((opt) => ({ optionId: opt.optionId, price: opt.price })) }
: undefined,
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

// Déstockage automatique des ingrédients (mouvement de type SALE)
for (const [ingredientId, qty] of ingredientNeeds) {
if (qty <= 0) continue;
await tx.ingredient.update({
where: { id: ingredientId },
data: { currentStock: { decrement: qty } },
});
await tx.stockMovement.create({
data: {
ingredientId,
type: 'SALE',
quantity: -qty, // négatif = sortie de stock
reason: `Vente commande ${orderNumber}`,
reference: orderNumber,
},
});
}

return created;
});

// Log activity
await logActivity({
type: 'ORDER_CREATED',
restaurantId,
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
const restaurantId = request.user!.restaurantId;
const { status } = request.body as { status: string };

// Vérifier si la commande existe, appartient au restaurant, et n'est pas déjà annulée
const existingOrder = await prisma.order.findFirst({
where: { id, restaurantId },
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
const restaurantId = request.user!.restaurantId;
const userId = request.user!.userId;

// Charger la commande avec ses items et leurs recettes (pour ré-approvisionner le stock)
const existing = await prisma.order.findFirst({
where: { id, restaurantId },
include: {
items: { include: { product: { include: { recipes: true } } } },
},
});

if (!existing) {
return reply.status(404).send({
success: false,
error: 'Commande introuvable',
});
}

if (existing.status === 'CANCELLED') {
return reply.status(400).send({
success: false,
error: 'Cette commande est déjà annulée',
});
}

// Recalculer les ingrédients à remettre en stock (inverse du déstockage de vente)
const ingredientReturns = new Map<string, number>();
for (const item of existing.items) {
for (const recipe of item.product.recipes) {
const qty = Number(recipe.quantity) * item.quantity;
ingredientReturns.set(
recipe.ingredientId,
(ingredientReturns.get(recipe.ingredientId) || 0) + qty
);
}
}

const order = await prisma.$transaction(async (tx) => {
// Supprimer les paiements associés
await tx.payment.deleteMany({ where: { orderId: id } });

// Marquer la commande comme annulée
const updated = await tx.order.update({
where: { id },
data: { status: 'CANCELLED' },
include: { items: true },
});

// Remettre les ingrédients en stock (mouvement de type RETURN)
for (const [ingredientId, qty] of ingredientReturns) {
if (qty <= 0) continue;
await tx.ingredient.update({
where: { id: ingredientId },
data: { currentStock: { increment: qty } },
});
await tx.stockMovement.create({
data: {
ingredientId,
type: 'RETURN',
quantity: qty, // positif = retour en stock
reason: `Annulation commande ${updated.orderNumber}`,
reference: updated.orderNumber,
},
});
}

return updated;
});

// Log activity
if (userId) {
await logActivity({
type: 'ORDER_CANCELLED',
restaurantId,
userId,
targetId: id,
description: `Commande annulée: ${order.orderNumber} (paiements supprimés, stock réapprovisionné)`,
metadata: { total: order.total },
});
}

return reply.send({
success: true,
message: 'Commande annulée avec succès (paiements supprimés, stock réapprovisionné)',
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
const restaurantId = request.user!.restaurantId;
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const orders = await prisma.order.findMany({
where: {
restaurantId,
createdAt: {
gte: today,
lt: tomorrow,
},
status: {
not: 'CANCELLED',
},
},
include: {
payments: {
include: {
user: {
select: { id: true, username: true, firstName: true, lastName: true },
},
},
},
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
