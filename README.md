<div align="center">
  <img src="./public/logo1.png" alt="Nocturna Genesis Logo" width="400" height="400" style="border-radius: 20px; margin-bottom: 20px;" />
  
  # Agencia de Vehículos - Nocturna Genesis
  
  Sistema completo de gestión de inventario y ventas para una agencia de vehículos, desarrollado con Next.js 16, TypeScript, NextAuth y Tailwind CSS.
</div>

## Características

### Mecanismos de Seguridad
- **Autenticación segura** con NextAuth v5 y bcryptjs para hash de contraseñas
- **Validación de datos** con Zod en todas las entradas
- **Middleware de seguridad** que protege rutas y valida roles
- **Control de acceso basado en roles** (Admin, Emprendedores, Usuarios Regulares)
- **Protección CSRF** integrada en NextAuth
- **Validación de sesiones** JWT

### Web Services Propios
- **API REST completa** para gestión de vehículos (CRUD)
- **API de usuarios** con control de acceso
- **API de ventas** con validación de inventario
- **API de estadísticas** para dashboard
- **Búsqueda y filtros avanzados** con paginación
- **Endpoints protegidos** con autenticación y autorización

### Web Services de Terceros
- **NHTSA VIN Decoder** - Decodificación de VIN (gratuita, sin API key)
- **Market Pricing API** - Precios de mercado (simulada, lista para integración real)
- **OpenWeatherMap API** - Información del clima (opcional)
- **ExchangeRate API** - Conversión de monedas (opcional)

### Verificación de Email
- **MailerSend API** - Envío de emails de verificación
- **Templates HTML** - Emails personalizados con diseño profesional
- **Validación de IP** - Rate limiting y prevención de spam
- **Tokens seguros** - Expiración automática y uso único

## Tecnologías Utilizadas

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **NextAuth v5** - Autenticación y autorización
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM para PostgreSQL
- **Tailwind CSS** - Estilos y diseño responsive
- **Zod** - Validación de esquemas
- **bcryptjs** - Hash de contraseñas
- **Axios** - Cliente HTTP para APIs
- **Recharts** - Gráficos y visualizaciones
- **MailerSend** - Servicio de email para verificación
- **xlsx** - Procesamiento de archivos Excel para importación de ventas
- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes React

## Requisitos Previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- **PostgreSQL 14+** (o acceso a una base de datos PostgreSQL)

## Instalación Rápida

### 1. Clonar y Instalar

```bash
git clone <tu-repositorio>
cd nocturna-genesis
npm install
```

### 2. Configurar PostgreSQL

**Opción A: Docker (Recomendado)**
```bash
docker run --name nocturna-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nocturna_genesis \
  -p 5432:5432 \
  -d postgres:15
```

**Opción B: PostgreSQL Local**
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb nocturna_genesis

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql
createdb nocturna_genesis
```

**Opción C: Servicios en la Nube**
- [Supabase](https://supabase.com) (gratis)
- [Neon](https://neon.tech) (gratis)
- [Railway](https://railway.app) (gratis con límites)

### 3. Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
# NextAuth Secret (genera con: openssl rand -base64 32)
AUTH_SECRET=tu-secret-key-super-segura

# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/nocturna_genesis?schema=public"

# MailerSend (para verificación de email)
MAILERSEND_API_TOKEN=mlsn.xxxxxxxxxxxxx
MAILERSEND_FROM_EMAIL=noreply@tudominio.com
MAILERSEND_FROM_NAME=Nocturna Genesis
APP_URL=http://localhost:3000

# Opcional: APIs de terceros
OPENWEATHER_API_KEY=tu_api_key_aqui
```

**Generar AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Configurar DATABASE_URL:**
- **Docker:** `postgresql://postgres:password@localhost:5432/nocturna_genesis?schema=public`
- **Local:** `postgresql://[usuario]:[contraseña]@localhost:5432/nocturna_genesis?schema=public`
- **Supabase:** `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require`

**Ejemplos de DATABASE_URL:**
- Local: `postgresql://postgres:password@localhost:5432/nocturna_genesis?schema=public`
- Docker: `postgresql://postgres:password@localhost:5432/nocturna_genesis?schema=public`
- Supabase: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`

### 4. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear tablas (migraciones)
npm run db:migrate

# Poblar con datos de ejemplo
npm run db:seed
```

### 5. Iniciar Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Credenciales por Defecto

### Administrador
- **Email:** `admin@agencia.com`
- **Password:** `Admin123!`
- **Rol:** `admin` (acceso completo)

