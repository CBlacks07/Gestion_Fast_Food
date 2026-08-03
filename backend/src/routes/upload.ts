import { FastifyInstance } from 'fastify';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export default async function uploadRoutes(app: FastifyInstance) {
// S'assurer que le dossier uploads existe
const uploadsDir = join(process.cwd(), 'uploads');
await mkdir(uploadsDir, { recursive: true });

// POST /api/upload/image - Upload générique d'image (catégories, produits...)
app.post('/image', async (request, reply) => {
try {
const data = await request.file();

if (!data) {
return reply.status(400).send({
success: false,
error: 'Aucun fichier fourni',
});
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedTypes.includes(data.mimetype)) {
return reply.status(400).send({
success: false,
error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP',
});
}

const maxSize = 5 * 1024 * 1024;
const buffer = await data.toBuffer();
if (buffer.length > maxSize) {
return reply.status(400).send({
success: false,
error: 'Le fichier est trop volumineux (max 5MB)',
});
}

const extension = data.filename.split('.').pop();
const filename = `img-${randomUUID()}.${extension}`;
const filepath = join(uploadsDir, filename);

await writeFile(filepath, buffer);

const fileUrl = `/uploads/${filename}`;

return reply.send({
success: true,
data: {
url: fileUrl,
filename,
},
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de l\'upload du fichier',
});
}
});

// POST /api/upload/logo - Upload du logo
app.post('/logo', async (request, reply) => {
try {
const data = await request.file();

if (!data) {
return reply.status(400).send({
success: false,
error: 'Aucun fichier fourni',
});
}

// Vérifier le type de fichier (images uniquement)
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedTypes.includes(data.mimetype)) {
return reply.status(400).send({
success: false,
error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP',
});
}

// Vérifier la taille (max 5MB)
const maxSize = 5 * 1024 * 1024; // 5MB
const buffer = await data.toBuffer();
if (buffer.length > maxSize) {
return reply.status(400).send({
success: false,
error: 'Le fichier est trop volumineux (max 5MB)',
});
}

// Générer un nom unique pour le fichier
const extension = data.filename.split('.').pop();
const filename = `logo-${randomUUID()}.${extension}`;
const filepath = join(uploadsDir, filename);

// Sauvegarder le fichier
await writeFile(filepath, buffer);

// Retourner l'URL du fichier
const fileUrl = `/uploads/${filename}`;

return reply.send({
success: true,
data: {
url: fileUrl,
filename,
},
});
} catch (error) {
request.log.error(error);
return reply.status(500).send({
success: false,
error: 'Erreur lors de l\'upload du fichier',
});
}
});
}
