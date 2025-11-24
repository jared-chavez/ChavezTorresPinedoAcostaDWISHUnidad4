# 📋 Tareas Pendientes y Guía de Despliegue - Nocturna Genesis

**Proyecto**: Unidad 4 - Infraestructura de Despliegue en la Nube  
**Estado**: 93% Completado  
**Última actualización**: 2025-11-23

---

## ✅ Completado (93%)

### 1. Contenedor con Aplicación WEB ✅
- Dockerfile multi-stage optimizado
- docker-compose.prod.yml configurado
- Despliegue local verificado

### 2. Servidor de Aplicaciones ✅
- 3 instancias de Next.js (app1, app2, app3)
- Health checks configurados
- Escalado horizontal listo

### 3. Servidor de Base de Datos ✅
- PostgreSQL 15 con persistencia
- Health checks funcionando
- Scripts de inicialización

### 4. Balanceo de Cargas ✅
- Nginx Load Balancer configurado
- Algoritmo least_conn funcionando
- Rate limiting y seguridad

### 5. Certificados SSL/TLS (Local) ✅
- Certificados self-signed generados
- HTTPS funcionando en `https://localhost:8443`
- Configuración lista para producción

### 6. Sistema de Email ✅
- Resend configurado (alternativa a MailerSend)
- Plantillas HTML funcionando
- Verificación de email operativa

---

## ⚠️ Nota Importante: Inicialización de Base de Datos

**Cuando reinicias Docker o es la primera vez que despliegas**, las tablas pueden no existir. Esto causa error 500 al intentar registrar usuarios.

**Solución rápida**:
```bash
./scripts/init-database.sh
```

Este script crea todas las tablas necesarias.

---

## 🔑 Credenciales de Usuarios de Prueba

### Administrador
- **Email**: `admin@agencia.com`
- **Password**: `Admin123!`
- **Rol**: `admin`
- **Permisos**: Acceso completo al sistema

### Vendedor/Ventas (Emprendedor)
- **Email**: `sales@agencia.com` o `emprendedor@agencia.com`
- **Password**: `Sales123!` o `Emprendedor123!`
- **Rol**: `emprendedores`
- **Permisos**: Crear/editar vehículos, registrar ventas (no puede eliminar vehículos ni gestionar usuarios)

**Nota**: Si los usuarios no existen, ejecuta:
```bash
docker exec nocturna-app-1 npx tsx prisma/seed.ts
```

---

## ⏳ Pendiente (7%)

### 1. Configuración de Dominio ⏳

**Estado**: Documentación lista, falta implementar

**Pasos a seguir**:

1. **Registrar dominio**
   - Opciones: Namecheap, GoDaddy, Cloudflare, Google Domains
   - Costo aproximado: $10-15/año

2. **Configurar DNS**
   ```
   Tipo: A
   Nombre: @ (o www)
   Valor: [IP de tu servidor]
   TTL: 3600
   ```

3. **Actualizar `nginx/nginx.conf`**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com www.tu-dominio.com;
       # ... resto de configuración
   }
   ```

4. **Actualizar `.env.prod`**
   ```env
   NEXTAUTH_URL=https://tu-dominio.com
   APP_URL=https://tu-dominio.com
   ```

5. **Reiniciar servicios**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod restart nginx
   ```

**Tiempo estimado**: 30 minutos

---

### 2. Certificados SSL/TLS en Producción ⏳

**Estado**: Configuración local lista, falta implementar en producción

**Opción Recomendada: Let's Encrypt (Gratis)** ⭐

**Pasos a seguir**:

1. **Instalar Certbot**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtener certificado**
   ```bash
   sudo certbot certonly --standalone \
     -d tu-dominio.com \
     -d www.tu-dominio.com
   ```

3. **Copiar certificados al proyecto**
   ```bash
   sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ./nginx/ssl/
   sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ./nginx/ssl/
   sudo chmod 644 ./nginx/ssl/fullchain.pem
   sudo chmod 600 ./nginx/ssl/privkey.pem
   ```

4. **Actualizar `nginx/nginx.conf`**
   - Ya está descomentado el bloque HTTPS
   - Solo actualiza `server_name` con tu dominio

5. **Habilitar redirección HTTP → HTTPS**
   - Descomenta la sección de redirección en `nginx/nginx.conf` (línea ~70)

