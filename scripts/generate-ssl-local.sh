#!/bin/bash

# Script para generar certificados SSL self-signed para desarrollo local
# Estos certificados NO son para producción, solo para pruebas locales

set -e

SSL_DIR="nginx/ssl"
DOMAIN="localhost"

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Generando certificados SSL self-signed para desarrollo local...${NC}"

# Crear directorio si no existe
mkdir -p "$SSL_DIR"

# Verificar si OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ Error: OpenSSL no está instalado.${NC}"
    echo -e "${YELLOW}Instala OpenSSL:${NC}"
    echo "  macOS: brew install openssl"
    echo "  Ubuntu/Debian: sudo apt-get install openssl"
    exit 1
fi

# Generar clave privada
echo -e "${YELLOW}📝 Generando clave privada...${NC}"
openssl genrsa -out "$SSL_DIR/privkey.pem" 2048

# Generar certificado autofirmado
echo -e "${YELLOW}📝 Generando certificado autofirmado...${NC}"
openssl req -new -x509 -key "$SSL_DIR/privkey.pem" -out "$SSL_DIR/fullchain.pem" -days 365 \
    -subj "/C=MX/ST=Estado/L=Ciudad/O=Nocturna Genesis/OU=Development/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:$DOMAIN,DNS:*.$DOMAIN,DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"

# Ajustar permisos
chmod 600 "$SSL_DIR/privkey.pem"
chmod 644 "$SSL_DIR/fullchain.pem"

echo -e "${GREEN}✅ Certificados SSL generados exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📋 Archivos generados:${NC}"
echo "  - $SSL_DIR/privkey.pem (clave privada)"
echo "  - $SSL_DIR/fullchain.pem (certificado)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  - Estos son certificados self-signed (solo para desarrollo)"
echo "  - Tu navegador mostrará una advertencia de seguridad (esto es normal)"
echo "  - Para producción, usa Let's Encrypt o certificados comerciales"
echo ""
echo -e "${YELLOW}🔧 Próximos pasos:${NC}"
echo "  1. Descomenta la configuración HTTPS en nginx/nginx.conf"
echo "  2. Reinicia Nginx: docker-compose restart nginx"
echo "  3. Accede a https://localhost:8443"
echo "  4. Acepta la advertencia de seguridad del navegador"


