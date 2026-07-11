# Trebol Shop - E-Commerce de Gorras

Tienda en linea de gorras developed with Next.js 16, TypeScript, Prisma, Supabase PostgreSQL, and NextAuth v5. Proyecto universitario de Desarrollo Web Profesional (UT).

**Demo:** [https://trebolshop.vercel.app](https://trebolshop.vercel.app)

---

## Tabla de contenidos

- [Caracteristicas](#caracteristicas)
- [Stack tecnologico](#stack-tecnologico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Configuracion local](#configuracion-local)
- [Variables de entorno](#variables-de-entorno)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Optimizaciones de rendimiento](#optimizaciones-de-rendimiento)
- [Seguridad](#seguridad)
- [Autor](#autor)

---

## Caracteristicas

### Tienda Publica
- Catalogo de gorras con filtros por calidad, estilo, material, categoria, audiencia y precio
- Busqueda de productos en tiempo real
- Vista de cuadricula y lista
- Paginacion de productos
- Detalle de producto con imagenes
- Carrito de compras con persistencia (Zustand + localStorage)
- Checkout con pasarela de pago Clip
- Perfil de usuario con preferencias de estilo (talla, material favorito)
- Sistema de recuperacion de contrasena por email

### Panel de Administracion (`/admin`)
- Dashboard con estadisticas de ventas e ingresos
- CRUD completo de productos (crear, editar, eliminar, subir imagenes)
- Gestion de inventario con actualizacion de stock
- Gestion de pedidos (pendientes, completados, cancelados)
- Reportes de ventas con graficas
- CRUD de trabajadores/empleados
- Gestion de atributos (calidad, estilo, material, categoria) con seed por defecto

### Punto de Venta (`/pos`)
- Interfaz de venta rapida para empleados
- Protegida por autenticacion (solo ADMIN y EMPLOYEE)
- Seleccion de metodo de pago (efectivo, tarjeta, en linea)

### Seguridad
- Autenticacion con NextAuth v5 (Credentials + Google OAuth)
- Proteccion de rutas con `requireAdmin()` y `requireAuth()`
- Correccion de vulnerabilidad IDOR en acciones del servidor
- Rate limiting en uploads (5MB max, whitelist MIME types)
- Sanitizacion de nombres de archivo
- Contrasenas hasheadas con bcrypt
- Mensajes genericos de error (sin enumeracion de emails)

---

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase PostgreSQL |
| ORM | Prisma 6.19 |
| Autenticacion | NextAuth v5 (Auth.js) |
| State management | Zustand (carrito) |
| Estilos | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| Animaciones | Framer Motion |
| Validacion | Zod |
| Deploy | Vercel |
| Pagos | Clip API |

---

## Estructura del proyecto

```
caps-store/
├── app/
│   ├── about/              # Pagina "Quienes somos"
│   ├── admin/
│   │   ├── layout.tsx      # Layout admin con check de sesion
│   │   ├── orders/         # Gestion de pedidos
│   │   ├── products/
│   │   │   ├── page.tsx    # Lista de productos
│   │   │   ├── new/        # Crear producto
│   │   │   └── [id]/edit/  # Editar producto
│   │   ├── stock/          # Gestion de inventario
│   │   ├── workers/
│   │   │   ├── page.tsx    # Lista de trabajadores
│   │   │   ├── new/        # Crear trabajador
│   │   │   └── [id]/       # Ver/editar trabajador
│   │   └── page.tsx        # Dashboard admin
│   ├── api/
│   │   └── auth/[...nextauth]/  # NextAuth API route
│   ├── checkout/           # Pasarela de pago Clip
│   ├── forgot-password/    # Recuperacion de contrasena
│   ├── login/              # Inicio de sesion
│   ├── pos/                # Punto de venta (empleados)
│   ├── profile/            # Perfil de usuario
│   ├── register/           # Registro de usuario
│   ├── reset-password/     # Reset de contrasena
│   ├── layout.tsx          # Layout raiz
│   └── page.tsx            # Pagina principal (catalogo)
├── components/
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── footer.tsx
│   ├── product-card.tsx
│   └── inactivity-logout.tsx
├── hooks/
│   └── use-cart.ts         # Zustand carrito con sync al servidor
├── lib/
│   ├── actions.ts          # Server actions (productos, ventas, auth)
│   ├── auth.ts             # Configuracion NextAuth + helpers
│   ├── auth.config.ts      # Config edge-compatible
│   ├── prisma.ts           # Singleton de Prisma
│   ├── password-actions.ts # Acciones de contrasena
│   ├── worker-actions.ts   # CRUD de trabajadores
│   └── attribute-actions.ts# CRUD de atributos
├── prisma/
│   ├── schema.prisma       # Schema de la base de datos
│   └── seed.ts             # Datos iniciales (productos + admin)
└── public/
    ├── products/           # Imagenes de productos
    └── placeholder.jpg     # Imagen por defecto
```

---

## Modelo de datos

```
User ──┬── Sale (ventas realizadas)
       ├── Address (direcciones de envio)
       ├── Account (OAuth providers)
       └── Session (sesiones activas)

Product ──┬── Quality (calidad)
          ├── Style (estilo)
          ├── Material (material)
          ├── Category (categoria)
          └── SaleItem (items de venta)

Sale ─────┬── SaleItem (items de la venta)
          ├── Employee (empleado que vendio)
          └── User (cliente)

Employee ──── Sale (ventas atendidas)
```

### Roles de usuario
- **ADMIN**: Acceso total al panel de administracion
- **EMPLOYEE**: Acceso al punto de venta (`/pos`)
- **CUSTOMER**: Compras, perfil, carrito

---

## Configuracion local

### Requisitos previos
- Node.js 18+ (recomendado: 20+)
- npm o yarn
- Cuenta en [Supabase](https://supabase.com) (para la base de datos)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/JOSECRUZgg/TREBOLSHOP.git
cd TREBOLSHOP/caps-store
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` (o crea uno) con tus credenciales:
```bash
# Ver seccion "Variables de entorno" mas abajo
```

4. **Generar el cliente de Prisma**
```bash
npx prisma generate
```

5. **Sincronizar la base de datos**
```bash
npx prisma db push
```

6. **Sembrar datos iniciales**
```bash
npx tsx prisma/seed.ts
```

7. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

El proyecto estara disponible en `http://localhost:3001`

---

## Variables de entorno

Crea un archivo `.env` en la raiz de `caps-store/`:

```env
# Base de datos Supabase
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="[genera-con-openssl-rand-base64-32]"
AUTH_SECRET="[mismo-valor-que-NEXTAUTH_SECRET]"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Clip Payments (opcional)
CLIP_API_KEY="tu-api-key"
CLIP_SECRET_KEY="tu-secret-key"
CLIP_BASE_URL="https://api.payclip.com/v2"
```

> **Nota:** `DATABASE_URL` usa el pooler (puerto 6543) para conexiones normales. `DIRECT_URL` usa la sesion directa (puerto 5432) para migraciones de Prisma.

---

## Credenciales de prueba

| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| admin@gorras.com | Admin123 | ADMIN |
| admin@trebol.com | Admin123 | ADMIN |

Para crear un usuario EMPLOYEE, registrar desde el panel de admin en `/admin/workers/new`.

---

## Despliegue en Vercel

### Paso 1: Subir a GitHub
```bash
git add .
git commit -m "feat: ready for deploy"
git push origin main
```

### Paso 2: Crear proyecto en Vercel
1. Ir a [vercel.com](https://vercel.com) y conectar tu cuenta de GitHub
2. Click en **"Add New Project"**
3. Seleccionar el repositorio `JOSECRUZgg/TREBOLSHOP`
4. En **Root Directory**, colocar: `caps-store`
5. Vercel detecta Next.js automaticamente
6. Click **Deploy**

### Paso 3: Configurar variables de entorno
En el dashboard de Vercel → Settings → Environment Variables, agregar todas las variables del `.env` con estos cambios:

| Variable | Valor para produccion |
|----------|----------------------|
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |
| `NEXTAUTH_SECRET` | Generar uno nuevo: `openssl rand -base64 32` |
| `AUTH_SECRET` | Mismo valor que `NEXTAUTH_SECRET` |
| `DATABASE_URL` | Igual (Supabase pooler) |
| `DIRECT_URL` | Igual (Supabase session) |

### Paso 4: Redesplegar
Despues de configurar las variables, ir a **Deployments** → click en los tres puntos del ultimo deploy → **Redeploy**.

### Limitaciones en produccion
- Las imagenes subidas desde el admin (`/api/upload`) no persistiran porque Vercel usa filesystem efimero en serverless. Las imagenes que vienen en el repo si se despliegan.
- Para imagenes dinamicas en produccion, considerar migrar a Cloudinary, Supabase Storage o S3.

---

## Optimizaciones de rendimiento

| Area | Antes | Despues | Impacto |
|------|-------|---------|---------|
| `getProducts()` | Cargaba todos los productos | Paginado (20 por pagina) | ~70% menos datos |
| `getOrders()` | `findMany` sin limite | Paginado + busqueda case-insensitive | Memoria reducida |
| `getAdminStats()` | 7 queries secuenciales | `aggregate` + `Promise.all` | ~7x mas rapido |
| `getReportStats()` | `findMany` + reduce en JS | `aggregate` en base de datos | CPU en DB, no en servidor |
| `createSale()` | N queries individuales | Batch `findMany({in:})` | 15 queries → 4 |
| Carrito (cart sync) | Sync inmediato en cada accion | Debounce 800ms | Menos writes al servidor |
| `InactivityLogout` | `mousemove` 60 calls/sec | Throttle 1 call/sec | 98% menos eventos |
| Perfil de usuario | 4 queries secuenciales | `Promise.all` | ~4x mas rapido |
| Admin orders | Cargaba todos los productos al montar | Lazy load al abrir modal | Menos datos iniciales |
| `getUserOrders()` | Sin limite | Limit 50 ordenes | Memoria acotada |

---

## Seguridad

- **Autenticacion:** NextAuth v5 con JWT (24h de expiracion) + Prisma Adapter
- **Autorizacion:** Helpers `requireAdmin()` y `requireAuth()` en server actions
- **IDOR fix:** `createSale`, `createPendingOrder` y `updateUserPreferences` validan el usuario de la sesion
- **Contrasenas:** bcrypt con 10 rounds, min 8 caracteres + mayuscula + numero
- **Uploads:** Max 5MB, MIME whitelist (jpg/png/webp/gif), sanitizacion de nombres
- **Passwords endpoint:** Respuestas genericas (sin revelar si el email existe)
- **Cookies:** `httpOnly`, `sameSite: lax`, `secure` en produccion

---

## Autor

**Jose Cruz** - Estudiante de Desarrollo Web Profesional (UT, 8vo Cuatrimestre)

- GitHub: [JOSECRUZgg](https://github.com/JOSECRUZgg)
- Repositorio: [TREBOLSHOP](https://github.com/JOSECRUZgg/TREBOLSHOP)

---

## Licencia

Proyecto universitario - UT (Universidad Tecnologica)
