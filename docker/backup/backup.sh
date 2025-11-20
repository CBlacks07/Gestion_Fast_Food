#!/bin/sh
# Script de sauvegarde automatique de la base de données PostgreSQL
# Exécuté toutes les 12 heures

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fastfood_backup_${TIMESTAMP}.sql"
LATEST_LINK="${BACKUP_DIR}/latest.sql"

# Nombre maximum de backups à conserver (7 jours x 2 backups/jour = 14)
MAX_BACKUPS=14

echo "=== Backup PostgreSQL Database ==="
echo "Date: $(date)"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Créer le répertoire de backup s'il n'existe pas
mkdir -p ${BACKUP_DIR}

# Exécuter pg_dump avec compression
echo "Creating backup..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --format=custom \
  --compress=9 \
  --file="${BACKUP_FILE}" \
  --verbose

# Vérifier que le backup a réussi
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"

    # Créer un lien symbolique vers le dernier backup
    ln -sf "$(basename ${BACKUP_FILE})" "${LATEST_LINK}"

    # Obtenir la taille du backup
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "Backup size: ${BACKUP_SIZE}"

    # Nettoyer les anciens backups (garder seulement les MAX_BACKUPS plus récents)
    echo "Cleaning old backups (keeping last ${MAX_BACKUPS})..."
    cd ${BACKUP_DIR}
    ls -t fastfood_backup_*.sql 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

    # Afficher le nombre de backups restants
    BACKUP_COUNT=$(ls -1 fastfood_backup_*.sql 2>/dev/null | wc -l)
    echo "Total backups: ${BACKUP_COUNT}"

    echo ""
    echo "✅ Backup completed successfully!"
else
    echo "❌ Backup failed!"
    exit 1
fi
