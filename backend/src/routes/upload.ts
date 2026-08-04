import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Vercel Blob est utilisé dès qu'un token est présent. En local (pas de token),
// on retombe sur l'écriture disque historique dans backend/uploads/.
const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const uploadsDir = join(process.cwd(), 'uploads');

/**
 * Enregistre le fichier et renvoie son URL publique.
 * - Vercel Blob -> URL absolue (https://....public.blob.vercel-storage.com/...)
 * - disque local -> chemin relatif /uploads/... servi par @fastify/static
 */
async function storeFile(
  filename: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (useBlobStorage) {
    // Import dynamique : le paquet n'est nécessaire que sur Vercel, et cela
    // évite de le charger au démarrage en local.
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimetype,
    });
    return blob.url;
  }

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

/**
 * Valide puis enregistre le fichier de la requête multipart.
 * `prefix` sert à distinguer les logos des images génériques.
 */
async function handleUpload(
  request: FastifyRequest,
  reply: FastifyReply,
  prefix: 'img' | 'logo'
) {
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({
        success: false,
        error: 'Aucun fichier fourni',
      });
    }

    if (!ALLOWED_TYPES.includes(data.mimetype)) {
      return reply.status(400).send({
        success: false,
        error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP',
      });
    }

    const buffer = await data.toBuffer();
    if (buffer.length > MAX_SIZE) {
      return reply.status(400).send({
        success: false,
        error: 'Le fichier est trop volumineux (max 5MB)',
      });
    }

    const extension = data.filename.split('.').pop();
    const filename = `${prefix}-${randomUUID()}.${extension}`;
    const url = await storeFile(filename, buffer, data.mimetype);

    return reply.send({
      success: true,
      data: {
        url,
        filename,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Erreur lors de l'upload du fichier",
    });
  }
}

export default async function uploadRoutes(app: FastifyInstance) {
  // POST /api/upload/image - Upload générique d'image (catégories, produits...)
  app.post('/image', (request, reply) => handleUpload(request, reply, 'img'));

  // POST /api/upload/logo - Upload du logo
  app.post('/logo', (request, reply) => handleUpload(request, reply, 'logo'));
}
