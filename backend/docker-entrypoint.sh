#!/bin/sh
set -e

echo "FastFood API - Starting..."

# Wait for PostgreSQL to be ready
echo "Waiting for database..."
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

echo "Database connected!"

# Apply migrations
echo "Applying migrations..."
npx prisma migrate deploy || npx prisma db push --skip-generate

# Create default admin (script checks if admin already exists)
echo "Checking admin account..."
npx tsx src/scripts/create-admin.ts || echo "Warning: Could not create admin (may already exist)"

echo "Initialization complete!"
echo "API available on port 3000"
echo ""
echo "Default credentials:"
echo "   Username: admin"
echo "   Password: Admin123"
echo ""

# Start the application
exec "$@"
