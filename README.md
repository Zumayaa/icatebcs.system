# ICATEBCS Portal

Sistema de control escolar para gestion de cursos, capacitadores, capacitandos, preinscripciones publicas y validacion de expedientes en ventanilla.

## Stack

- Laravel
- Inertia.js
- React
- Vite
- Tailwind CSS
- MySQL/MariaDB en entorno Laragon/HeidiSQL

## Modulos

- Registro publico de preinscripcion.
- Ventanilla de control escolar para validar expedientes.
- Catalogo de cursos.
- Plantilla de capacitadores.
- Grupo por curso con calificaciones, bajas, lista imprimible y constancia imprimible.
- Administracion de usuarios y roles (`admin`, `capturista`).

## Seguridad operativa

- El autorregistro publico de usuarios esta deshabilitado.
- Los usuarios administrativos se crean desde `/admin/usuarios`.
- La preinscripcion valida en backend:
  - curso activo,
  - cupo disponible,
  - CURP con formato valido,
  - telefono de 10 digitos,
  - edad minima de 15 anos.

## Operacion y respaldos

Ver [docs/OPERACION.md](docs/OPERACION.md).

Respaldo MySQL/MariaDB:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-mysql.ps1
```

## Desarrollo

```powershell
composer install
npm install
php artisan migrate
npm.cmd run dev
```

## Verificacion

```powershell
composer test
npm.cmd run build
```