### Vendedor/Ventas (Emprendedor)
- **Email:** `sales@agencia.com` o `emprendedor@agencia.com`
- **Password:** `Sales123!` o `Emprendedor123!`
- **Rol:** `emprendedores` (puede crear/editar vehículos y registrar ventas)

**Nota**: Si los usuarios no existen, ejecuta `./scripts/create-users.sh` o `docker exec nocturna-app-1 npx tsx prisma/seed.ts`

## Roles y Permisos

### Administrador (admin)
- Acceso completo al sistema
- Gestión de usuarios (CRUD)
- CRUD completo de vehículos
- Eliminar vehículos
- Registrar y editar ventas
- Dashboard completo con todas las métricas

### Emprendedores (emprendedores)
- Crear y editar vehículos
- No puede eliminar vehículos
- Registrar ventas
- Ver inventario y estadísticas
- No puede gestionar usuarios

### Usuarios Regulares (usuarios_regulares)
- Ver inventario (solo lectura)
- Ver ventas (solo lectura)
- Dashboard básico
- No puede crear/editar/eliminar

## API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `GET /api/auth/session` - Obtener sesión actual

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/search` - Búsqueda avanzada con filtros y paginación
- `GET /api/vehicles/[id]` - Obtener vehículo
- `POST /api/vehicles` - Crear vehículo (Admin/Emprendedores)
- `PUT /api/vehicles/[id]` - Actualizar vehículo (Admin/Emprendedores)
- `DELETE /api/vehicles/[id]` - Eliminar vehículo (Admin)

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `GET /api/users/[id]` - Obtener usuario (Admin)
- `POST /api/users` - Crear usuario (Admin)
- `PUT /api/users/[id]` - Actualizar usuario (Admin)
- `DELETE /api/users/[id]` - Eliminar usuario (Admin)

### Autenticación y Registro
- `POST /api/auth/register` - Registro público con verificación de email
- `GET /api/auth/verify-email?token=XXX` - Verificar email con token

### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/[id]` - Obtener venta
- `POST /api/sales` - Registrar venta (Admin/Emprendedores)
- `PUT /api/sales/[id]` - Actualizar venta (Admin)
- `DELETE /api/sales/[id]` - Eliminar venta (Admin)
- `POST /api/sales/import` - Importar ventas desde archivo Excel (Admin/Emprendedores)
- `GET /api/sales/my-purchases` - Obtener compras del usuario actual (Usuarios Regulares)

### Estadísticas
- `GET /api/stats/dashboard` - Estadísticas del dashboard

### Web Services de Terceros
- `GET /api/external/vehicle-info?vin=XXX` - Información del vehículo por VIN (NHTSA)
- `GET /api/external/pricing?brand=X&model=Y&year=Z` - Precios de mercado
- `GET /api/external/weather?city=XXX` - Información del clima (opcional)
- `GET /api/external/currency?from=USD&to=MXN&amount=100` - Conversión de moneda (opcional)

## Comandos de Base de Datos

```bash
# Generar cliente de Prisma (después de cambios en schema.prisma)
npm run db:generate

# Crear y aplicar migraciones
npm run db:migrate

# Aplicar cambios sin migraciones (solo desarrollo)
npm run db:push

# Poblar base de datos con datos de ejemplo
npm run db:seed

# Abrir Prisma Studio (interfaz visual)
npm run db:studio
```

## Conexión desde TablePlus

### Configuración
1. **Abrir TablePlus** → Crear Nueva Conexión → PostgreSQL
2. **Configurar:**
   - **Host:** `localhost`
   - **Puerto:** `5432`
   - **Usuario:** `postgres`
   - **Contraseña:** `password`
   - **Base de datos:** `nocturna_genesis`
   - **SSL:** Desactivado (local)

### String de Conexión
```
postgresql://postgres:password@localhost:5432/nocturna_genesis
```

### Verificar Docker (si usas Docker)
```bash
docker ps                    # Ver contenedores activos
docker start nocturna-postgres  # Iniciar si está detenido
```

## Estructura del Proyecto

