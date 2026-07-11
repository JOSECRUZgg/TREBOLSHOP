# Reporte Técnico: Operaciones de Administración de Base de Datos

## 1. Copias de Seguridad y Restauración

En el proyecto **Caps Store**, la base de datos se gestiona a través de **Prisma ORM** con un motor de base de datos relacional (configurado para usar SQLite en desarrollo local, escalable a PostgreSQL en producción). Esto permite tener un control granular sobre las metodologías administrativas.

### a. Automatización de copias de seguridad
Para asegurar la integridad de la información, las copias de seguridad se pueden automatizar mediante scripts ejecutados por el programador de tareas del sistema operativo (Cron jobs en Linux o Task Scheduler en Windows) u orquestadores como GitHub Actions. 
Ejemplo de automatización con un script Bash que puede integrarse al `cron`:
```bash
0 2 * * * /usr/bin/sqlite3 /ruta/al/proyecto/prisma/dev.db ".backup '/ruta/backups/backup_$(date +\%F).db'"
```
Para bases de datos en la nube (ej. PostgreSQL administrado vía Vercel, Supabase, Neon) se aprovechan las políticas de retención automatizada (`Automated Backups`) que capturan el estado diario de los registros sin requerir scripts adicionales.

### b. Procedimiento de copias de seguridad
**Entorno Local (SQLite):**
Al tratarse de SQLite, la base de datos es un archivo físico concentrado (`prisma/dev.db`). El procedimiento manual consiste en realizar una copia segura de este archivo.
Comando empleando la CLI nativa de SQLite:
```bash
sqlite3 prisma/dev.db ".backup 'prisma/backups/dev_backup.db'"
```

**Entorno Producción (PostgreSQL):**
Se utiliza la herramienta `pg_dump` para generar un volcado de los datos en un archivo SQL o formato comprimido:
```bash
pg_dump -U my_user -F c -d caps_store_db -f /backups/caps_store_backup.dump
```

### c. Protocolos de restauración
En caso de pérdida de datos, corrupción o vulneración, el protocolo de restauración se activa de inmediato garantizando el nivel de servicio:
**Para SQLite (Local):**
```bash
sqlite3 prisma/dev.db ".restore 'prisma/backups/dev_backup.db'"
```
**Para PostgreSQL (Producción):**
Se utiliza la orden `pg_restore` limpiando la base de datos previamente (bandera `-c` o `-1`) para volcar los esquemas íntegros de la base de datos original:
```bash
pg_restore -U my_user -d caps_store_db -1 /backups/caps_store_backup.dump
```

### d. Automatización de tareas
Se configuran "Cron Jobs" a nivel del backend de Next.js (o rutinas de servidor externo) que se encargan de limpiar la basura informática de la base de datos periódicamente (tareas de mantenimiento). Por ejemplo, el borrado automático de _tokens_ de sesión expirados de la tabla `Session` o `VerificationToken` para liberar espacio, mejorar el rendimiento y acelerar las consultas orgánicas sobre estos registros.

### e. Métodos de importación y exportación de datos
- **Herramientas de Visión (Prisma Studio):** Ejecutable localmente con `npx prisma studio`. Proporciona una interfaz nativa que permite exportar selecciones de las colecciones de la base de datos (`Product`, `Sale`, etc.) directamente a formato CSV para usos contables o analíticos.
- **A nivel de Código (Seeders):** Se incorpora el protocolo de un archivo de "Semilla" (`prisma/seed.ts`). Este toma archivos de datos estáticos en JSON o Excel/CSV (importación) y los ingesta masivamente usando el método `prisma.model.createMany()` (Ej. `prisma.product.createMany(...)`), populando la base de datos automáticamente desde un origen confiable en tan solo una línea de ejecución (`npx prisma db seed`).

