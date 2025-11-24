#!/bin/bash

# Script para verificar si los registros DNS están configurados correctamente
# Útil después de configurar en DuckDNS

DOMAIN="nocturna-genesis.duckdns.org"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICANDO REGISTROS DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Dominio: $DOMAIN"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "1️⃣ Verificando DKIM (resend._domainkey)..."
DKIM_RECORD=$(dig +short TXT resend._domainkey.$DOMAIN 2>/dev/null)
if [ -z "$DKIM_RECORD" ]; then
    echo -e "${RED}❌ DKIM no encontrado${NC}"
else
    echo -e "${GREEN}✅ DKIM encontrado${NC}"
    echo "   Valor: ${DKIM_RECORD:0:50}..."
fi
echo ""

echo "2️⃣ Verificando SPF - MX (send)..."
MX_RECORD=$(dig +short MX send.$DOMAIN 2>/dev/null)
if [ -z "$MX_RECORD" ]; then
    echo -e "${RED}❌ MX no encontrado${NC}"
else
    echo -e "${GREEN}✅ MX encontrado${NC}"
    echo "   Valor: $MX_RECORD"
fi
echo ""

echo "3️⃣ Verificando SPF - TXT (send)..."
SPF_RECORD=$(dig +short TXT send.$DOMAIN 2>/dev/null)
if [ -z "$SPF_RECORD" ]; then
    echo -e "${RED}❌ SPF TXT no encontrado${NC}"
else
    echo -e "${GREEN}✅ SPF TXT encontrado${NC}"
    echo "   Valor: $SPF_RECORD"
fi
echo ""

echo "4️⃣ Verificando DMARC (_dmarc)..."
DMARC_RECORD=$(dig +short TXT _dmarc.$DOMAIN 2>/dev/null)
if [ -z "$DMARC_RECORD" ]; then
    echo -e "${YELLOW}⚠️  DMARC no encontrado (opcional)${NC}"
else
    echo -e "${GREEN}✅ DMARC encontrado${NC}"
    echo "   Valor: $DMARC_RECORD"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NOTAS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Si los registros no aparecen, espera 5-30 minutos"
echo "• La propagación DNS puede tardar hasta 2 horas"
echo "• Resend verificará automáticamente cuando estén listos"
echo ""
echo "• Verifica manualmente en Resend:"
echo "  https://resend.com/domains"
echo ""


