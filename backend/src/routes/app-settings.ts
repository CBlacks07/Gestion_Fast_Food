import { FastifyInstance } from 'fastify';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

const DEFAULT_SETTINGS = {
appName: 'Gestion Fast-Food',
appIcon: '',
primaryColor: '#ef4444',
currency: 'FCFA',
currencySymbol: 'FCFA',
taxRate: 0,
};

export default async function appSettingsRoutes(app: FastifyInstance) {
// GET /api/app-settings - Récupère les paramètres du restaurant (les crée s'ils n'existent pas)
app.get('/', async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;

let settings = await prisma.appSettings.findUnique({
where: { restaurantId },
});

if (!settings) {
settings = await prisma.appSettings.create({
data: { ...DEFAULT_SETTINGS, restaurantId },
});
}

return reply.send({
success: true,
data: settings,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération des paramètres',
});
}
});

// GET /api/app-settings/:id - Récupère des paramètres spécifiques par ID
app.get('/:id', async (request, reply) => {
try {
const { id } = request.params as { id: string };
const restaurantId = request.user!.restaurantId;

const settings = await prisma.appSettings.findFirst({
where: { id, restaurantId },
});

if (!settings) {
return reply.status(404).send({
success: false,
error: 'Paramètres non trouvés',
});
}

return reply.send({
success: true,
data: settings,
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la récupération des paramètres',
});
}
});

// PUT /api/app-settings - Mettre à jour les paramètres du restaurant
app.put('/', async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const {
appName,
appIcon,
slogan,
logoUrl,
primaryColor,
secondaryColor,
companyName,
companyEmail,
companyPhone,
companyAddress,
currency,
currencySymbol,
taxRate,
receiptHeader,
receiptFooter,
userId,
} = request.body as {
appName?: string;
appIcon?: string;
slogan?: string;
logoUrl?: string;
primaryColor?: string;
secondaryColor?: string;
companyName?: string;
companyEmail?: string;
companyPhone?: string;
companyAddress?: string;
currency?: string;
currencySymbol?: string;
taxRate?: number;
receiptHeader?: string;
receiptFooter?: string;
userId?: string;
};

const settings = await prisma.appSettings.upsert({
where: { restaurantId },
create: {
...DEFAULT_SETTINGS,
appName: appName || DEFAULT_SETTINGS.appName,
appIcon: appIcon || DEFAULT_SETTINGS.appIcon,
slogan,
logoUrl,
primaryColor: primaryColor || DEFAULT_SETTINGS.primaryColor,
secondaryColor,
companyName,
companyEmail,
companyPhone,
companyAddress,
currency: currency || DEFAULT_SETTINGS.currency,
currencySymbol: currencySymbol || DEFAULT_SETTINGS.currencySymbol,
taxRate: taxRate || DEFAULT_SETTINGS.taxRate,
receiptHeader,
receiptFooter,
restaurantId,
},
update: {
...(appName !== undefined && { appName }),
...(appIcon !== undefined && { appIcon }),
...(slogan !== undefined && { slogan }),
...(logoUrl !== undefined && { logoUrl }),
...(primaryColor !== undefined && { primaryColor }),
...(secondaryColor !== undefined && { secondaryColor }),
...(companyName !== undefined && { companyName }),
...(companyEmail !== undefined && { companyEmail }),
...(companyPhone !== undefined && { companyPhone }),
...(companyAddress !== undefined && { companyAddress }),
...(currency !== undefined && { currency }),
...(currencySymbol !== undefined && { currencySymbol }),
...(taxRate !== undefined && { taxRate }),
...(receiptHeader !== undefined && { receiptHeader }),
...(receiptFooter !== undefined && { receiptFooter }),
},
});

// Log activity
if (userId) {
await logActivity({
type: 'SYSTEM_ERROR', // Utiliser un type existant ou créer un nouveau
restaurantId,
userId,
targetId: settings.id,
description: `Paramètres de l'application modifiés`,
metadata: { appName: settings.appName },
});
}

return reply.send({
success: true,
data: settings,
message: 'Paramètres mis à jour avec succès',
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la mise à jour des paramètres',
});
}
});

// POST /api/app-settings/reset - Réinitialiser aux paramètres par défaut
app.post('/reset', async (request, reply) => {
try {
const restaurantId = request.user!.restaurantId;
const { userId } = request.body as { userId?: string };

const settings = await prisma.appSettings.upsert({
where: { restaurantId },
create: { ...DEFAULT_SETTINGS, restaurantId },
update: { ...DEFAULT_SETTINGS },
});

// Log activity
if (userId) {
await logActivity({
type: 'SYSTEM_ERROR',
restaurantId,
userId,
targetId: settings.id,
description: `Paramètres de l'application réinitialisés aux valeurs par défaut`,
});
}

return reply.send({
success: true,
data: settings,
message: 'Paramètres réinitialisés aux valeurs par défaut',
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de la réinitialisation des paramètres',
});
}
});
}
