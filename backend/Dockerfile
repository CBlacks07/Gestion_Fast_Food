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

# Créer le script de démarrage directement dans l'image
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "FastFood API - Starting..."' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Waiting for database..."' >> /app/docker-entrypoint.sh && \
    echo 'until npx prisma db push --skip-generate 2>/dev/null; do' >> /app/docker-entrypoint.sh && \
    echo '  echo "Database not ready, retrying in 2s..."' >> /app/docker-entrypoint.sh && \
    echo '  sleep 2' >> /app/docker-entrypoint.sh && \
    echo 'done' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Database connected!"' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Applying migrations..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma migrate deploy || npx prisma db push --skip-generate' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Checking admin account..."' >> /app/docker-entrypoint.sh && \
    echo 'npx tsx src/scripts/create-admin.ts || echo "Warning: Could not create admin"' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Initialization complete!"' >> /app/docker-entrypoint.sh && \
    echo 'echo "API available on port 3000"' >> /app/docker-entrypoint.sh && \
    echo 'echo ""' >> /app/docker-entrypoint.sh && \
    echo 'echo "Default credentials: admin / Admin123"' >> /app/docker-entrypoint.sh && \
    echo 'echo ""' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
