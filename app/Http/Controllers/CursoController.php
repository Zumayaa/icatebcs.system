<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso;
use App\Models\Capacitador;
use Inertia\Inertia;

class CursoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Motor de búsqueda en vivo por nombre o clave (matrícula)
        $cursos = Curso::with('capacitador')
            ->when($search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%")
                      ->orWhere('matricula', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        $capacitadores = Capacitador::orderBy('nombre', 'asc')->get(['id', 'nombre']);

        return Inertia::render('Admin/Cursos/Index', [
            'cursos' => $cursos,
            'capacitadores' => $capacitadores,
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricula' => 'required|string|unique:cursos,matricula',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'unidad_capacitacion' => 'required|string|max:255',
            'capacitador_id' => 'required|exists:capacitadores,id',
            'dias_semana' => 'required|array|min:1',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'horas_totales' => 'required|integer|min:1',
            'modalidad' => 'required|string',
            'cupo_maximo' => 'required|integer|min:1',
            'costo' => 'required|numeric|min:0',
            'activo' => 'boolean',
        ]);

        $validated['dias_semana'] = implode(', ', $validated['dias_semana']);

        Curso::create($validated);
        return back();
    }

    public function update(Request $request, $id)
    {
        $curso = Curso::findOrFail($id);

        $validated = $request->validate([
            'matricula' => 'required|string|unique:cursos,matricula,' . $id,
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'unidad_capacitacion' => 'required|string|max:255',
            'capacitador_id' => 'required|exists:capacitadores,id',
            'dias_semana' => 'required|array|min:1',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'horas_totales' => 'required|integer|min:1',
            'modalidad' => 'required|string',
            'cupo_maximo' => 'required|integer|min:1',
            'costo' => 'required|numeric|min:0',
            'activo' => 'boolean',
        ]);

        $validated['dias_semana'] = implode(', ', $validated['dias_semana']);

        $curso->update($validated);
        return back();
    }

    public function toggleActivo($id)
    {
        $curso = Curso::findOrFail($id);
        $curso->update(['activo' => !$curso->activo]);
        return back();
    }
}