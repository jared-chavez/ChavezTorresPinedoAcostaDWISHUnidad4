# Tests de API Endpoints

Este directorio contiene los tests unitarios para todos los endpoints de la API.

## Estructura de Tests

### Tests Existentes

1. **auth.register.test.ts** - Tests de registro de usuarios
2. **checkout.test.ts** - Tests de proceso de checkout
3. **health.test.ts** - Tests de health check (monitoreo)
4. **sales.test.ts** - Tests de gestión de ventas
5. **stats.test.ts** - Tests de estadísticas del dashboard
6. **users.test.ts** - Tests de gestión de usuarios
7. **vehicles.test.ts** - Tests de CRUD de vehículos
8. **vehicles.id.test.ts** - Tests de endpoints específicos de vehículos por ID

## Cobertura de Monitoreo

### Health Check Endpoint

El endpoint `/api/health` es crítico para el monitoreo de la infraestructura de despliegue. Los tests en `health.test.ts` verifican:

- ✅ Estado healthy cuando la BD está conectada
- ✅ Estado unhealthy cuando la BD falla
- ✅ Manejo de errores desconocidos
- ✅ Inclusión de timestamps
- ✅ Acceso público (sin autenticación)

Este endpoint es usado por:
- Docker health checks
- Nginx load balancer
- Sistemas de monitoreo (Prometheus, etc.)

## Ejecutar Tests

```bash
# Todos los tests
npm test

# Test específico
npm test -- health.test.ts

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## Agregar Nuevos Tests

Al agregar nuevos endpoints, asegúrate de:

1. Crear archivo de test correspondiente
2. Probar casos de éxito y error
3. Verificar autenticación y autorización
4. Validar datos de entrada
5. Actualizar TEST-COVERAGE.md

## Mejores Prácticas

- Usar mocks para dependencias externas
- Aislar cada test (no dependencias entre tests)
- Probar casos límite
- Verificar códigos de estado HTTP correctos
- Validar estructura de respuestas JSON

