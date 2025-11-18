# Backend Dockerfile pour production
FROM node:20-slim AS builder

WORKDIR /app

# Installer les dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances (inclure dev pour build)
RUN npm install

# Copier le code source
COPY . .

# Générer Prisma Client (ignorer les erreurs de checksum si serveur Prisma indisponible)
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate

# Builder le TypeScript
RUN npm run build

# --- Stage de production ---
FROM node:20-slim

WORKDIR /app

# Installer OpenSSL pour Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN npm install --production

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