### f. Lineamientos de seguridad en la base de datos
Desde el origen del diseño de Cap Store se aplican varios de los mejores criterios en la industria del software:
- **Principio de Menor Privilegio:** Uso de cuentas de servicio con permisos delimitados a "solo lectura/escritura" de Data Manipulation (DML), en lugar de interactuar siempre con la cuenta maestra de la DB (Postgres Admin).
- **Secretos Empaquetados:** La cadena de conexión de acceso `DATABASE_URL` se almacena estrictamente en el entorno local (dentro de `.env`) y en los secretos del ambiente en la nube, evadiendo la exposición del dominio y las contraseñas en repositorios públicos.
- **Inyección SQL Mitigada:** Por la arquitectura empleada de **Prisma ORM**, todas las consultas escritas en Prisma API se compilan e inyectan con _Prepared Statements_ o consultas parametrizadas, repeliendo el 100% de los intentos de hacking estándar por Inyección SQL.
- **Autenticación Protegida:** Las contraseñas de todos los perfiles de usuario jamás se guardan en texto plano en la tabla `User`. Siempre atraviesan un salting y hash asíncrono robusto (ej. usando bcrypt).

---

## 2. Exportación e Importación de Datos en Detalle

### a. Procedimiento de exportación
La exportación masiva se puede automatizar en áreas delicadas para sacar los cierres métricos (Ventas por ejemplo). A través de un endpoint analítico, se exportan colecciones enteras creando un volcado JSON que puede ser parseado por software externo.
**Vía Código (Ejemplo Script de utilidad Node.js):**
```typescript
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function exportCatalog() {
  const products = await prisma.product.findMany() // Extrae tabla completa de productos
  fs.writeFileSync('catalog_export.json', JSON.stringify(products, null, 2))
  console.log('Exportación finalizada exitosamente.')
}
exportCatalog()
```

### b. Procedimiento de importación
A través de un archivo `seed.ts` podemos construir la estructura basal del e-commerce al montar la base de datos por primera ocasión (`Cold Start`), logrando ingestar datos en volumen. Este método asegura que no dependamos de clics humanos.
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Matriz de importación (simulable a través de lectura de XML o CSV)
  const categoriesToImport = [ { name: "Gorras" }, { name: "Accesorios Urbanos" } ];
  
  // Ejecutando la inserción por lotes para un mayor performance de red  
  await prisma.category.createMany({ 
      data: categoriesToImport, 
      skipDuplicates: true // Cláusula inteligente que ignora si ya fue importado
  });
}
main()
```

---

## 3. Administrar Usuarios y Permisos

### a. Procedimiento de creación de usuarios de sistema y perfiles
En la infraestructura modelada, la tabla del Sistema **`User`** dispone de un atributo o bandera esencial: el `role` (Rol Administrativo). A través de este campo, el motor restringe la gestión de la aplicación (modelo RBAC - Control de Acceso Basado en Roles).

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  password  String?
  role      String   @default("CUSTOMER") // Roles predefinidos: ADMIN, CUSTOMER, EMPLOYEE
  createdAt DateTime @default(now())
  // ...
}
```

**Procedimiento Operativo:**
1. **Creación Automática base (Front-Facing):** Cualquier visitante que se registra exitosamente desde el formulario `/register` o a través del Single Sign-On de NextAuth.js obtiene, a nivel de base de datos, el nivel `CUSTOMER` por defecto.
2. **Examen de Autorizaciones (Middleware):** El servidor ejecuta un filtro en cada transición a páginas protegidas (dashboard). El middleware interpela la sesión y revisa si el token de base de datos le pertenece a un nivel superior, en este caso `ADMIN`.
3. **Elevación de Perfiles (Asignación):** Un perfil administrador con suficientes poderes ejecuta la operación en el sistema que detona internamente un `UPDATE` en la base de datos a fin de promover personal gerencial.
```typescript
await prisma.user.update({
   where: { email: "usuario@dominio.com" },
   data: { role: 'ADMIN' }
})
```

---

## 4. Verificar la Calidad de los Datos

Con la intención de garantizar una experiencia libre de errores (Zero-Bug Policy) para la tienda operando, el diseño estricto establecido como evidencia en `schema.prisma` defiende la calidad de la información a través de los siguientes pilares de bases de datos:

