# Cafetería Origen — API

API REST para gestionar el menú, los pedidos y los reportes de ventas de **Cafetería Origen**, una cafetería de especialidad que vende café expreso, café filtrado y pastelería.

Proyecto desarrollado por el **Grupo 17**.

## Funcionalidades

- **Catálogo de productos:** expresos y filtrados en tres tamaños (Pocillo, Mediano, Taza grande) y tres variedades de grano (Brasil, Colombia, Etiopía), más pastelería.
- **Precio calculado por dominio:** el precio de un café depende de los gramos de grano y de la variedad elegida.
- **Pedidos:** alta de pedidos con varios ítems (opcionalmente asociados a una mesa), consulta y cambio de estado con reglas de transición.
- **Reportes:** facturación total y tipo de producto más vendido, ignorando los pedidos cancelados.
- **Validación y manejo de errores centralizado**, con respuestas JSON consistentes.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Lenguaje | TypeScript 5.9 |
| Runtime / framework | Node.js 20 · Express 4 |
| Base de datos | PostgreSQL 16 (driver `pg`) |
| Tests | Jest · ts-jest · Supertest |
| Infraestructura | Docker · Docker Compose |

## Puesta en marcha

### Con Docker

Requisitos: [Docker](https://www.docker.com/) con Docker Compose.

```bash
git clone https://github.com/ricardoherbas/cafeteria-origen-grupo17.git
cd cafeteria-origen-grupo17

# Variables de entorno
cp .env.example .env

# Levanta PostgreSQL (con el esquema y los datos de ejemplo) y la API
docker compose up --build
```

La API queda disponible en `http://localhost:3000`.

> El esquema y los datos iniciales se cargan desde `backend/database/init.sql` **solo la primera vez** que se crea el volumen. Para reiniciar la base desde cero: `docker compose down -v`.

### Variables de entorno

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `DB_HOST` | `localhost` | Host de PostgreSQL (con Docker Compose, la API usa `db`) |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `cafeteria` | Usuario de la base |
| `DB_PASSWORD` | `cafeteria123` | Contraseña de la base |
| `DB_NAME` | `cafeteria` | Nombre de la base |
| `PORT` | `3000` | Puerto de la API |

## Endpoints

Base URL: `http://localhost:3000/api`

### Productos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/productos` | Lista todos los productos |
| `GET` | `/productos/:id` | Devuelve un producto (`404` si no existe) |

Ejemplo de producto (`GET /api/productos/5`):

```json
{
  "id": 5,
  "nombre": "Expreso Mediano",
  "precioBase": 2500,
  "tamanio": "Mediano",
  "gramosCafe": 27,
  "variedad": {
    "nombre": "Colombia",
    "precioPorGramo": 180,
    "descripcion": "Acidez Media, cuerpo Equilibrado y notas Cítricas y florales"
  }
}
```

### Pedidos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/pedidos` | Crea un pedido (nace en estado `pendiente`) |
| `GET` | `/pedidos` | Lista los pedidos |
| `GET` | `/pedidos/:id` | Devuelve un pedido con sus ítems |
| `PATCH` | `/pedidos/:id/estado` | Cambia el estado del pedido |

Crear un pedido (`mesaId` es opcional):

```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{ "mesaId": 1, "items": [ { "productoId": 5, "cantidad": 2 } ] }'
```

```json
{
  "id": 1,
  "mesaId": 1,
  "estado": "pendiente",
  "total": 14720,
  "items": [
    { "productoId": 5, "cantidad": 2, "precioUnitario": 7360, "subtotal": 14720 }
  ]
}
```

El precio unitario queda **congelado** en el pedido: si el menú cambia después, los pedidos existentes no se alteran.

Cambiar el estado:

```bash
curl -X PATCH http://localhost:3000/api/pedidos/1/estado \
  -H "Content-Type: application/json" \
  -d '{ "estado": "confirmado" }'
```

Transiciones permitidas:

```
pendiente ──► confirmado
    └───────► cancelado
```

`confirmado` y `cancelado` son estados finales. Cualquier otra transición responde `409`.

### Reportes

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/reportes/facturacion` | `{ "facturacionTotal": 14720 }` |
| `GET` | `/reportes/mas-vendido` | `{ "tipo": "expreso", "cantidad": 2 }` (`404` si no hay ventas) |

Los pedidos `cancelado` no se cuentan en ningún reporte.

### Códigos de error

Todos los errores responden con el formato `{ "error": "mensaje" }`.

| Código | Cuándo |
| --- | --- |
| `400` | Datos inválidos (ítems vacíos, `productoId` o `cantidad` no enteros positivos, id inválido, estado desconocido) |
| `404` | Producto o pedido inexistente, o reporte sin ventas |
| `409` | Transición de estado no permitida |
| `500` | Error interno del servidor |

## Cómo se calcula el precio

| Tipo | Fórmula |
| --- | --- |
| Expreso / Filtrado | `precioBase + gramosCafe × precioPorGramo` |
| Pastelería | `precioBase` |

Ejemplo: Expreso Mediano de Colombia → `2500 + 27 × 180 = $7.360`.

Datos de ejemplo cargados por `init.sql`:

| Variedad | Acidez | Cuerpo | Notas | $/gramo |
| --- | --- | --- | --- | --- |
| Brasil | Baja | Denso | Avellana | 140 |
| Colombia | Media | Equilibrado | Cítricas y florales | 180 |
| Etiopía | Viva | Ligero | Frutales | 240 |

La base también incluye 5 mesas y 2 productos de pastelería (muffin de chocolate y porción de torta selva negra).

## Tests

Desde la carpeta `backend/`:

```bash
npm install              # solo la primera vez
npm run test:unit        # tests unitarios (no necesitan base de datos)
npm run test:endpoints   # tests de integración contra PostgreSQL real
npm test                 # ambos, en serie
```

Los tests de integración usan la base real, así que necesitan el `.env` en la raíz del repositorio y la base levantada (`docker compose up -d db`). Se ejecutan con `--runInBand` para que no se pisen entre sí.

## Arquitectura

El backend sigue una arquitectura en capas, con las dependencias inyectadas a mano en `app.ts`:

```
Request ─► routes ─► middlewares (validación) ─► controllers ─► services ─► repositories ─► PostgreSQL
                                                                    │
                                                              models / factories
```

```
cafeteria-origen-grupo17/
├── docker-compose.yml        # PostgreSQL + API
├── .env.example
└── backend/
    ├── app.ts                # arma la app Express y conecta las capas
    ├── server.ts             # punto de entrada
    ├── config/               # conexión a la base (pool de pg)
    ├── routes/               # definición de rutas por recurso
    ├── middlewares/          # validación de pedidos y manejo de errores
    ├── controllers/          # traducen HTTP ⇄ servicios
    ├── services/             # lógica de negocio
    ├── repositories/         # acceso a datos (SQL)
    ├── models/               # Producto (abstracta), Expreso, Filtrado, Pasteleria, Variedad, Pedido
    ├── factories/            # ProductoFactory
    ├── database/init.sql     # esquema + datos de ejemplo
    └── tests/                # unit/ e integration/
```

## Equipo — Grupo 17

- Ricardo Herbas
- Celina Vega
- Gonzalo Herrera

## Flujo de trabajo

- Una rama por funcionalidad (`feature/…`, `chore/…`, `build/…`) integrada a `main` mediante Pull Request.
- Desarrollo guiado por tests (TDD): los commits de tests marcan el ciclo `[rojo]` → `[verde]`.
- Mensajes de commit con prefijos convencionales (`feat`, `fix`, `test`, `build`, `chore`, `refactor`).