#!/bin/bash

# Script para inicializar la base de datos (crear tablas)
# Útil cuando se reinicia Docker y las tablas no existen

set -e

echo "🗄️  Inicializando base de datos..."

# Verificar que el contenedor de la app está corriendo
if ! docker ps | grep -q "nocturna-app-1"; then
    echo "❌ Error: El contenedor nocturna-app-1 no está corriendo"
    echo "Ejecuta primero: docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d"
    exit 1
fi

# Verificar que la base de datos está lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 5

if ! docker exec nocturna-db-prod pg_isready -U postgres > /dev/null 2>&1; then
    echo "❌ Error: La base de datos no está lista"
    exit 1
fi

echo "✅ Base de datos lista"

# Crear tablas usando db push
echo "📦 Creando tablas desde el schema de Prisma..."
docker exec nocturna-app-1 npx --package=prisma@6.19.0 prisma db push --accept-data-loss

echo ""
echo "✅ Base de datos inicializada correctamente"
echo ""
echo "📊 Tablas creadas:"
docker exec nocturna-db-prod psql -U postgres -d nocturna_genesis -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>&1 | grep -v "table_name\|----\|row"