```
src/
├── app/                    # Páginas y rutas
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── vehicles/     # CRUD de vehículos
│   │   ├── users/        # Gestión de usuarios
│   │   ├── sales/        # Gestión de ventas
│   │   ├── stats/        # Estadísticas
│   │   └── external/      # Web Services de terceros
│   ├── dashboard/        # Dashboard principal
│   ├── inventory/        # Gestión de inventario
│   ├── sales/            # Gestión de ventas
│   ├── users/            # Gestión de usuarios (admin)
│   ├── login/           # Página de login
│   └── register/        # Página de registro
├── components/           # Componentes React reutilizables
│   ├── SearchAndFilters.tsx
│   ├── Pagination.tsx
│   ├── ToastProvider.tsx
│   ├── ConfirmDialog.tsx
│   └── ...
├── lib/                  # Utilidades y configuración
│   ├── auth.ts          # Configuración NextAuth
│   ├── db.ts            # Funciones de base de datos (Prisma)
│   ├── prisma.ts        # Cliente Prisma singleton
│   ├── roles.ts         # Definición de roles y permisos
│   ├── api-client.ts    # Cliente API centralizado
│   └── validations.ts   # Schemas de validación Zod
├── hooks/               # Custom React Hooks
│   ├── useVehicles.ts
│   ├── useDashboard.ts
│   └── ...
├── prisma/               # Configuración de Prisma
│   ├── schema.prisma    # Schema de la base de datos
│   └── seed.ts          # Script de seed para datos iniciales
└── types/                # Definiciones TypeScript
```

## Seguridad Implementada

1. **Autenticación JWT** con NextAuth
2. **Hash de contraseñas** con bcryptjs (10 rounds)
3. **Validación de entrada** con Zod en todos los endpoints
4. **Middleware de protección** de rutas
5. **Control de acceso basado en roles** (RBAC)
6. **Sanitización de datos** en formularios
7. **Protección CSRF** integrada
8. **Confirmaciones** para acciones destructivas
9. **Toast notifications** para feedback de usuario

## Funcionalidades Implementadas

### Completadas
- Autenticación y autorización
- CRUD completo de vehículos
- CRUD completo de usuarios (crear, leer, actualizar, eliminar, cambio de rol)
- CRUD completo de ventas
- **Importación de ventas desde Excel** (con validación y manejo de campos opcionales)
- Sistema de facturación (invoiceNumber, taxAmount, totalAmount, status)
- Checkout de compra para clientes (simulado PayPal)
- Registro con verificación de email (MailerSend)
- Validación de IP y rate limiting
- Dashboard con métricas y gráficos
- Búsqueda y filtros avanzados
- Paginación en listados
- Confirmaciones en acciones destructivas
- Sistema de notificaciones (Toast)
- Integración con APIs de terceros
- Base de datos PostgreSQL con Prisma
- Diseño responsive completo
- Dark mode
- Landing page profesional
- Tablas responsive

## Estado del Proyecto

### **Progreso: ~97% Completado**

La aplicación está funcionalmente completa y lista para uso. Las tareas pendientes son principalmente mejoras opcionales y optimizaciones.

**Funcionalidades Core: 100% ✅**
- Autenticación y autorización
- CRUD completo de vehículos, usuarios y ventas
- Sistema de facturación (invoiceNumber, taxAmount, totalAmount, status)
- **Importación masiva de ventas desde Excel** (con validación y manejo de campos opcionales)
- Checkout de compra para clientes (simulado PayPal)
- Dashboard con métricas
- Búsqueda, filtros y paginación
- Verificación de email
- Sistema de imágenes BLOB
- Flujo completo de cliente

**Funcionalidades Adicionales: 95% ✅**
- Landing page profesional
- UI responsive completa
- Dark mode
- Tablas responsive
- Sistema de notificaciones
- Integración con APIs de terceros (1 real, 1 simulado)

**Testing: 85% ✅**
- Tests unitarios (59+ tests pasando)
- Tests de integración con BD
- Tests E2E (opcional)

**Seguridad: 95% ✅**
- NextAuth con JWT
- Hash de contraseñas
- Validación con Zod
- Middleware de protección
- RBAC completo
- Rate limiting
- Validación de IP

### Métricas de Cobertura

| Categoría | Completado | Estado |
|-----------|------------|--------|
| Autenticación | 100% | Completo |
| Autorización (RBAC) | 100% | Completo |
| Verificación de Email | 100% | Completo (MailerSend) |
| CRUD Vehículos | 100% | Completo |
| CRUD Ventas | 100% | Completo (incluye importación Excel) |
| CRUD Usuarios | 100% | Completo |
| Dashboard | 95% | Casi completo |
| Búsqueda/Filtros | 100% | Completo |
| Paginación | 100% | Completo |
| Web Services Propios | 100% | Completo |
| Web Services Terceros | 75% | 1 simulado |
| UI Responsive | 100% | Completo |
| Seguridad | 95% | Muy completo |
| Base de Datos | 100% | Completo |

### Fortalezas
- Arquitectura sólida y escalable
- Seguridad robusta (NextAuth, bcryptjs, Zod, RBAC)
- Verificación de email con MailerSend
- Rate limiting y validación de IP
- UI/UX profesional y responsive
- Código bien organizado y documentado
- Base de datos PostgreSQL con Prisma

