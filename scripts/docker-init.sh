#!/bin/bash
# Script para inicializar la base de datos en Docker

set -e

echo "🔄 Esperando a que PostgreSQL esté listo..."
sleep 5

echo "📦 Generando Prisma Client..."
npx prisma generate

echo "🗄️  Aplicando migraciones..."
npx prisma migrate deploy

echo "🌱 Poblando base de datos con datos iniciales (opcional)..."
if [ "$RUN_SEED" = "true" ]; then
  npm run db:seed
  echo "✅ Datos iniciales cargados"
else
  echo "⏭️  Seed omitido (configura RUN_SEED=true para ejecutarlo)"
fi

echo "✅ Inicialización completada"

