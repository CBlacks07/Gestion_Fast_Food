import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';
import { requireAuth } from '../middleware/auth';

export default async function authRoutes(app: FastifyInstance) {
// POST /api/auth/login - Connexion avec rate limiting
app.post(
'/login',
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
const { code, username, password } = request.body as {
code: string;
username: string;
password: string;
};

// Validation basique
if (!code || !username || !password) {
return reply.status(400).send({
success: false,
error: 'Code établissement, nom d\'utilisateur et mot de passe requis',
});
}

// Résoudre le restaurant à partir du code établissement
const restaurant = await prisma.restaurant.findUnique({
where: { code: code.trim().toUpperCase() },
});

if (!restaurant || !restaurant.isActive) {
await logActivity({
type: 'SYSTEM_ERROR',
description: `Tentative de connexion avec code établissement invalide: ${code}`,
ipAddress: request.ip,
metadata: { code, username },
});

return reply.status(401).send({
success: false,
error: 'Code établissement introuvable',
});
}

// Rechercher l'utilisateur, scopé au restaurant résolu
const user = await prisma.user.findFirst({
where: {
restaurantId: restaurant.id,
OR: [{ username }, { email: username }],
isActive: true,
},
});

if (!user) {
// Log tentative de connexion échouée
await logActivity({
type: 'SYSTEM_ERROR',
restaurantId: restaurant.id,
description: `Tentative de connexion échouée: ${username}`,
ipAddress: request.ip,
metadata: { username },
});

return reply.status(401).send({
success: false,
error: 'Nom d\'utilisateur ou mot de passe incorrect',
});
}

// Vérifier le mot de passe avec bcrypt
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
// Log tentative de connexion échouée
await logActivity({
type: 'SYSTEM_ERROR',
restaurantId: restaurant.id,
userId: user.id,
description: `Tentative de connexion échouée: ${user.username} (mauvais mot de passe)`,
ipAddress: request.ip,
metadata: { username: user.username },
});

return reply.status(401).send({
success: false,
error: 'Nom d\'utilisateur ou mot de passe incorrect',
});
}

// Générer le token JWT
const token = app.jwt.sign({
userId: user.id,
restaurantId: user.restaurantId,
role: user.role,
email: user.email,
});

// Retourner l'utilisateur sans le mot de passe + token
const { password: _, ...userWithoutPassword } = user;

// Log activité de connexion réussie
await logActivity({
type: 'USER_LOGIN',
restaurantId: restaurant.id,
userId: user.id,
description: `Connexion réussie: ${user.username}`,
ipAddress: request.ip,
});

return reply.send({
success: true,
data: {
user: userWithoutPassword,
token,
},
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

// GET /api/auth/me - Récupérer l'utilisateur actuel (protégé par JWT)
app.get('/me', { preHandler: requireAuth }, async (request, reply) => {
try {
const userId = request.user!.userId;
const restaurantId = request.user!.restaurantId;

const user = await prisma.user.findFirst({
where: { id: userId, restaurantId },
});

if (!user || !user.isActive) {
return reply.status(404).send({
success: false,
error: 'Utilisateur non trouvé',
});
}

const { password: _, ...userWithoutPassword } = user;

return reply.send({
success: true,
data: userWithoutPassword,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération de l\'utilisateur',
});
}
});

// POST /api/auth/logout - Déconnexion (pour le logging)
app.post('/logout', { preHandler: requireAuth }, async (request, reply) => {
try {
const userId = request.user!.userId;
const restaurantId = request.user!.restaurantId;

// Log activité de déconnexion
await logActivity({
type: 'USER_LOGOUT',
restaurantId,
userId,
description: 'Déconnexion',
ipAddress: request.ip,
});

return reply.send({
success: true,
message: 'Déconnexion réussie',
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la déconnexion',
});
}
});
}