### Áreas de Mejora
- Integración real de Market Pricing API (actualmente simulado)
- Tests E2E opcionales con Playwright para flujos críticos

### Sistema de Imágenes de Vehículos ✅
- **Implementado**: Almacenamiento de imágenes como BLOB en PostgreSQL (BYTEA)
- **Relación**: Tabla `VehicleImage` con relación CASCADE a `vehicles`
- **API**: Endpoint `/api/vehicles/[id]/image/[imageId]` para servir imágenes
- **Componente**: `ImageUpload` para subida múltiple con preview
- **Nota**: Para producción, se recomienda migrar a servicio externo (Azure Blob, Cloudinary, Vercel Blob) para mejor rendimiento

## Desarrollo

### Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Calidad de Código
npm run lint             # Ejecutar linter
npm run type-check       # Verificar tipos de TypeScript

## Testing

### Estrategia de Testing

Este proyecto usa una estrategia híbrida de testing:
- **Tests unitarios**: 59 tests pasando ✅
- **Tests de integración con BD real**: Usan la BD de desarrollo/producción con estrategia de limpieza
- **Tests de API routes**: Estructurados (requieren setup adicional para NextRequest en Jest)

### Tests Unitarios ✅

**Estado**: 100% funcionales (59+ tests pasando)

Cubren:
- **Validaciones (Zod schemas)**: 17 tests (incluye nuevos campos de ventas: invoiceNumber, taxAmount, totalAmount, status)
- **Lógica de roles y permisos**: 15 tests
- **Utilidades (IP, facturación)**: 20 tests (8 IP + 12 facturación)
- **Componentes React**: 28 tests
- **Relaciones BD**: Tests de relación Vehicle-VehicleImage

**Tests de Facturación:**
- Generación de números de factura únicos
- Cálculo de impuestos (IVA 16%)
- Cálculo de totales
- Validación de estados de venta

**Ejecutar**:
```bash
npm test                 # Ejecutar todos los tests
npm run test:watch       # Ejecutar tests en modo watch
npm run test:coverage    # Ejecutar tests con cobertura
```

### Tests de Integración con Base de Datos

**Estrategia**: Usar la BD de desarrollo/producción con estrategia de limpieza.

**Protecciones implementadas**:
1. **Prefijos de test**: Todos los datos de prueba usan prefijo `test_`
2. **Limpieza automática**: `cleanupTestData()` elimina datos de test
3. **Verificación de integridad**: `verifyProductionDataIntegrity()` verifica que no se afectaron datos reales
4. **Helpers seguros**: Funciones helper que solo crean/modifican datos con prefijo `test_`

**Helpers disponibles** (en `src/__tests__/database.test-helpers.ts`):
- `createTestUser(email?)` - Crea usuario de prueba con prefijo `test_`
- `cleanupTestData(prefix)` - Limpia todos los datos con el prefijo
- `verifyProductionDataIntegrity()` - Verifica que no hay datos de test en producción

**Ejecutar tests de BD**:
```bash
# Asegúrate de tener DATABASE_URL en .env.local
npm test -- src/__tests__/database.test.ts
```

### Tests de API Routes

Los tests de integración de API routes están estructurados pero requieren setup adicional para `NextRequest` en Jest.

**Recomendación**: Mantener los tests unitarios actuales (que ya funcionan perfectamente) y agregar tests E2E opcionales con Playwright para flujos críticos si es necesario.

**Mejores Prácticas**:
1. Siempre usar prefijos `test_` en datos de prueba
2. Limpiar datos después de cada test con `cleanupTestData()`
3. Verificar integridad con `verifyProductionDataIntegrity()` en `afterAll`
4. No modificar datos de producción - solo leer y crear datos de test
5. Ejecutar tests antes de commits importantes

⚠️ **Nota**: Los tests de BD usan la BD real. Asegúrate de tener backups antes de ejecutar tests masivos.

# Base de Datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Crear migraciones
npm run db:push          # Aplicar cambios (dev)
npm run db:seed          # Poblar datos
npm run db:studio        # Abrir Prisma Studio
```

## Solución de Problemas

### Error: "Can't reach database server"
```bash
# Verificar PostgreSQL (Docker)
docker ps
docker start nocturna-postgres

# Verificar PostgreSQL (Local)
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Error: "Database does not exist"
```bash
createdb nocturna_genesis
```

### Error: "Prisma Client not generated"
```bash
npm run db:generate
```

### Error: "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### Error: "Missing required environment variable: DATABASE_URL"
```bash
# Verificar que .env.local existe y tiene DATABASE_URL configurada
# Para Docker:
DATABASE_URL="postgresql://postgres:password@localhost:5432/nocturna_genesis?schema=public"

# Verificar contenedor Docker:
docker ps
docker start nocturna-postgres
```

