<?php

namespace App\Http\Controllers;

use App\Models\Capacitador;
use App\Models\Curso;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CursoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

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
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricula' => 'required|string|max:80|unique:cursos,matricula',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:4000',
            'unidad_capacitacion' => 'required|string|max:255',
            'capacitador_id' => 'required|exists:capacitadores,id',
            'dias_semana' => 'required|array|min:1',
            'dias_semana.*' => 'string|max:20',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'horas_totales' => 'required|integer|min:1',
            'modalidad' => 'required|string|max:80',
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
            'matricula' => 'required|string|max:80|unique:cursos,matricula,' . $id,
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:4000',
            'unidad_capacitacion' => 'required|string|max:255',
            'capacitador_id' => 'required|exists:capacitadores,id',
            'dias_semana' => 'required|array|min:1',
            'dias_semana.*' => 'string|max:20',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'horas_totales' => 'required|integer|min:1',
            'modalidad' => 'required|string|max:80',
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
        $curso->update(['activo' => ! $curso->activo]);

        return back();
    }

    public function exportar()
    {
        $cursos = Curso::with('capacitador')->get();
        $filename = 'catalogo_cursos_icatebcs_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($cursos) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Matricula', 'Nombre del Curso', 'Unidad Sede', 'Modalidad', 'Horas', 'Dias', 'Horario', 'Cupo', 'Costo', 'Instructor', 'Estado']);

            foreach ($cursos as $c) {
                fputcsv($file, [
                    $c->matricula,
                    $c->nombre,
                    $c->unidad_capacitacion,
                    $c->modalidad,
                    $c->horas_totales,
                    $c->dias_semana,
                    $c->hora_inicio . ' a ' . $c->hora_fin,
                    $c->cupo_maximo,
                    '$' . number_format($c->costo, 2),
                    $c->capacitador ? $c->capacitador->nombre : 'SIN ASIGNAR',
                    $c->activo ? 'ACTIVO' : 'PAUSADO',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function show($id)
    {
        $curso = Curso::with(['capacitador', 'inscripciones' => function ($query) {
            $query->where('estado', 'validado')
                ->where('resultado', '!=', 'baja')
                ->with('capacitando');
        }])->findOrFail($id);

        return Inertia::render('Admin/Cursos/Show', [
            'curso' => $curso,
        ]);
    }

    public function guardarAcreditacion(Request $request, $id)
    {
        $request->validate([
            'alumnos' => 'required|array',
            'alumnos.*.id' => 'required|exists:inscripciones,id',
            'alumnos.*.calificacion' => 'nullable|numeric|min:0|max:10',
            'alumnos.*.resultado' => 'required|in:pendiente,aprobado,reprobado,baja',
        ]);

        foreach ($request->alumnos as $alumnoData) {
            Inscripcion::where('id', $alumnoData['id'])
                ->where('curso_id', $id)
                ->update([
                    'calificacion' => $alumnoData['calificacion'],
                    'resultado' => $alumnoData['resultado'],
                ]);
        }

        Log::info('Acreditaciones guardadas', [
            'curso_id' => $id,
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Acreditaciones guardadas correctamente.');
    }

    public function bajaAlumno(Request $request, $cursoId, $inscripcionId)
    {
        $validated = $request->validate([
            'motivo' => 'nullable|string|max:1000',
        ]);

        $inscripcion = Inscripcion::where('curso_id', $cursoId)
            ->whereKey($inscripcionId)
            ->firstOrFail();

        $observaciones = trim(($inscripcion->observaciones ? $inscripcion->observaciones . "\n" : '') . 'Baja administrativa: ' . ($validated['motivo'] ?? 'Sin motivo capturado.'));

        $inscripcion->update([
            'resultado' => 'baja',
            'observaciones' => $observaciones,
        ]);

        Log::info('Alumno dado de baja', [
            'curso_id' => $cursoId,
            'inscripcion_id' => $inscripcionId,
            'user_id' => auth()->id(),
        ]);

        return back();
    }

    public function imprimirLista($id)
    {
        $curso = Curso::with(['capacitador', 'inscripciones' => function ($query) {
            $query->where('estado', 'validado')
                ->where('resultado', '!=', 'baja')
                ->with('capacitando');
        }])->findOrFail($id);

        $rows = $curso->inscripciones->values()->map(function ($inscripcion, $index) {
            return '<tr><td>' . ($index + 1) . '</td><td>' . e($inscripcion->capacitando->numero_control) . '</td><td>' . e($inscripcion->capacitando->nombre_completo) . '</td><td></td></tr>';
        })->implode('');

        return response()->make("
            <html>
            <head>
                <title>Lista de grupo - " . e($curso->matricula) . "</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 36px; color: #222; }
                    h1 { color: #6B1230; font-size: 22px; margin-bottom: 4px; }
                    p { margin: 3px 0; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                    th, td { border: 1px solid #bbb; padding: 9px; font-size: 12px; }
                    th { background: #f2f2f2; text-align: left; }
                    .no-print-btn { background: #333; color: white; padding: 10px 20px; border: none; margin-bottom: 20px; }
                    @media print { .no-print-btn { display: none; } }
                </style>
            </head>
            <body>
                <button class='no-print-btn' onclick='window.print()'>Imprimir Lista</button>
                <h1>Lista Oficial de Grupo</h1>
                <p><strong>Curso:</strong> " . e($curso->nombre) . "</p>
                <p><strong>Matricula:</strong> " . e($curso->matricula) . "</p>
                <p><strong>Docente:</strong> " . e(optional($curso->capacitador)->nombre ?? 'Sin asignar') . "</p>
                <p><strong>Sede y horario:</strong> " . e($curso->unidad_capacitacion) . ' / ' . e($curso->dias_semana) . ' / ' . e($curso->hora_inicio) . ' - ' . e($curso->hora_fin) . "</p>
                <table>
                    <thead><tr><th style='width:40px;'>No.</th><th style='width:160px;'>No. Control</th><th>Alumno</th><th style='width:220px;'>Firma / Observacion</th></tr></thead>
                    <tbody>$rows</tbody>
                </table>
            </body>
            </html>
        ", 200);
    }

    public function constancia($cursoId, $inscripcionId)
    {
        $inscripcion = Inscripcion::with(['curso', 'capacitando'])
            ->where('curso_id', $cursoId)
            ->whereKey($inscripcionId)
            ->where('resultado', 'aprobado')
            ->firstOrFail();

        return response()->make("
            <html>
            <head>
                <title>Constancia - " . e($inscripcion->capacitando->numero_control) . "</title>
                <style>
                    body { font-family: Georgia, serif; margin: 60px; text-align: center; color: #222; }
                    .frame { border: 8px double #6B1230; padding: 55px 45px; min-height: 620px; }
                    h1 { color: #6B1230; font-size: 34px; margin: 0 0 40px; }
                    .name { font-size: 28px; font-weight: bold; margin: 28px 0; }
                    p { font-size: 18px; line-height: 1.7; }
                    .meta { font-family: Arial, sans-serif; font-size: 13px; margin-top: 40px; color: #555; }
                    .no-print-btn { background: #333; color: white; padding: 10px 20px; border: none; margin-bottom: 20px; }
                    @media print { .no-print-btn { display: none; } }
                </style>
            </head>
            <body>
                <button class='no-print-btn' onclick='window.print()'>Imprimir Constancia</button>
                <div class='frame'>
                    <h1>CONSTANCIA</h1>
                    <p>El Instituto de Capacitacion para los Trabajadores del Estado de Baja California Sur hace constar que:</p>
                    <div class='name'>" . e($inscripcion->capacitando->nombre_completo) . "</div>
                    <p>acredito satisfactoriamente el curso <strong>" . e($inscripcion->curso->nombre) . "</strong>, con una calificacion de <strong>" . e($inscripcion->calificacion ?? 'N/A') . "</strong>.</p>
                    <p class='meta'>No. Control: " . e($inscripcion->capacitando->numero_control) . ' | Matricula de curso: ' . e($inscripcion->curso->matricula) . ' | Fecha: ' . e(now()->format('d/m/Y')) . "</p>
                </div>
            </body>
            </html>
        ", 200);
    }
}
