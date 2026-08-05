import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import prisma from '../utils/prisma';
import { requirePlatformAdmin } from '../middleware/platformAuth';
import { DEFAULT_FASTFOOD_CATEGORIES } from '../data/default-fastfood-categories';

const SALT_ROUNDS = 10;

function generatePassword(): string {
return randomBytes(9).toString('base64url');
}

export default async function platformRoutes(app: FastifyInstance) {
// POST /api/platform/auth/login - Connexion superadmin (rate limité comme /api/auth/login)
app.post(
'/auth/login',
{
config: {
rateLimit: {
max: 5,
timeWindow: '15 minutes',
},
},
},
async (request, reply) => {
try {
const { username, password } = request.body as { username: string; password: string };

if (!username || !password) {
return reply.status(400).send({
success: false,
error: 'Identifiant et mot de passe requis',
});
}

const admin = await prisma.platformAdmin.findFirst({
where: {
OR: [{ username }, { email: username }],
isActive: true,
},
});

if (!admin) {
return reply.status(401).send({
success: false,
error: 'Identifiants incorrects',
});
}

const isValid = await bcrypt.compare(password, admin.password);
if (!isValid) {
return reply.status(401).send({
success: false,
error: 'Identifiants incorrects',
});
}

const token = app.jwt.sign({
platformAdminId: admin.id,
email: admin.email,
});

const { password: _, ...adminWithoutPassword } = admin;

return reply.send({
success: true,
data: { admin: adminWithoutPassword, token },
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la connexion',
});
}
}
);

// Tout ce qui suit exige le token superadmin
app.register(async (protectedRoutes) => {
protectedRoutes.addHook('preHandler', requirePlatformAdmin);

// GET /api/platform/restaurants - Liste tous les restaurants avec compteurs
protectedRoutes.get('/restaurants', async (request, reply) => {
try {
const restaurants = await prisma.restaurant.findMany({
orderBy: { createdAt: 'desc' },
include: {
_count: {
select: { users: true, orders: true },
},
},
});

return reply.send({ success: true, data: restaurants });
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la récupération des restaurants' });
}
});

// POST /api/platform/restaurants - Créer un restaurant + son admin (équivalent API de onboard-restaurant.ts)
protectedRoutes.post('/restaurants', async (request, reply) => {
try {
const { code, name, adminUsername, adminEmail, adminPassword, withDefaultCategories } = request.body as {
code: string;
name: string;
adminUsername: string;
adminEmail: string;
adminPassword?: string;
withDefaultCategories?: boolean;
};

if (!code || !name || !adminUsername || !adminEmail) {
return reply.status(400).send({
success: false,
error: 'code, name, adminUsername et adminEmail sont requis',
});
}

const normalizedCode = code.trim().toUpperCase();
const existing = await prisma.restaurant.findUnique({ where: { code: normalizedCode } });
if (existing) {
return reply.status(409).send({
success: false,
error: `Le code établissement "${normalizedCode}" est déjà utilisé`,
});
}

const plainPassword = adminPassword || generatePassword();
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

const result = await prisma.$transaction(async (tx) => {
const restaurant = await tx.restaurant.create({
data: { code: normalizedCode, name, isActive: true },
});

const admin = await tx.user.create({
data: {
restaurantId: restaurant.id,
email: adminEmail,
username: adminUsername,
password: hashedPassword,
firstName: 'Administrateur',
lastName: name,
role: 'ADMIN',
isActive: true,
},
});

if (withDefaultCategories) {
await tx.category.createMany({
data: DEFAULT_FASTFOOD_CATEGORIES.map((c) => ({ ...c, restaurantId: restaurant.id })),
});
}

await tx.appSettings.create({
data: {
restaurantId: restaurant.id,
appName: name,
appIcon: '🍔',
primaryColor: '#ef4444',
currency: 'FCFA',
currencySymbol: 'FCFA',
taxRate: 0,
},
});

return { restaurant, admin };
});

return reply.status(201).send({
success: true,
data: {
restaurant: result.restaurant,
admin: { username: result.admin.username, email: result.admin.email },
adminPassword: plainPassword,
},
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la création du restaurant' });
}
});

// PATCH /api/platform/restaurants/:id - Suspendre / réactiver un restaurant
protectedRoutes.patch('/restaurants/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };
const { isActive } = request.body as { isActive: boolean };

const restaurant = await prisma.restaurant.update({
where: { id },
data: { isActive },
});

return reply.send({ success: true, data: restaurant });
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la mise à jour du restaurant' });
}
});

// DELETE /api/platform/restaurants/:id - Supprimer un restaurant et toutes ses données (cascade)
protectedRoutes.delete('/restaurants/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };

const restaurant = await prisma.restaurant.findUnique({ where: { id } });
if (!restaurant) {
return reply.status(404).send({ success: false, error: 'Restaurant non trouvé' });
}

await prisma.restaurant.delete({ where: { id } });

return reply.send({ success: true, message: `Restaurant "${restaurant.name}" supprimé` });
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la suppression du restaurant' });
}
});

// GET /api/platform/restaurants/:id/users - Utilisateurs d'un restaurant
protectedRoutes.get('/restaurants/:id/users', async (request, reply) => {
try {
const { id } = request.params as { id: string };

const users = await prisma.user.findMany({
where: { restaurantId: id },
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

return reply.send({ success: true, data: users });
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
}
});

// POST /api/platform/users/:id/reset-password - Réinitialise le mot de passe de n'importe quel utilisateur tenant
protectedRoutes.post('/users/:id/reset-password', async (request, reply) => {
try {
const { id } = request.params as { id: string };

const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
return reply.status(404).send({ success: false, error: 'Utilisateur non trouvé' });
}

const newPassword = generatePassword();
const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

await prisma.user.update({
where: { id },
data: { password: hashedPassword },
});

return reply.send({
success: true,
data: { username: user.username, newPassword },
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({ success: false, error: 'Erreur lors de la réinitialisation du mot de passe' });
}
});
});
}