### Error: "MailerSend API error"

**Error 401 (Unautenticado):**
- Verificar que `MAILERSEND_API_TOKEN` está configurado en `.env.local`
- Verificar que el token tiene permisos "Sending access"
- Regenerar token si es necesario

**Error 422 (Dominio no verificado):**
- El dominio del email remitente debe estar verificado en MailerSend
- **Solución rápida para desarrollo**: No configurar `MAILERSEND_FROM_EMAIL` (el sistema usará `onboarding@mailersend.com` automáticamente)
- **Para producción**: Verificar dominio en MailerSend (Settings → Domains → Add Domain → Configurar DNS)

**Verificar dominio en MailerSend:**
1. Ve a https://app.mailersend.com/domains
2. Click en "Add Domain"
3. Agrega los registros DNS que MailerSend proporciona
4. Espera la propagación (5 min - 24 horas)
5. Click en "Verify"

**Configuración recomendada para desarrollo:**
```env
MAILERSEND_API_TOKEN=mlsn.xxxxxxxxxxxxx
# No configurar MAILERSEND_FROM_EMAIL (usa onboarding@mailersend.com automáticamente)
MAILERSEND_FROM_NAME=Nocturna Genesis
APP_URL=http://localhost:3000
```

## Próximos Pasos para Producción

1. **Base de datos**: PostgreSQL con Prisma implementado
2. **Variables de entorno**: Configurar todas las variables en producción
3. **API Keys**: Obtener API keys reales para servicios de terceros
4. **Logging**: Implementar sistema de logs estructurado
5. **Monitoreo**: Configurar herramientas de monitoreo
6. **Backup**: Implementar estrategia de respaldo para PostgreSQL
7. **HTTPS**: Configurar certificados SSL
8. **Rate Limiting**: Implementar límites de tasa para APIs
9. **Connection Pooling**: Configurar pool de conexiones para Prisma
10. **Migrations**: Configurar migraciones automáticas en producción

## Importación de Ventas desde Excel

### Funcionalidad
El sistema permite importar múltiples ventas desde un archivo Excel, facilitando la carga masiva de datos históricos o registros en lote.

### Características
- **Validación automática**: Cada fila se valida con esquemas Zod antes de importar
- **Manejo de campos opcionales**: Teléfono y Notas aceptan valores vacíos o "N/A"
- **Fecha de venta flexible**: Soporta formatos de fecha de Excel (serial, YYYY-MM-DD, DD/MM/YYYY)
- **Búsqueda por VIN**: Encuentra automáticamente el vehículo correspondiente
- **Cálculo automático**: Genera invoiceNumber, calcula taxAmount (16% IVA) y totalAmount
- **Reporte detallado**: Muestra éxito y errores por fila después de la importación
- **Actualización de estado**: Marca automáticamente los vehículos como "sold" después de la venta

### Formato del Excel

| Columna | Requerido | Ejemplo | Descripción |
|---------|-----------|---------|-------------|
| **VIN** | ✅ | `1HGBH41JXMN109186` | VIN del vehículo (debe existir en BD) |
| **Nombre Cliente** | ✅ | `Juan Pérez` | Nombre completo del cliente |
| **Email Cliente** | ✅ | `juan@email.com` | Email válido del cliente |
| **Teléfono Cliente** | ❌ | `5551234567` o `N/A` o vacío | Teléfono (opcional, se guarda como "N/A" si está vacío) |
| **Precio Venta** | ✅ | `700000` | Precio de venta (sin impuestos) |
| **Método Pago** | ✅ | `credit/cash/financing` | Método de pago (default: `credit`) |
| **Estado** | ❌ | `completed/pending/cancelled/refunded` | Estado de la venta (default: `completed`) |
| **Fecha Venta** | ❌ | `2025-11-12` o vacío | Fecha de venta (default: fecha actual) |
| **Notas** | ❌ | `Venta especial` o `N/A` o vacío | Notas adicionales (opcional) |

### Uso
1. Ir a la página de **Ventas** (`/sales`)
2. Click en **"Plantilla"** para descargar el archivo Excel de ejemplo
3. Llenar el archivo con los datos de ventas
4. Click en **"Importar Excel"** y seleccionar el archivo
5. Revisar el reporte de importación (éxitos y errores)

### Validaciones
- VIN debe existir en la base de datos
- Vehículo debe estar disponible (`available` o `reserved`)
- Email debe tener formato válido
- Precio debe ser un número positivo
- Método de pago debe ser válido (`cash`, `credit`, `financing`)
- Estado debe ser válido (`completed`, `pending`, `cancelled`, `refunded`)

