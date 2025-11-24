#!/bin/bash

# Script para crear usuarios admin y sales en la base de datos

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
APP_SERVICE="app1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}👤 Creando usuarios admin y sales...${NC}"

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "nocturna-app-1"; then
    echo -e "${RED}Error: El contenedor nocturna-app-1 no está corriendo${NC}"
    exit 1
fi

# Crear script temporal para generar hashes y crear usuarios
docker exec nocturna-app-1 node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    // Hashear contraseñas
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const salesHash = await bcrypt.hash('Sales123!', 10);
    
    // Crear/actualizar admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@agencia.com' },
      update: {
        password: adminHash,
        status: 'active',
        emailVerified: true,
        name: 'Administrador'
      },
      create: {
        email: 'admin@agencia.com',
        name: 'Administrador',
        password: adminHash,
        role: 'admin',
        status: 'active',
        emailVerified: true
      }
    });
    
    // Crear/actualizar sales
    const sales = await prisma.user.upsert({
      where: { email: 'sales@agencia.com' },
      update: {
        password: salesHash,
        status: 'active',
        emailVerified: true,
        name: 'Vendedor Ventas'
      },
      create: {
        email: 'sales@agencia.com',
        name: 'Vendedor Ventas',
        password: salesHash,
        role: 'emprendedores',
        status: 'active',
        emailVerified: true
      }
    });
    
    console.log('✅ Usuario admin creado/actualizado:', admin.email);
    console.log('✅ Usuario sales creado/actualizado:', sales.email);
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Usuarios creados exitosamente${NC}"
    echo ""
    echo -e "${YELLOW}📋 Credenciales:${NC}"
    echo "   Admin: admin@agencia.com / Admin123!"
    echo "   Sales: sales@agencia.com / Sales123!"
else
    echo -e "${RED}❌ Error al crear usuarios${NC}"
    exit 1
fi

