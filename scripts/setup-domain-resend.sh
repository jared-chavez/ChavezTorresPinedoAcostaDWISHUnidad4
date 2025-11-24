#!/bin/bash

# Script para configurar un dominio real con Resend
# Ejecutar después de comprar el dominio y configurar registros DNS

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 CONFIGURACIÓN DE DOMINIO REAL CON RESEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Solicitar dominio
read -p "Ingresa tu dominio (ej: nocturnagenesis.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: Debes ingresar un dominio${NC}"
    exit 1
fi

# Limpiar dominio (quitar http://, https://, www.)
DOMAIN=$(echo "$DOMAIN" | sed 's|^https\?://||' | sed 's|^www\.||' | sed 's|/$||')

echo ""
echo -e "${YELLOW}📋 Configurando dominio: ${DOMAIN}${NC}"
echo ""

# Verificar que .env.prod existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE no existe${NC}"
    exit 1
fi

# Backup de .env.prod
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ Backup creado: ${ENV_FILE}.backup.*${NC}"

# Actualizar NEXTAUTH_URL
echo -e "${YELLOW}Actualizando NEXTAUTH_URL...${NC}"
if grep -q "^NEXTAUTH_URL=" "$ENV_FILE"; then
    sed -i.bak "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${DOMAIN}|" "$ENV_FILE"
else
    echo "NEXTAUTH_URL=https://${DOMAIN}" >> "$ENV_FILE"
fi
echo -e "${GREEN}✓ NEXTAUTH_URL=https://${DOMAIN}${NC}"

# Actualizar APP_URL
echo -e "${YELLOW}Actualizando APP_URL...${NC}"
if grep -q "^APP_URL=" "$ENV_FILE"; then
    sed -i.bak "s|^APP_URL=.*|APP_URL=https://${DOMAIN}|" "$ENV_FILE"
else
    echo "APP_URL=https://${DOMAIN}" >> "$ENV_FILE"
fi
echo -e "${GREEN}✓ APP_URL=https://${DOMAIN}${NC}"

# Actualizar RESEND_FROM_EMAIL
echo -e "${YELLOW}Actualizando RESEND_FROM_EMAIL...${NC}"
FROM_EMAIL="noreply@${DOMAIN}"
if grep -q "^RESEND_FROM_EMAIL=" "$ENV_FILE"; then
    sed -i.bak "s|^RESEND_FROM_EMAIL=.*|RESEND_FROM_EMAIL=${FROM_EMAIL}|" "$ENV_FILE"
else
    echo "RESEND_FROM_EMAIL=${FROM_EMAIL}" >> "$ENV_FILE"
fi
echo -e "${GREEN}✓ RESEND_FROM_EMAIL=${FROM_EMAIL}${NC}"

# Limpiar archivos .bak
rm -f "${ENV_FILE}.bak"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "1. Configura los registros DNS en tu proveedor de dominio:"
echo "   • Ve a Resend: https://resend.com/domains"
echo "   • Agrega el dominio: ${DOMAIN}"
echo "   • Copia los registros DNS que Resend te muestre"
echo "   • Agrégalos en el panel DNS de tu proveedor"
echo ""
echo "2. Espera propagación DNS (5-30 minutos)"
echo ""
echo "3. Reinicia los contenedores:"
echo "   docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart app1 app2"
echo ""
echo "4. Verifica en Resend que el dominio esté verificado"
echo ""
echo -e "${BLUE}💡 Tip:${NC} Puedes verificar los registros DNS con:"
echo "   ./scripts/verify-dns-records.sh"
echo ""


