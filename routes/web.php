<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\CapturistaController;
use App\Http\Controllers\CapacitadorController;
use App\Http\Controllers\CursoController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ==========================================
// RUTAS PÚBLICAS (Lo que ve el ciudadano)
// ==========================================
Route::get('/registro', [InscripcionController::class, 'create'])->name('registro.create');
Route::post('/registro', [InscripcionController::class, 'store'])->name('registro.store');

// ==========================================
// EL SEMÁFORO INTELIGENTE (Redirección por Rol)
// ==========================================
Route::get('/dashboard', function () {
    $rol = auth()->user()->role;
    
    if ($rol === 'admin') {
        return redirect()->route('cursos.index');
    } elseif ($rol === 'capturista') {
        return redirect()->route('capturista.index');
    }
    
    // Si metes otro rol en el futuro, por defecto lo manda a su perfil
    return redirect()->route('profile.edit');
})->middleware(['auth', 'verified'])->name('dashboard');

// Rutas de Perfil (Generales para quien inicie sesión)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==========================================
// MÓDULO DE CAPTURISTAS (Ventanilla)
// Pueden entrar 'admin' y 'capturista'
// ==========================================
Route::middleware(['auth', 'role:admin,capturista'])->group(function () {
    Route::get('/capturista', [CapturistaController::class, 'index'])->name('capturista.index');
    Route::post('/capturista/validar/{id}', [CapturistaController::class, 'validar'])->name('capturista.validar');
    Route::get('/capturista/exportar', [CapturistaController::class, 'exportar'])->name('capturista.exportar');
    Route::get('/capturista/imprimir/{id}', [CapturistaController::class, 'imprimir'])->name('capturista.imprimir');
});

// ==========================================
// MÓDULO DE ADMINISTRACIÓN (Alta Dirección)
// SOLO puede entrar 'admin'
// ==========================================
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Capacitadores
    Route::get('/admin/capacitadores', [CapacitadorController::class, 'index'])->name('capacitadores.index');
    Route::post('/admin/capacitadores', [CapacitadorController::class, 'store'])->name('capacitadores.store');
    Route::put('/admin/capacitadores/{id}', [CapacitadorController::class, 'update'])->name('capacitadores.update');
    Route::delete('/admin/capacitadores/{id}', [CapacitadorController::class, 'destroy'])->name('capacitadores.destroy');
    
    // Cursos
    Route::get('/admin/cursos', [CursoController::class, 'index'])->name('cursos.index');
    Route::get('/admin/cursos/exportar', [CursoController::class, 'exportar'])->name('cursos.exportar');
    Route::post('/admin/cursos', [CursoController::class, 'store'])->name('cursos.store');
    Route::put('/admin/cursos/{id}', [CursoController::class, 'update'])->name('cursos.update');
    Route::patch('/admin/cursos/{id}/toggle', [CursoController::class, 'toggleActivo'])->name('cursos.toggle');
});

require __DIR__.'/auth.php';