### Manejo de Errores
- Si una fila tiene errores, se reporta en el modal de resultados
- Las filas válidas se importan exitosamente
- Las filas con errores se omiten y se muestran en el reporte
- El sistema continúa procesando el resto del archivo aunque haya errores

## Notas

- **Base de datos PostgreSQL** implementada con Prisma ORM
- **3 roles de usuario**: Admin, Emprendedores, Usuarios Regulares
- **Búsqueda y filtros** implementados con paginación
- **APIs de terceros**: NHTSA (funcional), Pricing (simulada), Weather y Currency (opcionales)
- **Web Services propios**: API REST completa con autenticación
- **Importación masiva**: Sistema de importación de ventas desde Excel con validación completa
- En producción, reemplazar APIs simuladas por APIs reales con API keys
- Usa `npm run db:studio` para visualizar y editar datos directamente

## Mecanismos de Seguridad Detallados

### Autenticación
- **NextAuth v5** - Sistema de autenticación robusto con JWT sessions
- **bcryptjs** - Hash de contraseñas (10 rounds)
- **CSRF Protection** - Protección integrada en NextAuth

### Validación de Datos
- **Zod** - Validación de esquemas en todas las entradas:
  - Registro de usuarios
  - Creación/edición de vehículos
  - Registro de ventas
  - Todas las entradas de API

### Control de Acceso
- **Middleware de Seguridad** (`src/middleware.ts`)
  - Protección de rutas protegidas
  - Validación de sesiones
  - Redirección automática a login
  - Protección de APIs

### Autorización Basada en Roles (RBAC)
- **3 Roles Definidos:**
  - `admin` - Acceso completo
  - `emprendedores` - Crear/editar vehículos, registrar ventas
  - `usuarios_regulares` - Solo lectura

- **Permisos Granulares:**
  - Gestión de usuarios
  - CRUD de vehículos
  - Gestión de ventas
  - Acceso a dashboard y reportes
  - Configuración del sistema

### Protección de APIs
- Todas las APIs requieren autenticación (excepto públicas)
- Validación de roles en endpoints administrativos
- Manejo de errores de autorización

### Seguridad de Base de Datos
- Prepared statements (Prisma)
- Validación de tipos
- Relaciones con cascada controlada

### Verificación de Email
- **MailerSend API** - Servicio de email para verificación
- **Templates HTML** - Emails personalizados con colores de la app
- **Validación de IP** - Rate limiting (3 registros/hora por IP)
- **Tokens de verificación** - Expiración en 24 horas, uso único
- **Flujo completo**: Registro → Email → Verificación → Activación

## Verificación de Email con MailerSend

### Configuración

1. **Crear cuenta en MailerSend:**
   - Ve a https://www.mailersend.com
   - Plan gratuito: 12,000 emails/mes
   - Obtén tu API Token en Settings → API Tokens
   - Permisos: "Sending access" (suficiente para enviar emails)

2. **Variables de entorno requeridas:**
```env
MAILERSEND_API_TOKEN=mlsn.xxxxxxxxxxxxx
MAILERSEND_FROM_EMAIL=noreply@tudominio.com
MAILERSEND_FROM_NAME=Nocturna Genesis
APP_URL=http://localhost:3000
```

3. **Flujo de verificación:**
   - Usuario se registra en `/register`
   - Sistema captura IP y valida rate limiting
   - Se crea usuario con estado `pending_verification`
   - Se envía email con token de verificación
   - Usuario hace clic en link → `/verify-email?token=XXX`
   - Cuenta se activa y puede hacer login

### SMTP vs API (MailerSend)

**Recomendación: API REST**

**Ventajas de API:**
- Tracking de emails (saber si se abrió/hizo clic)
- Estadísticas en tiempo real
- Webhooks para eventos
- Templates dinámicos
- Mejor manejo de errores

**SMTP solo si:**
- Proyecto muy simple
- No necesitas tracking
- Migración rápida desde otro SMTP

## Base de Datos: Tablas y Tokens

### Tablas Implementadas
- `users` - Usuarios con campos de verificación
- `vehicles` - Vehículos en inventario
- `vehicle_images` - Imágenes BLOB de vehículos (BYTEA en PostgreSQL)
- `sales` - Ventas registradas (con invoiceNumber, taxAmount, totalAmount, status)
- `email_verifications` - Tokens de verificación de email

**Relaciones:**
- `Vehicle` → `VehicleImage` (1:N, CASCADE delete)
- `Vehicle` → `Sale` (1:N, CASCADE delete)
- `User` → `Vehicle` (1:N, CASCADE delete)
- `User` → `Sale` (1:N, CASCADE delete)

