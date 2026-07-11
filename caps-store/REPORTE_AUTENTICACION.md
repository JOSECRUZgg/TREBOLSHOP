# Reporte Técnico: Implementación de Autenticación y Autorización de Usuarios

## 1. Mecanismos de Autentificación de Usuario

El sistema hace uso de **NextAuth.js (Auth.js)** en conjunto con **Prisma ORM** para manejar de forma segura la autenticación. Se implementaron los siguientes mecanismos:

- **Nombre de usuario o correo electrónico y Contraseña:** Se implementó un proveedor de Credenciales (`Credentials Provider`). Los usuarios proporcionan su correo electrónico y su contraseña para validar el acceso contrastándolo contra la base de datos (Modelo `User`).
- **Token:** Para el manejo de sesiones y persistencia, se utilizan **JSON Web Tokens (JWT)**. Al iniciar sesión, el sistema cifra un token que contiene la identidad del usuario, su rol (`role`) y sus preferencias. Este token es validado en cada petición a través del `Middleware` de Next.js.
- **Múltiples factores (MFA) / Proveedores Externos:** El sistema integra el proveedor de identidad de Google (OAuth). Esto no solo facilita el inicio de sesión (`Single Sign-On`), sino que delega la responsabilidad de los esquemas avanzados de seguridad de múltiples factores de autenticación (2FA / MFA) a Google si el usuario lo tiene activado en su cuenta personal.

---

## 2. Esquema de Configuración de Opciones de Usuario

El modelo de base de datos define diversas opciones de perfil diseñadas para la plataforma (Caps Store). Estas preferencias se extraen y se integran dentro de la sesión de NextAuth para personalizar la experiencia en tiempo real, guardando los siguientes datos de usuario:

- **Configuración Básica:** `name`, `email`, `image` (avatar).
- **Rol de Usuario:** Atributo `role` para delegar niveles (Administrador, Cliente, Empleado).
- **Opciones de Configuración Específicas del Usuario:**
  - `favoriteStyle`: Estilo preferido (ej. Snapback, Trucker).
  - `headSize`: Talla de cabeza y estructura (ej. 7 1/4 (L)).
  - `favoriteMaterial`: Material de preferencia en los productos.
- **Gestión de Direcciones (`Address`):** Permite al usuario gestionar ubicaciones de envío con una marcada como principal (`isDefault`).

---

## 3. Ajustes en la Navegación y Contenido de Acuerdo al Rol de Usuario

Dependiendo del rol (`role`) extraíble de la sesión del usuario, la navegación del sitio y los contenidos se ajustan dinámicamente:
1. **Usuarios No Autenticados (Invitados):** Navegación libre por el catálogo público. Redirección automática a de vuelta al `/login` al intentar visitar la pantalla de pago (`/checkout`) o pantallas protegidas.
2. **Usuarios Autenticados (Clientes):** Obtienen permiso en la plataforma para realizar compras, guardar configuraciones y acceder al Checkout.
3. **Usuarios con Rol Administrador (`ADMIN`):** Exclusividad en vistas operativas. Solo ellos tienen el ajuste en navegación para acceder internamente a rutas y gestores del sistema (`/admin/stock`, `/admin/orders`), ajustando adicionalmente los menús del encabezado del sitio (Header) para mostrar botones de "Panel" o "Dashboard".

---

## 4. EVIDENCIA: Justificación y Script de Autenticación por Tipo de Usuario

### Justificación:
La protección y discriminación visual por "Tipo de Usuario" (Roles) se encuentra ejecutándose desde la capa más alta de la aplicación usando el **Middleware de Next.js** protegido por las reglas de NextAuth (`config.ts`). De este modo, la segregación de usuarios es evaluada analizando el parámetro `auth.user.role` embebido en el token de sesión. Si el rol no cumple (por ejemplo intentando invadir el panel `/admin`), el Middleware impide el renderizado de la página, cortando el acceso sin gastar procesamiento del lado del cliente. 

### Script Empleado (Evidencia en Código)
El siguiente extracto es el responsable de dictaminar y aplicar las reglas del "ajuste de navegación" dependiendo directamente del tipo de usuario logueado en la aplicación, extraído del archivo oficial `lib/auth.config.ts`:

```typescript
// Archivo fuente: lib/auth.config.ts
export const authConfig = {
    pages: {
        signIn: '/login', // Redirección estándar de autenticación
    },
    callbacks: {
        // Interceptor Middleware que determina el acceso al usuario y evalúa Roles
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout')

            // -> EVIDENCIA: Filtro por tipo de usuario (Administrador)
            if (isOnAdmin) {
                // Solo permite el acceso al menú de configuración si el ROL validado es 'ADMIN'
                if (isLoggedIn && auth.user.role === 'ADMIN') return true
                return false // De lo contrario bloquea el acceso a la navegación administrativa
            }

            // -> EVIDENCIA: Flujo para un tipo de usuario estándar
            if (isOnCheckout) {
                // Permite navegar a finalizar la compra si su identidad en sesión es válida
                if (isLoggedIn) return true
                return false
            }

            return true
        },
        
        // Asignación de credenciales al ecosistema de navegación y sesión (Token JWT)
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role // Se inserta el tipo de usuario (ADMIN, CUSTOMER)
            }
            return token
        }
    },
    providers: [
        Google({ ... }), // MFA proporcionado por Google de modo integrado
        Credentials({ ... }) // Login local
    ],
} satisfies NextAuthConfig
```
