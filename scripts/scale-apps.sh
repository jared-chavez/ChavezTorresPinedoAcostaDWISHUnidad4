#!/bin/bash

# Script para escalar instancias de la aplicación
# Uso: ./scripts/scale-apps.sh [número de instancias]

set -e

INSTANCES=${1:-2}

if [ "$INSTANCES" -lt 1 ] || [ "$INSTANCES" -gt 5 ]; then
    echo "❌ Error: El número de instancias debe estar entre 1 y 5"
    exit 1
fi

echo "📈 Escalando a $INSTANCES instancias de la aplicación..."

# Escalar servicios
docker-compose -f docker-compose.prod.yml up -d --scale app1=1 --scale app2=1

if [ "$INSTANCES" -ge 3 ]; then
    docker-compose -f docker-compose.prod.yml --profile scale up -d app3
fi

echo "✅ Escalado completado"
echo "📊 Estado actual:"
docker-compose -f docker-compose.prod.yml ps | grep app