### ¿Por qué no hay tabla para tokens de sesión?

**NextAuth v5 usa JWT (JSON Web Tokens):**
- Los tokens se almacenan en cookies HTTP-only del navegador
- Firmados criptográficamente con `AUTH_SECRET`
- No se almacenan en la base de datos (stateless)
- Más rápido y escalable

**Ventajas:**
- No requiere consultas a BD para validar sesión
- Funciona con múltiples servidores
- Más seguro (cookies HTTP-only)

**Desventajas:**
- No puedes revocar sesiones individuales
- No puedes ver sesiones activas desde la BD

**Para revocar sesiones individuales:** Necesitarías cambiar a Database Sessions (requiere tablas `Account`, `Session`, `VerificationToken`).

### Tablas Adicionales Opcionales

Las siguientes tablas son opcionales y solo se necesitan si implementas esas funcionalidades:

| Tabla | Cuándo se necesita | Prioridad |
|-------|-------------------|-----------|
| `EmailVerification` | Verificación de email | ✅ Implementada |
| `PasswordReset` | Recuperación de contraseña | Opcional |
| `LoginAttempt` | Rate limiting avanzado | Opcional |
| `AuditLog` | Auditoría completa | Opcional |

**Conclusión:** Implementa solo las tablas que realmente vayas a usar. Las 4 tablas actuales son suficientes para la funcionalidad básica.

### Generar AUTH_SECRET

```bash
openssl rand -base64 32
```

**Nota importante:** `AUTH_SECRET` se usa para firmar tokens JWT, NO para revocar sesiones individuales. Para revocar sesiones individuales necesitas Database Sessions.

## CI/CD con GitHub Actions

Este repositorio incluye un pipeline de CI/CD automatizado que se ejecuta en las ramas `main` y `development`.

### Configuración de Secrets

Para que el pipeline funcione correctamente, configura los siguientes secrets en tu repositorio de GitHub:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Agrega los siguientes secrets:

#### Secrets Requeridos (Opcionales para CI básico)

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
  - Formato: `postgresql://user:password@host:port/database`
  - Nota: El workflow funcionará sin este secret usando valores por defecto para el build

- `AUTH_SECRET`: Secret key para NextAuth
  - Genera uno seguro: `openssl rand -base64 32`
  - Nota: El workflow funcionará sin este secret usando valores por defecto para el build

- `NEXTAUTH_URL`: URL base de tu aplicación
  - Ejemplo: `https://tu-dominio.com`
  - Nota: El workflow funcionará sin este secret usando valores por defecto

#### Secrets Opcionales

- `CODECOV_TOKEN`: Token para subir reportes de cobertura a Codecov
  - Solo necesario si quieres usar Codecov para tracking de cobertura
  - Obtén tu token en: https://codecov.io

### Workflow Jobs

El pipeline incluye tres jobs principales que se ejecutan en paralelo (excepto build que espera a los otros):

#### 1. Lint & Type Check
- Ejecuta ESLint para verificar la calidad del código
- Ejecuta TypeScript type checking
- Tiempo máximo: 10 minutos

#### 2. Run Tests
- Ejecuta todos los tests con Jest
- Genera reportes de cobertura
- Sube reportes a Codecov (si está configurado)
- Tiempo máximo: 15 minutos

#### 3. Build Application
- Genera el build de producción de Next.js
- Verifica que los artefactos se generen correctamente
- Solo se ejecuta si los jobs anteriores pasan
- Tiempo máximo: 15 minutos

### Triggers

El workflow se ejecuta automáticamente cuando:
- Se hace push a las ramas `main` o `development`
- Se crea o actualiza un Pull Request hacia `main` o `development`

### Cache

El workflow utiliza cache para optimizar el tiempo de ejecución:
- **npm cache**: Cachea las dependencias de npm
- **Prisma cache**: Cachea el Prisma Client generado

### Troubleshooting del CI/CD

#### El build falla con errores de variables de entorno
- Verifica que los secrets estén configurados correctamente
- Revisa los logs del job "Build Application" para ver qué variable falta

#### Los tests fallan
- Verifica que todas las dependencias estén instaladas
- Revisa que los mocks y helpers de test estén correctamente configurados

#### El lint falla
- Ejecuta `npm run lint` localmente para ver los errores
- Corrige los errores antes de hacer push

### Mejores Prácticas para CI/CD

1. **Siempre ejecuta los checks localmente antes de hacer push:**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

2. **No commitees cambios que rompan el build:**
   - El pipeline bloqueará los PRs si el build falla

3. **Mantén los tests actualizados:**
   - Agrega tests para nuevas funcionalidades
   - Mantén la cobertura de código alta

