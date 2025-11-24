#!/bin/bash
# Script de inicialización de base de datos
# Se ejecuta automáticamente cuando se crea el contenedor por primera vez

set -e

echo "🗄️  Inicializando base de datos Nocturna Genesis..."

# Crear extensiones si es necesario
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Extensiones útiles (si las necesitas)
    -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    -- CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Configuraciones de rendimiento (opcional)
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET maintenance_work_mem = '64MB';
    ALTER SYSTEM SET checkpoint_completion_target = 0.9;
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = 100;
    ALTER SYSTEM SET random_page_cost = 1.1;
    ALTER SYSTEM SET effective_io_concurrency = 200;
    ALTER SYSTEM SET work_mem = '4MB';
    ALTER SYSTEM SET min_wal_size = '1GB';
    ALTER SYSTEM SET max_wal_size = '4GB';
    
    SELECT 'Base de datos inicializada correctamente' AS status;
EOSQL

echo "✅ Base de datos inicializada"


