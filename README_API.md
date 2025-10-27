# API Ecommerce - Documentación

Este es un backend de ecommerce desarrollado durante el taller de backend. Incluye autenticación, gestión de productos, compras, y más.

## Características Principales

- ✅ Autenticación con JWT
- ✅ Gestión de productos con stock
- ✅ Sistema de balance para usuarios
- ✅ Procesamiento de compras
- ✅ Observabilidad (logging, error handling)
- ✅ Socket.io para chat en tiempo real

## Estructura del Proyecto

```
clase-3/
├── config/
│   └── database.js          # Configuración de la base de datos
├── controllers/
│   ├── items.js             # Controlador de productos
│   ├── users.js              # Controlador de usuarios
│   └── purchase.js           # Controlador de compras
├── middlewares/
│   ├── auth.js               # Middleware de autenticación
│   ├── cors.js               # Middleware CORS
│   └── errorHandler.js       # Manejo de errores
├── models/
│   └── mysql/
│       ├── item.js           # Modelo de productos
│       ├── user.js            # Modelo de usuarios
│       └── purchase.js        # Modelo de compras
├── routes/
│   ├── items.js              # Rutas de productos
│   ├── users.js              # Rutas de usuarios
│   └── purchase.js           # Rutas de compras
├── schemas/
│   └── items.js              # Validaciones con Zod
├── utils/
│   └── logger.js             # Utilidades de logging
└── app.js                    # Aplicación principal
```

## Endpoints de la API

### Usuarios

#### Registro
```bash
POST /users/register
Body: {
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123"
}
```

#### Login
```bash
POST /users/login
Body: {
  "email": "juan@example.com",
  "password": "MiPassword123"
}
Response: {
  "username": "Juan Pérez",
  "email": "juan@example.com",
  "balance": 0
}
```

#### Logout
```bash
POST /users/logout
```

#### Obtener Balance (Requiere autenticación)
```bash
GET /users/balance
```

#### Agregar Saldo (Requiere autenticación)
```bash
POST /users/balance
Body: {
  "amount": 100.50
}
```

#### Verificar Acceso Protegido (Requiere autenticación)
```bash
GET /users/protected
```

### Productos

#### Obtener Todos los Productos
```bash
GET /items
```

#### Obtener Producto por ID
```bash
GET /items/by-id/:id
```

#### Buscar Producto por Nombre
```bash
GET /items/:name
```

#### Crear Producto
```bash
POST /items
Body: {
  "title": "Cafetera Italiana",
  "year": 2023,
  "brand": "Bialetti",
  "price": 45.99,
  "poster": "https://example.com/images/cafetera.jpg",
  "rate": 4.5,
  "stock": 50,
  "category": ["Hogar", "Cocina"]
}
```

#### Actualizar Producto
```bash
PATCH /items/:id
Body: {
  "price": 49.99,
  "stock": 45
}
```

#### Eliminar Producto
```bash
DELETE /items/:id
```

### Compras (Requieren autenticación)

#### Realizar Compra
```bash
POST /purchases
Headers: Cookie: access_token=...
Body: {
  "productId": "uuid-del-producto",
  "quantity": 2
}
Response: {
  "success": true,
  "purchase": {
    "id": "...",
    "quantity": 2,
    "total_price": 91.98,
    "purchase_date": "..."
  },
  "newBalance": 8.50
}
```

#### Obtener Mis Compras
```bash
GET /purchases/my-purchases
```

#### Obtener Todas las Compras (Admin)
```bash
GET /purchases/all
```

#### Obtener Compra por ID
```bash
GET /purchases/:id
```

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_NAME=productsdb
NODE_ENV=development
```

## Configuración de Base de Datos

### Ejecutar Migraciones

```bash
mysql -u root -p productsdb < migrations/add_purchase_and_balance.sql
```

### Estructura de Tablas

#### Usuarios (users)
- `id` - BINARY(16) - Identificador único
- `name` - VARCHAR - Nombre del usuario
- `email` - VARCHAR - Email único
- `password` - VARCHAR - Contraseña hasheada
- `balance` - DECIMAL(10,2) - Saldo disponible (nuevo)

#### Productos (products)
- `id` - BINARY(16) - Identificador único
- `title` - VARCHAR - Título del producto
- `year` - INT - Año
- `brand` - VARCHAR - Marca
- `price` - DECIMAL(10,2) - Precio
- `poster` - VARCHAR - URL de imagen
- `rate` - DECIMAL(2,1) - Calificación
- `stock` - INT - Cantidad disponible (nuevo)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

#### Compras (purchases) - Nueva tabla
- `id` - BINARY(16) - Identificador único
- `user_id` - BINARY(16) - Referencia a users
- `product_id` - BINARY(16) - Referencia a products
- `quantity` - INT - Cantidad comprada
- `total_price` - DECIMAL(10,2) - Precio total
- `purchase_date` - TIMESTAMP - Fecha de compra
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Flujo de Compra

1. Usuario se registra o inicia sesión
2. Usuario agrega saldo a su cuenta
3. Usuario ve productos disponibles
4. Usuario realiza compra (se verifica):
   - Stock disponible
   - Balance suficiente
5. Se actualiza:
   - Stock del producto
   - Balance del usuario
   - Se registra la compra

## Autenticación

Todas las rutas de compras requieren autenticación mediante JWT almacenado en cookies.

El token incluye:
- `username` - Nombre del usuario
- `email` - Email del usuario
- `userId` - ID del usuario (codificado en base64)

El middleware `authMiddleware` verifica la existencia y validez del token.

## Observabilidad

### Logging
- Request logger: Registra todas las peticiones HTTP
- Error logger: Registra errores con detalles
- Info/Warn/Debug logs para diferentes situaciones

### Manejo de Errores
- Middleware centralizado de errores
- Códigos de estado HTTP apropiados
- Mensajes de error descriptivos

## Socket.io

El servidor también incluye funcionalidad de chat en tiempo real mediante Socket.io.

### Eventos
- `chat message` - Enviar/recibir mensajes

## Ejemplos de Uso

### Flujo Completo de Compra

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123456"}'

# 2. Login
curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123456"}' \
  -c cookies.txt

# 3. Agregar saldo
curl -X POST http://localhost:8000/users/balance \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}' \
  -b cookies.txt

# 4. Ver productos
curl http://localhost:8000/items

# 5. Realizar compra
curl -X POST http://localhost:8000/purchases \
  -H "Content-Type: application/json" \
  -d '{"productId":"uuid-del-producto","quantity":1}' \
  -b cookies.txt
```

## Notas para Estudiantes

- La autenticación se basa en cookies, no en headers Authorization
- El stock se verifica antes de procesar la compra
- El balance del usuario debe ser suficiente para la compra
- Todas las compras se registran en la tabla `purchases`
- Los errores se manejan de forma centralizada

## Tecnologías Utilizadas

- Express.js - Framework web
- MySQL2 - Cliente de base de datos
- bcrypt - Hash de contraseñas
- jsonwebtoken - Autenticación JWT
- Zod - Validación de esquemas
- Socket.io - WebSockets
- Morgan - HTTP request logger
- Cookie-parser - Manejo de cookies


