# Operacion ICATEBCS Portal

## Antes de desplegar

1. Generar respaldo de la base actual:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-mysql.ps1
```

2. Verificar entorno de produccion:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.gob.mx
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=icatebcs
DB_USERNAME=usuario_seguro
DB_PASSWORD=contraseña_segura
SESSION_SECURE_COOKIE=true
```

3. Compilar assets:

```powershell
npm.cmd run build
```

4. Validar aplicacion:

```powershell
composer test
php artisan route:list
```

## Rollback de codigo

1. Mantener el respaldo SQL generado antes de cualquier despliegue.
2. Si el despliegue falla, volver al commit anterior y limpiar cache:

```powershell
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Rollback de migraciones

Las migraciones existentes ya tienen `down()` corregido para:

- `inscripciones`
- columnas `calificacion` y `resultado`

No ejecutar rollbacks en produccion sin respaldo previo.

## Politica de usuarios

El registro publico esta deshabilitado. Las cuentas se crean desde:

```text
/admin/usuarios
```

Roles disponibles:

- `admin`
- `capturista`

## Asistencias

No se implementa sistema de asistencias por decision operativa. La lista imprimible de grupo queda disponible como documento de apoyo sin almacenar pases diarios en base de datos.
