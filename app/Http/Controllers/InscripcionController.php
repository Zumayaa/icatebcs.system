<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso;
use App\Models\Capacitando;
use App\Models\Inscripcion;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    public function create()
    {
        // Traemos solo los cursos activos, pero ahora pedimos hora_inicio y hora_fin
        $cursos = Curso::where('activo', true)
            ->get(['id', 'nombre', 'unidad_capacitacion', 'dias_semana', 'hora_inicio', 'hora_fin']);

        return Inertia::render('Registro/Index', [
            'cursos' => $cursos
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validamos que no nos manden basura
        $validated = $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'nombre_completo' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'curp' => 'required|string|size:18',
            'fecha_nacimiento' => 'required|date',
            'tipo_identificacion' => 'required|string',
        ]);

        // 2. Buscamos al alumno por CURP. Si no existe, lo crea nuevecito.
        $capacitando = Capacitando::firstOrCreate(
            ['curp' => $validated['curp']], 
            [
                'nombre_completo' => $validated['nombre_completo'],
                'telefono' => $validated['telefono'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'tipo_identificacion' => $validated['tipo_identificacion'],
            ]
        );

        // 3. Verificamos que no se esté inscribiendo al mismo curso dos veces
        $inscripcionExistente = Inscripcion::where('curso_id', $validated['curso_id'])
            ->where('capacitando_id', $capacitando->id)
            ->first();

        if ($inscripcionExistente) {
            return back()->withErrors(['curso_id' => 'Ya estás pre-registrado en este curso.']);
        }

        // 4. Creamos el puente (La inscripción)
        Inscripcion::create([
            'curso_id' => $validated['curso_id'],
            'capacitando_id' => $capacitando->id,
            'estado' => 'pre-registrado',
        ]);

        // 5. Recargamos la página para limpiar el formulario
        return redirect()->route('registro.create');
    }
}