4. **Revisa los logs del workflow:**
   - Si un job falla, revisa los logs detallados en GitHub Actions

### Estructura del Workflow

```
┌─────────────────────┐
│  Lint & Type Check  │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
┌──────────▼──────────┐     │
│    Run Tests        │     │
└──────────┬──────────┘     │
           │                 │
           └────────┬────────┘
                    │
         ┌──────────▼──────────┐
         │  Build Application  │
         └────────────────────┘
```

## 🚀 Despliegue en la Nube (Unidad 4)

Este proyecto incluye **infraestructura completa de despliegue en la nube** con:

- ✅ **Servidor de aplicaciones**: Múltiples instancias de Next.js (app1, app2, app3)
- ✅ **Servidor de base de datos**: PostgreSQL 15 con persistencia
- ✅ **Balanceo de cargas**: Nginx Load Balancer con algoritmo `least_conn`
- ✅ **Configuración de dominio**: Guía completa paso a paso
- ✅ **Certificados SSL/TLS**: Let's Encrypt (gratis) y más opciones

### 📚 Documentación

- **[PENDING-TASKS.md](./PENDING-TASKS.md)** - Tareas pendientes, guía de despliegue, dominio y certificados SSL

### Despliegue Rápido

```bash
# 1. Configurar variables de entorno
cp .env.prod.example .env.prod
nano .env.prod

# 2. Desplegar
./scripts/deploy-prod.sh

# 3. Inicializar base de datos (crear tablas)
./scripts/init-database.sh

# 4. Verificar
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
```

**⚠️ Importante**: 
- Después de reiniciar Docker, ejecuta `./scripts/init-database.sh` para crear las tablas si no existen.
- Para crear usuarios de prueba, ejecuta: `docker exec nocturna-app-1 npx tsx prisma/seed.ts`

### Estado del Proyecto

**Progreso**: 93% Completado ✅

- ✅ Contenedor Docker con aplicación desplegada
- ✅ Servidor de aplicaciones (3 instancias)
- ✅ Servidor de base de datos (PostgreSQL)
- ✅ Balanceo de cargas (Nginx) - **Verificado funcionando**
- ⏳ Configuración de dominio (documentación lista)
- ⏳ Certificados SSL/TLS (documentación lista)

Ver [PENDING-TASKS.md](./PENDING-TASKS.md) para completar el 7% restante.

## Docker - Despliegue con Contenedores

Este proyecto incluye configuración completa de Docker para desarrollo y producción.

### Requisitos Previos

- Docker Desktop instalado y corriendo
- Docker Compose v2 o superior

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# PostgreSQL
POSTGRES_PASSWORD=password
POSTGRES_DB=nocturna_genesis
POSTGRES_PORT=5432

# Aplicación
APP_PORT=3000

# NextAuth (genera uno seguro: openssl rand -base64 32)
AUTH_SECRET=tu-secret-key-super-segura-cambiar-en-produccion
NEXTAUTH_URL=http://localhost:3000

# App URL
APP_URL=http://localhost:3000

# MailerSend (opcional)
MAILERSEND_API_TOKEN=
MAILERSEND_FROM_EMAIL=
MAILERSEND_FROM_NAME=Nocturna Genesis

# APIs externas (opcional)
OPENWEATHER_API_KEY=
```

**Nota importante:** NO incluyas `DATABASE_URL` en el `.env` para Docker. `docker-compose.yml` la construye automáticamente usando las variables `POSTGRES_*`.

### Comandos Principales

```bash
# Construir y levantar (primera vez)
docker-compose up --build

# Levantar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose down -v
```

### Inicialización de Base de Datos

```bash
# Sincronizar schema (primera vez)
docker-compose exec app npx prisma db push

# Aplicar migraciones (si usas migraciones)
docker-compose exec app npx prisma migrate deploy

# Poblar con datos de ejemplo (opcional)
docker-compose exec app npm run db:seed
```

### Acceso a la Aplicación

- **Aplicación**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Base de datos**: localhost:5432
  - Usuario: `postgres`
  - Password: (configurado en `POSTGRES_PASSWORD`)
  - Database: `nocturna_genesis`

### Solución de Problemas

**Puerto ocupado:**
- Cambia `APP_PORT` o `POSTGRES_PORT` en `.env` si los puertos están en uso

**Error de conexión a BD:**
```bash
# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs db
```

**Reconstruir desde cero:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Estructura de Contenedores

- **nocturna-db**: PostgreSQL 15 con persistencia de datos
- **nocturna-app**: Next.js en modo producción con health checks

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## Licencia

Este proyecto es parte del curso de desarrollo web.

---

Desarrollado con Next.js y TypeScript
