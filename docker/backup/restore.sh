#!/bin/sh
# Script de restauration de la base de données PostgreSQL

set -e

# Configuration
BACKUP_DIR="/backups"
BACKUP_FILE="${1:-${BACKUP_DIR}/latest.sql}"

echo "=== Restore PostgreSQL Database ==="
echo "Date: $(date)"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Vérifier que le fichier de backup existe
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ ERROR: Backup file not found: ${BACKUP_FILE}"
    echo ""
    echo "Available backups:"
    ls -lh ${BACKUP_DIR}/fastfood_backup_*.sql 2>/dev/null || echo "No backups found"
    exit 1
fi

echo "⚠️  WARNING: This will REPLACE ALL DATA in the database!"
echo "Backup file: ${BACKUP_FILE}"
echo "Database: ${POSTGRES_DB}"
echo ""

# En mode interactif, demander confirmation
if [ -t 0 ]; then
    echo "Are you sure you want to continue? (yes/no)"
    read -r CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Restore cancelled."
        exit 0
    fi
fi

echo "Starting restore..."

# Terminer toutes les connexions actives à la base de données
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();"

# Supprimer et recréer la base de données
echo "Dropping and recreating database..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d postgres \
  -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"

PGPASSWORD="${POSTGRES_PASSWORD}" psql \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d postgres \
  -c "CREATE DATABASE ${POSTGRES_DB};"

# Restaurer le backup
echo "Restoring backup..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_restore \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --verbose \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database restored successfully!"
    echo "Restored from: ${BACKUP_FILE}"
else
    echo ""
    echo "❌ Restore failed!"
    exit 1
fi