- **a. Exactitud:** Uso explícito de tipos fuertes y precisos para las operaciones financieras. Se emplea el tipo `@db.Decimal` (representado como `Decimal` en el ORM) en vez del primitivo numérico genérico flotante en campos críticos de divisas (`price` del producto y `total` de la `Sale`) previniendo mermas por redondeo informático.
- **b. Integridad Referencial:** Implementación de restricciones de llaves foráneas y borrado en cascada (Cascade Actions) controladas (`@relation(..., onDelete: Cascade)`). Esto erradica la corrupción por registros huérfanos. Por ejemplo, al borrar un `User`, se borran sus `Address` e `Account` en dependencia. Las relaciones `Product` y `SaleItem` evitan que un producto vendido sea borrado al azar, lo cual destruía los registros contables históricos de la plataforma.
- **c. Disponibilidad:** Mediante la configuración del pooling y concurrencia máxima en la URI `DATABASE_URL` conectada en la nube, se resuelven situaciones de sobreconsumos limitando la asfixia del servidor de base de datos ante picos de tráfico.
- **d. Confiabilidad:** Declaración de restricciones de control lógico a nivel estructural impidiendo violaciones. Ejemplos de implementaciones: Las restricciones únicas (Constraints explícitos) como `@unique` en `email`, número de serie `code` del `Product` y la clave referencial `dni` del personal (`Employee`), deteniendo transacciones fraudulentas de raíz.
- **e. Utilidad:** Inserción de campos de huella en el tiempo (`Timestamps`), como los decoradores automáticos `createdAt @default(now())` permitiendo generar tabuladores con filtros funcionales como "Últimos productos actualizados" y "Nuevos registros generados este mes".
- **f. Accesibilidad:** Se hace uso de métodos indexados a fin de acelerar las selecciones masivas (Full Table Scan Eviction). La búsqueda a nivel código de productos agiliza con `findMany({ include: { styleRef: true } })` gracias a las relaciones foráneas estables marcadas hacia los maestros complementarios.
- **g. Pertinencia:** La estructuración separa claramente la lógica (ej. Las preferencias de los usuarios y direcciones guardadas en perfiles segregados en un modelo relacional `Address` aislado garantizando orden vertical, en lugar de guardar todas las ubicaciones englobilladas como un JSON opaco dentro del usuario).
- **h. Usabilidad:** Todos los atributos presentes desde el servidor hasta el Frontend están autocompletados (Autocompletions) como Tipos y Modelos exportados de Prisma. Al estar los módulos de las bases conectados al IDE de TypeScript, las operaciones con datos son seguras desde código debido a su autodescubrimiento predictivo y chequeo en tiempo real.

---

## 5. Verificación de la Fiabilidad y Efectividad de los Datos

A fin de asegurar que el ciclo de vida de los datos del catálogo se mantenga impoluto, efectivo y resiliente, la estructura ejerce acciones de verificación de control de entidades fundamentales en los siguientes rubros:

- **a. Actualización (Tracking de vigencia):** Empleo de campos inteligentes paramétricos de rastro transaccional de auditoría como el `updatedAt DateTime @updatedAt`. Ante cualquier evento de escritura o update sobre entidades transaccionalmente valiosas para la compañía como los Pedidos (`Sale`) y Productos (`Product`), la columna inyecta una bandera cronológica de tiempo atómica sin mediación de scripts; permitiéndonos conocer fielmente cuándo se movió la última pieza del inventario en venta.
- **b. Normalización Estructural:** El e-commerce cumple satisfactoriamente con las normativas (Tercera Forma Normal - 3FN) dividiendo la arquitectura de catálogos paramétricos estandarizados. Ejemplo vital: El producto en vez de duplicar las referencias base de talla textualmente repitiendo campos gigantes por fila, asocia las características mediante tablas nodales complementarias como `Quality`, `Style`, `Material` y `Category`. Luego inserta una referencia en el `Product` original mediante sus llaves foráneas eficientes (`qualityId`, `styleId`, `materialId`). Ahorrando de este modo dramáticamente el espacio en almacenamiento (peso), unificando catálogos del UI y erradicando incongruencias por la tipificación mal capturada a mano de parte del empleado en inventario.
- **c. Evitar la Duplicidad:** Como política obligatoria en el esquema transaccional, las llaves de seguridad predefinen limitadores universales `@unique`. Esto bloquea de origen la intromisión accidental o intencional de registros superpuestos impidiendo que 2 empleados tengan el mismo número social/DNI (tabla `Employee`), o que un administrador agregue sin darse cuenta un producto homólogo usando el mismo código de barras preexistente (columna `code` obligatoriamente `unique` del modelo `Product`). Esto delega la confiabilidad al propio motor, rechazando instantáneamente la escritura en lugar de recurrir estrictamente a frágiles revisiones de interfaz visual.
