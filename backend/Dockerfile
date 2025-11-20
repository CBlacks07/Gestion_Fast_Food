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

# Générer Prisma Client avec retry automatique (délais: 2s, 4s, 8s, 16s, 32s)
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN for i in 1 2 3 4 5; do \
      echo "🔄 Tentative $i/5 de génération du client Prisma..."; \
      if npx prisma generate; then \
        echo "✅ Client Prisma généré avec succès!"; \
        exit 0; \
      else \
        if [ $i -lt 5 ]; then \
          delay=$((2 ** $i)); \
          echo "❌ Échec. Nouvelle tentative dans ${delay}s..."; \
          sleep $delay; \
        else \
          echo "❌ Échec après 5 tentatives. Le serveur Prisma semble indisponible."; \
          exit 1; \
        fi; \
      fi; \
    done

# Builder le TypeScript
RUN npm run build

# --- Stage de production ---
FROM node:20-slim

WORKDIR /app

# Installer OpenSSL pour Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Installer uniquement les dépendances de production + tsx pour les scripts
COPY package*.json ./
RUN npm install --production && npm install tsx bcrypt

# Copier les fichiers buildés et Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Créer les dossiers nécessaires
RUN mkdir -p /app/uploads /app/backups

# Exposer le port
EXPOSE 3000

# Script de démarrage
COPY --from=builder /app/docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
