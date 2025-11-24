#!/bin/bash

# Script para actualizar la API key de Resend y reiniciar los servicios

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔑 Actualizando API Key de Resend...${NC}"

# Verificar que .env.prod existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE no existe${NC}"
    exit 1
fi

# Verificar que RESEND_API_KEY esté configurado
if ! grep -q "^RESEND_API_KEY=" "$ENV_FILE"; then
    echo -e "${RED}Error: RESEND_API_KEY no está en $ENV_FILE${NC}"
    echo -e "${YELLOW}Agrega: RESEND_API_KEY=re_tu_key_aqui${NC}"
    exit 1
fi

# Leer la API key
RESEND_KEY=$(grep "^RESEND_API_KEY=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$RESEND_KEY" ] || [ "$RESEND_KEY" = "" ]; then
    echo -e "${RED}Error: RESEND_API_KEY está vacío en $ENV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ API Key encontrada: ${RESEND_KEY:0:10}...${NC}"

# Reiniciar contenedores con force-recreate para asegurar que carguen las variables
echo -e "${YELLOW}🔄 Reiniciando contenedores con --force-recreate...${NC}"
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down app1 app2 app3 2>&1 | grep -v "Warning" || true
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app1 app2 app3 2>&1 | grep -v "Warning" || true

echo -e "${YELLOW}⏳ Esperando a que los servicios inicien...${NC}"
sleep 5

# Verificar que la variable esté cargada
echo -e "${YELLOW}🔍 Verificando configuración...${NC}"
if docker exec nocturna-app-1 printenv | grep -q "RESEND_API_KEY=$RESEND_KEY"; then
    echo -e "${GREEN}✅ API Key cargada correctamente en el contenedor${NC}"
else
    echo -e "${YELLOW}⚠️  Verificando manualmente...${NC}"
    docker exec nocturna-app-1 printenv | grep RESEND_API_KEY || echo -e "${RED}❌ API Key no encontrada en el contenedor${NC}"
fi

echo -e "${GREEN}✅ Proceso completado${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos pasos:${NC}"
echo "   1. Prueba registrar un nuevo usuario"
echo "   2. Verifica los logs: docker logs nocturna-app-1 --tail=50 | grep -i email"
echo "   3. Si hay errores, verifica que la API key sea válida en Resend"

