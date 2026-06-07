<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    // Recibe los roles permitidos separados por coma
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Si no ha iniciado sesión, lo mandamos al login
        if (!auth()->check()) {
            return redirect('/login');
        }

        // 2. Si su rol no está en la lista de permitidos para esa ruta, le damos cuello (Error 403)
        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'Acceso Denegado: No tienes los permisos necesarios para esta sección.');
        }

        return $next($request);
    }
}