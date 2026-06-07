<?php

namespace App\Http\Controllers;

use App\Models\Capacitando;
use App\Models\Curso;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    public function create()
    {
        $cursos = Curso::where('activo', true)
            ->get(['id', 'nombre', 'unidad_capacitacion', 'dias_semana', 'hora_inicio', 'hora_fin']);

        return Inertia::render('Registro/Index', [
            'cursos' => $cursos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'curso_id' => [
                'required',
                Rule::exists('cursos', 'id')->where('activo', true),
            ],
            'nombre_completo' => 'required|string|max:255',
            'telefono' => 'required|digits:10',
            'curp' => ['required', 'string', 'size:18', 'regex:/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/'],
            'fecha_nacimiento' => [
                'required',
                'date',
                'before_or_equal:' . now()->subYears(15)->format('Y-m-d'),
            ],
            'tipo_identificacion' => 'required|string|max:80',
        ], [
            'curso_id.exists' => 'El curso seleccionado ya no esta disponible.',
            'telefono.digits' => 'El telefono debe tener exactamente 10 digitos.',
            'curp.regex' => 'La CURP no tiene un formato valido.',
            'fecha_nacimiento.before_or_equal' => 'Debes tener al menos 15 anos cumplidos para inscribirte.',
        ]);

        return DB::transaction(function () use ($validated) {
            $curso = Curso::where('activo', true)
                ->whereKey($validated['curso_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $inscripcionesVigentes = Inscripcion::where('curso_id', $curso->id)
                ->where('resultado', '!=', 'baja')
                ->count();

            if ($inscripcionesVigentes >= $curso->cupo_maximo) {
                return back()->withErrors(['curso_id' => 'El cupo de este curso ya esta lleno.']);
            }

            $capacitando = Capacitando::firstOrCreate(
                ['curp' => $validated['curp']],
                [
                    'nombre_completo' => $validated['nombre_completo'],
                    'telefono' => $validated['telefono'],
                    'fecha_nacimiento' => Carbon::parse($validated['fecha_nacimiento'])->format('Y-m-d'),
                    'tipo_identificacion' => $validated['tipo_identificacion'],
                ]
            );

            $capacitando->update([
                'nombre_completo' => $validated['nombre_completo'],
                'telefono' => $validated['telefono'],
                'fecha_nacimiento' => Carbon::parse($validated['fecha_nacimiento'])->format('Y-m-d'),
                'tipo_identificacion' => $validated['tipo_identificacion'],
            ]);

            $inscripcionExistente = Inscripcion::where('curso_id', $curso->id)
                ->where('capacitando_id', $capacitando->id)
                ->first();

            if ($inscripcionExistente) {
                return back()->withErrors(['curso_id' => 'Ya estas pre-registrado en este curso.']);
            }

            Inscripcion::create([
                'curso_id' => $curso->id,
                'capacitando_id' => $capacitando->id,
                'estado' => 'pre-registrado',
                'resultado' => 'pendiente',
            ]);

            return redirect()->route('registro.create');
        });
    }
}
