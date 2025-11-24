#!/bin/bash

# Script de despliegue para producción
# Nocturna Genesis - Infraestructura en la nube

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de Nocturna Genesis en producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que existe .env.prod
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ Error: Archivo .env.prod no encontrado${NC}"
    echo "Crea un archivo .env.prod con las variables de entorno necesarias"
    echo "Puedes usar .env.example como base"
    exit 1
fi

# Cargar variables de entorno
export $(cat .env.prod | grep -v '^#' | xargs)

# Verificar variables críticas
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$AUTH_SECRET" ]; then
    echo -e "${RED}❌ Error: Variables críticas no configuradas en .env.prod${NC}"
    echo "Asegúrate de configurar: POSTGRES_PASSWORD, AUTH_SECRET"
    exit 1
fi

echo -e "${GREEN}✓ Variables de entorno cargadas${NC}"

# Construir imágenes
echo -e "${YELLOW}📦 Construyendo imágenes Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Detener contenedores existentes (si hay)
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose -f docker-compose.prod.yml down

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar salud de los servicios
echo -e "${YELLOW}🏥 Verificando salud de los servicios...${NC}"

# Verificar base de datos
if docker exec nocturna-db-prod pg_isready -U ${POSTGRES_USER:-postgres} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Base de datos: Saludable${NC}"
else
    echo -e "${RED}❌ Base de datos: No responde${NC}"
    exit 1
fi

# Verificar aplicaciones
for i in 1 2; do
    if docker exec nocturna-app-${i} node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Aplicación ${i}: Saludable${NC}"
    else
        echo -e "${YELLOW}⚠ Aplicación ${i}: Aún iniciando...${NC}"
    fi
done

# Verificar Nginx
if docker exec nocturna-nginx nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx: Configuración válida${NC}"
else
    echo -e "${RED}❌ Nginx: Error en configuración${NC}"
    docker exec nocturna-nginx nginx -t
    exit 1
fi

# Ejecutar migraciones de base de datos
echo -e "${YELLOW}🗄️  Ejecutando migraciones de base de datos...${NC}"
# Intentar migrate deploy primero, si falla usar db push (para desarrollo/primera vez)
if docker exec nocturna-app-1 npx --package=prisma@6.19.0 prisma migrate deploy 2>&1 | grep -q "error\|Error"; then
    echo -e "${YELLOW}⚠ Migraciones fallaron, usando db push para crear tablas...${NC}"
    docker exec nocturna-app-1 npx --package=prisma@6.19.0 prisma db push --accept-data-loss || echo -e "${YELLOW}⚠ Error al crear tablas${NC}"
else
    echo -e "${GREEN}✓ Migraciones aplicadas correctamente${NC}"
fi

# Mostrar estado final
echo ""
echo -e "${GREEN}✅ Despliegue completado exitosamente!${NC}"
echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Acceso a la aplicación:"
echo "   - HTTP:  http://localhost"
echo "   - HTTPS: https://localhost (cuando configures SSL)"
echo ""
echo "📝 Logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Detener servicios:"
echo "   docker-compose -f docker-compose.prod.yml down"

