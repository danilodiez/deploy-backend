# Changelog - Refactorización del Ecommerce Backend

## Resumen de Cambios

Este documento detalla todas las mejoras y nuevas funcionalidades agregadas al proyecto de ecommerce durante la refactorización.

## Bugs Corregidos

### Controllers

1. **users.js**: 
   - Eliminados imports innecesarios
   - Corregida validación de contraseña (de `< 12` a `length < 12`)
   
2. **items.js**:
   - Corregido método `update` para usar el ID desde params
   - Corregido método `delete` para retornar status code apropiado
   - Agregado método `getById` para obtener productos por ID

### Models

3. **item.js (MySQL)**:
   - Corregida consulta SQL en `getByName` (agregado `title = ? OR brand = ?`)
   - Migrado a sistema de conexión centralizado
   - Agregado método `updateStock` para gestión de inventario
   - Agregado campo `stock` en creaciones
   - Mejoras en manejo de errores

4. **user.js (MySQL)**:
   - Migrado a sistema de conexión centralizado
   - Agregado método `getUserById`
   - Agregados métodos `updateBalance` y `getBalance`
   - Mejorado manejo de errores en login

## Nuevas Características

### Autenticación y Seguridad

1. **Middleware de Autenticación** (`middlewares/auth.js`)
   - Verificación de tokens JWT
   - Extracción de información del usuario del token
   - Manejo de tokens expirados o inválidos

2. **Middleware de Manejo de Errores** (`middlewares/errorHandler.js`)
   - Manejo centralizado de errores
   - Diferentes tipos de errores (validación, autenticación, genéricos)
   - Respuestas consistentes

### Observabilidad

3. **Sistema de Logging** (`utils/logger.js`)
   - Logger con diferentes niveles (info, error, warn, debug)
   - Request logger middleware para trackear requests HTTP
   - Formato con timestamps ISO

4. **Mejoras en CORS** (`middlewares/cors.js`)
   - Agregado soporte para credentials (cookies)
   - Agregado localhost:8000 a origins permitidos

### Sistema de Base de Datos

5. **Conexión Centralizada** (`config/database.js`)
   - Pool de conexiones reutilizable
   - Configuración mediante variables de entorno
   - Una sola instancia de conexión para toda la app

### Compras

6. **Modelo de Compras** (`models/mysql/purchase.js`)
   - Creación de registros de compra
   - Búsqueda por usuario
   - Búsqueda global
   - Búsqueda por ID

7. **Controlador de Compras** (`controllers/purchase.js`)
   - Procesamiento de compras con validaciones múltiples
   - Verificación de stock
   - Verificación de balance
   - Actualización automática de stock y balance
   - Rollback en caso de errores
   - Logging de compras exitosas

### Rutas

8. **Nuevas Rutas de Compras** (`routes/purchase.js`)
   - `POST /purchases` - Realizar compra (requiere auth)
   - `GET /purchases/my-purchases` - Mis compras (requiere auth)
   - `GET /purchases/all` - Todas las compras (requiere auth)
   - `GET /purchases/:id` - Compra por ID (requiere auth)

9. **Nuevas Rutas de Usuario** (`routes/users.js`)
   - `GET /users/balance` - Obtener balance (requiere auth)
   - `POST /users/balance` - Agregar saldo (requiere auth)
   - Actualizada `/users/protected` para usar authMiddleware

10. **Mejoras en Rutas de Items** (`routes/items.js`)
    - Agregado `GET /items/by-id/:id` para obtener por ID

### Modelos Mejorados

11. **Items**:
    - Agregado campo `stock` en esquema
    - Agregado método `updateStock` para deducciones atómicas
    - Mejoras en método `update` para incluir stock

12. **Usuarios**:
    - Agregado campo `balance` al registro
    - Mejorado login para incluir balance en respuesta
    - Agregado ID de usuario en token JWT

### Documentación

13. **README_API.md**: Documentación completa de la API
14. **CHANGELOG.md**: Este archivo
15. **migrations/add_purchase_and_balance.sql**: Script de migración
16. **.gitignore**: Configuración de gitignore

## Estructura de Base de Datos

### Tabla `users` (actualizada)
```sql
ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0.00;
```

### Tabla `products` (actualizada)
```sql
ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 0;
```

### Tabla `purchases` (nueva)
```sql
CREATE TABLE purchases (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16),
  product_id BINARY(16),
  quantity INT,
  total_price DECIMAL(10,2),
  purchase_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Flujo de Compra Implementado

1. Validación de producto y stock
2. Validación de balance del usuario
3. Deducción de balance
4. Actualización de stock (atómico)
5. Registro de compra
6. Rollback automático en caso de error

## Mejoras en Expresiones y Código

- Separación de responsabilidades
- Reutilización de código
- Manejo consistente de errores
- Logging estructurado
- Validaciones robustas
- Transacciones atómicas para compras
- Código más mantenible y escalable

## Próximos Pasos Sugeridos

- Agregar tests unitarios
- Implementar roles de usuario (admin, cliente)
- Agregar paginación a las listas
- Implementar búsqueda avanzada
- Agregar filtros por categoría
- Implementar reviews/calificaciones de productos
- Agregar carrito de compras
- Implementar notificaciones de compra


