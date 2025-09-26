# Braedt Directo — Tienda B2B (SPA)

Aplicación de una sola página (SPA) para que Braedt venda embutidos directamente a comercios (B2B), grandes o pequeños. Incluye catálogo, carrito, checkout, órdenes y cuenta con inicio de sesión / registro. Los datos se simulan con archivos JSON y se persisten en `localStorage`.

Problema a resolver: Actualmente Braedt no cuenta con una tienda virtual propia donde los clientes puedan comprar sus productos de manera directa. Esto hace que los consumidores solo puedan conseguirlos a través de supermercados, bodegas o apps de delivery, generando dependencia de intermediarios. Esta SPA plantea la compra directa con precios mayoristas, escalas por volumen y entrega refrigerada.

## Estructura de carpetas

- `index.html` — Punto de entrada.
- `css/styles.css` — Estilos base + utilidades.
- `js/` — Código de la SPA (router, store, vistas, componentes).
- `data/` — Archivos JSON de la “base de datos”.

## Archivos JSON y su estructura

Las claves indicadas son los nombres exactos en los JSON. Descripciones en español para claridad del dominio.

### `data/products.json`

Lista de productos. Cada producto:

```
{
  "id": number,                   // ID único
  "name": string,                 // Nombre del producto (nombre)
  "brand": string,                // Marca (p.e., "Braedt")
  "category": string,             // Categoría (categoria)
  "unit": string,                 // Presentación/unidad (p.e. "botella 1L")
  "packSize": number,             // Tamaño del empaque (si aplica)
  "price": number,                // Precio base por unidad (precio)
  "moq": number,                  // Mínimo de compra (unidades)
  "stock": number,                // Stock disponible (simulado)
  "image": string,                // URL/ruta de la imagen (foto)
  "tags": string[],               // Etiquetas rápidas
  "tiers": [{                     // Escalas por volumen opcionales
    "minQty": number,             // Cantidad mínima para aplicar
    "price": number               // Precio por unidad a partir de ese volumen
  }],
  "description": string,          // Descripción
  "onSale": boolean               // Si está en oferta (true/false)
}
```

Notas:
- El precio aplicado en el carrito usa la mejor escala según la cantidad (`tiers`), si no existe, usa `price`.
- `onSale` es un indicador; puedes usarlo para resaltar productos en el UI.

### `data/users.json`

Lista de clientes/tiendas que pueden iniciar sesión. Cada usuario:

```
{
  "id": string,                   // ID único de usuario (p.e. "U1")
  "name": string,                 // Nombre del negocio
  "email": string,                // Correo del usuario
  "password": string,             // Contraseña en texto plano (solo demo)
  "phone": string,                // Teléfono de contacto
  "address": string               // Dirección por defecto
}
```

Advertencia: Para fines de demo la contraseña está en texto plano. No usar en producción.

### `data/cart.json`

Carrito inicial (se actualiza en `localStorage`). Es un arreglo de ítems:

```
{
  "id": number,                   // ID del producto
  "qty": number                   // Cantidad
}
```

Ejemplo: `[{ "id": 101, "qty": 2 }]`

### `data/orders.json`

Historial inicial de órdenes (se antepone cada orden nueva). Cada orden registrada por el checkout:

```
{
  "id": string,                   // ID de orden (p.e. "ORD-AB12CD")
  "createdAt": string,            // ISO string de fecha/hora
  "status": string,               // Estado ("Recibida", etc.)
  "items": [{
    "id": number,                // ID producto
    "name": string,              // Nombre producto
    "qty": number,               // Cantidad
    "unit": string,              // Unidad / presentación
    "price": number              // Precio unitario aplicado
  }],
  "totals": {
    "subtotal": number,          // Suma de líneas
    "shipping": number,          // Costo de envío aplicado
    "total": number              // Total a pagar
  },
  "customer": {
    "name": string,              // Nombre de negocio
    "phone": string,             // Teléfono de contacto
    "address": string            // Dirección de entrega
  },
  "notes": string,               // Notas opcionales
  "payment": string              // Método de pago ("tarjeta" | "contraentrega")
}
```

## Flujo de sesión (login / registro)

- Pantalla: `#/cuenta`.
- Iniciar sesión: ingresa correo y contraseña (valida contra `data/users.json` cargado en `localStorage`).
- Crear cuenta: completa nombre, correo, contraseña, teléfono y dirección. Se guarda en `localStorage` y se inicia sesión.

## Rutas por Rol

- Cliente (compra):
  - `#/` — Inicio
  - `#/catalogo` — Catálogo y filtros
  - `#/producto/:id` — Detalle de producto
  - `#/carrito` — Carrito de compras
  - `#/checkout` — Pago y datos de entrega
  - `#/confirmacion?id=...&phone=...` — Confirmación de compra
  - `#/ordenes` — Historial de órdenes
  - `#/cuenta` — Iniciar sesión / Crear cuenta

- Empresa (panel general):
  - `#/panel` — Hub del panel (requiere rol empresa)

- Marketing:
  - `#/panel-marketing` — Reportes: ventas, ticket promedio, top productos

- Almacén:
  - `#/panel-almacen` — Stocks, órdenes de compra (PO) y arribos

- Ventas:
  - `#/panel-ventas` — Contratos de compra-venta y órdenes de clientes

## Flujo de compra

1. Catálogo `#/catalogo`: busca, filtra por categoría y precio, ordena por precio.
2. Producto `#/producto/:id`: muestra escalas por volumen, respeta MOQ; agrega cantidades.
3. Carrito `#/carrito`: edita cantidades, quita ítems, muestra subtotal, envío y total.
4. Checkout `#/checkout`: completa datos de contacto, elige pago (tarjeta o contraentrega), confirma compra.
5. Confirmación `#/confirmacion?id=...&phone=...`: muestra mensaje de éxito y enlace a órdenes.
6. Órdenes `#/ordenes`: historial de compras (persistido en `localStorage`).

## Notas de implementación

- Los JSON en `data/` se cargan una vez al inicio. Si no existen en `localStorage`, se copian desde archivo.
- A partir de ahí, el estado vive en `localStorage` (carrito, órdenes, usuarios nuevos).
- Envío: gratis desde S/ 600; de lo contrario S/ 19.90 (ajustable en `shippingFor()` de `js/store.js`).