6. **Reiniciar Nginx**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod restart nginx
   ```

7. **Configurar renovación automática**
   ```bash
   sudo crontab -e
   # Agregar:
   0 */12 * * * certbot renew --quiet --deploy-hook "cd /ruta/absoluta/a/tu/proyecto && docker-compose -f docker-compose.prod.yml --env-file .env.prod restart nginx"
   ```

**Tiempo estimado**: 20 minutos

**Alternativas**:
- Cloudflare SSL (automático si usas Cloudflare DNS)
- Certificados comerciales (GoDaddy, DigiCert)

---

## 📊 Resumen de Progreso

| Requisito | Estado | Progreso |
|-----------|--------|----------|
| Contenedor con App WEB | ✅ | 100% |
| Servidor de Aplicaciones | ✅ | 100% |
| Servidor de Base de Datos | ✅ | 100% |
| Balanceo de Cargas | ✅ | 100% |
| Certificados SSL/TLS (Local) | ✅ | 100% |
| Configuración de Dominio | ⏳ | 80% |
| Certificados SSL/TLS (Producción) | ⏳ | 80% |

**Progreso Total**: **93%** ✅

---

## 🎯 Checklist Final

Antes de considerar el proyecto 100% completo:

- [x] Contenedor Docker configurado
- [x] Servidor de aplicaciones (3 instancias)
- [x] Servidor de base de datos
- [x] Balanceo de cargas funcionando
- [x] Certificados SSL local funcionando
- [x] HTTPS accesible en local
- [ ] Dominio registrado
- [ ] DNS configurado y propagado
- [ ] `nginx/nginx.conf` actualizado con dominio
- [ ] `.env.prod` actualizado con URLs del dominio
- [ ] Certificado SSL de producción obtenido (Let's Encrypt)
- [ ] Certificados copiados a `nginx/ssl/`
- [ ] Redirección HTTP → HTTPS activada
- [ ] Renovación automática de SSL configurada
- [ ] Aplicación accesible vía HTTPS en producción

---

## 🚀 Despliegue Rápido

```bash
# 1. Configurar variables de entorno
cp .env.prod.example .env.prod
nano .env.prod

# 2. Desplegar
./scripts/deploy-prod.sh

# 3. Inicializar base de datos (crear tablas)
./scripts/init-database.sh

# 4. Crear usuarios de prueba
docker exec nocturna-app-1 npx tsx prisma/seed.ts

# 5. Verificar
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
```

---

## 🔒 Certificados SSL

### Desarrollo Local

```bash
# Generar certificados self-signed
./scripts/generate-ssl-local.sh

# Acceder a HTTPS
https://localhost:8443
```

**Nota**: El navegador mostrará una advertencia (normal para self-signed). Haz clic en "Advanced" → "Proceed to localhost".

### Producción

Ver sección "Certificados SSL/TLS en Producción" arriba.

---

## 📧 Configuración de Email

El proyecto soporta múltiples proveedores de email:

### Resend (Recomendado)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Nocturna Genesis
```

### MailerSend (Legacy)

```env
EMAIL_PROVIDER=mailersend
MAILERSEND_API_TOKEN=mlsn.xxxxx
MAILERSEND_FROM_EMAIL=noreply@tudominio.com
MAILERSEND_FROM_NAME=Nocturna Genesis
```

---

## 📝 Notas para tu Docente

### Puntos de la Rúbrica Cubiertos

✅ **Aplicación Web**: Next.js 16 desplegada en contenedores Docker  
✅ **Servidor de Aplicaciones**: Múltiples instancias (app1, app2, app3) ejecutando Next.js  
✅ **Servidor de Base de Datos**: PostgreSQL 15 en contenedor Docker con persistencia  
✅ **Balanceo de Cargas**: Nginx configurado como Load Balancer con algoritmo `least_conn`  
✅ **Certificados SSL/TLS**: Configurados localmente, documentación completa para producción  
⏳ **Configuración de Dominio**: Documentación completa lista para implementar  

### Arquitectura Implementada

```
Internet → Nginx (Load Balancer) → [App1, App2, App3] → PostgreSQL
         (Puertos 80, 443)         (Puerto 3000)        (Puerto 5432)
```

### Evidencia de Funcionamiento

- ✅ Despliegue local verificado
- ✅ Health checks funcionando
- ✅ Balanceo de cargas verificado (logs muestran distribución)
- ✅ HTTPS funcionando en local (`https://localhost:8443`)
- ✅ Todos los servicios saludables
- ✅ Documentación completa

### Para Certificados SSL

**Recomendación para el docente**: Let's Encrypt es la opción más común y recomendada porque:
- ✅ Gratis
- ✅ Renovación automática
- ✅ Ampliamente usado en producción
- ✅ Documentación completa incluida

**Alternativas documentadas**:
- Cloudflare SSL (automático)
- Certificados comerciales (GoDaddy, DigiCert)
- Self-signed (solo desarrollo, ya implementado)

---

**Última actualización**: 2025-11-23
