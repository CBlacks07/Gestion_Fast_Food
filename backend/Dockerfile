# Backend Dockerfile pour production
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Builder le TypeScript
RUN npm run build

# --- Stage de production ---
FROM node:20-alpine

WORKDIR /app

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production

# Copier les fichiers buildés et Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Créer les dossiers nécessaires
RUN mkdir -p /app/uploads /app/backups

# Exposer le port
EXPOSE 3000

# Script de démarrage
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
