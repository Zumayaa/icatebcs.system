<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CapturistaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tab = $request->input('tab', 'todos');

        $query = Inscripcion::with(['capacitando', 'curso'])
            ->when($search, function ($q, $search) {
                $q->whereHas('capacitando', function ($sub) use ($search) {
                    $sub->where('curp', 'like', "%{$search}%")
                        ->orWhere('nombre_completo', 'like', "%{$search}%");
                });
            });

        if ($tab === 'pendientes') {
            $query->where('estado', 'pre-registrado');
        } elseif ($tab === 'validados') {
            $query->where('estado', 'validado');
        }

        $inscripciones = $query->orderBy('created_at', 'desc')->get();

        $stats = [
            'activos' => Inscripcion::where('estado', 'validado')->where('resultado', '!=', 'baja')->count(),
            'por_validar' => Inscripcion::where('estado', 'pre-registrado')->count(),
            'constancias' => Inscripcion::where('resultado', 'aprobado')->count(),
            'cursos' => Curso::where('activo', true)->count(),
        ];

        $sedes = DB::table('inscripciones')
            ->join('cursos', 'inscripciones.curso_id', '=', 'cursos.id')
            ->select('cursos.unidad_capacitacion as sede', DB::raw('count(*) as total'))
            ->groupBy('cursos.unidad_capacitacion')
            ->get();

        $totalInscripciones = Inscripcion::count() ?: 1;

        $demografia = $sedes->map(function ($item) use ($totalInscripciones) {
            return [
                'sede' => $item->sede,
                'total' => $item->total,
                'porcentaje' => round(($item->total / $totalInscripciones) * 100),
            ];
        });

        $edadesRaw = DB::table('capacitandos')
            ->pluck('fecha_nacimiento')
            ->map(fn ($fecha) => now()->diffInYears($fecha));

        $edades = [
            '15-17' => $edadesRaw->whereBetween('edad', [15, 17])->count(),
            '18-25' => $edadesRaw->whereBetween('edad', [18, 25])->count(),
            '26-35' => $edadesRaw->whereBetween('edad', [26, 35])->count(),
            '36-45' => $edadesRaw->whereBetween('edad', [36, 45])->count(),
            '46+' => $edadesRaw->where('edad', '>=', 46)->count(),
        ];

        return Inertia::render('Capturista/Index', [
            'inscripciones' => $inscripciones,
            'filters' => ['search' => $search, 'tab' => $tab],
            'stats' => $stats,
            'demografia' => $demografia,
            'edades' => $edades,
        ]);
    }

    public function validar(Request $request, $id)
    {
        $request->validate([
            'chk_id' => 'accepted',
            'chk_curp' => 'accepted',
            'chk_domicilio' => 'accepted',
            'chk_fotos' => 'accepted',
            'observaciones' => 'nullable|string|max:2000',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $inscripcion = Inscripcion::with(['capacitando', 'curso'])
                ->whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($inscripcion->estado === 'validado') {
                return back();
            }

            $validados = Inscripcion::where('curso_id', $inscripcion->curso_id)
                ->where('estado', 'validado')
                ->where('resultado', '!=', 'baja')
                ->count();

            if ($validados >= $inscripcion->curso->cupo_maximo) {
                return back()->withErrors(['curso_id' => 'No se puede validar: el grupo ya alcanzo su cupo maximo.']);
            }

            $inscripcion->update([
                'estado' => 'validado',
                'chk_id' => $request->boolean('chk_id'),
                'chk_curp' => $request->boolean('chk_curp'),
                'chk_domicilio' => $request->boolean('chk_domicilio'),
                'chk_fotos' => $request->boolean('chk_fotos'),
                'observaciones' => $request->input('observaciones'),
            ]);

            $capacitando = $inscripcion->capacitando;
            $numeroControl = $capacitando->numero_control
                ?: 'ICAT-' . now()->format('y') . '-' . str_pad($capacitando->id, 5, '0', STR_PAD_LEFT);

            $capacitando->update([
                'numero_control' => $numeroControl,
                'identificacion_validada' => true,
            ]);

            Log::info('Expediente validado', [
                'inscripcion_id' => $inscripcion->id,
                'capacitando_id' => $capacitando->id,
                'curso_id' => $inscripcion->curso_id,
                'user_id' => auth()->id(),
            ]);

            return back();
        });
    }

    public function imprimir($id)
    {
        $inscripcion = Inscripcion::with(['capacitando', 'curso'])->findOrFail($id);

        $alumno = $inscripcion->capacitando;
        $curso = $inscripcion->curso;
        $observaciones = $inscripcion->observaciones ?: 'Sin observaciones particulares en el expediente.';

        return response()->make("
            <html>
            <head>
                <title>Ficha de Inscripcion - ICATEBCS</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #800020; padding-bottom: 10px; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 22px; color: #800020; }
                    .header p { margin: 5px 0 0 0; font-size: 14px; color: gray; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-weight: bold; font-size: 14px; background: #f2f2f2; padding: 5px 10px; text-transform: uppercase; }
                    table { width: 100%; margin-top: 10px; border-collapse: collapse; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 14px; }
                    .label { font-weight: bold; width: 30%; }
                    .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
                    .signature-box { width: 40%; text-align: center; border-top: 1px solid #333; padding-top: 10px; font-size: 12px; }
                    .no-print-btn { background: #333; color: white; padding: 10px 20px; border: none; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
                    @media print { .no-print-btn { display: none; } }
                </style>
            </head>
            <body>
                <button class='no-print-btn' onclick='window.print()'>Imprimir Acuse</button>
                <div class='header'>
                    <h1>INSTITUTO DE CAPACITACION PARA LOS TRABAJADORES DEL ESTADO DE BAJA CALIFORNIA SUR</h1>
                    <p>Ficha oficial de inscripcion escolar</p>
                </div>
                <div class='section'>
                    <div class='section-title'>Datos del Alumno</div>
                    <table>
                        <tr><td class='label'>Numero de Control:</td><td style='font-weight:bold; color: #1e3a8a;'>" . e($alumno->numero_control) . "</td></tr>
                        <tr><td class='label'>Nombre Completo:</td><td>" . e($alumno->nombre_completo) . "</td></tr>
                        <tr><td class='label'>CURP:</td><td>" . e($alumno->curp) . "</td></tr>
                        <tr><td class='label'>Telefono:</td><td>" . e($alumno->telefono) . "</td></tr>
                        <tr><td class='label'>ID Cotejada:</td><td>" . e($alumno->tipo_identificacion) . "</td></tr>
                    </table>
                </div>
                <div class='section' style='margin-top: 30px;'>
                    <div class='section-title'>Detalles del Curso</div>
                    <table>
                        <tr><td class='label'>Curso:</td><td style='font-weight:bold;'>" . e($curso->nombre) . "</td></tr>
                        <tr><td class='label'>Unidad de Capacitacion:</td><td>" . e($curso->unidad_capacitacion) . "</td></tr>
                        <tr><td class='label'>Horario / Dias:</td><td>" . e($curso->hora_inicio) . " - " . e($curso->hora_fin) . " / " . e($curso->dias_semana) . "</td></tr>
                        <tr><td class='label'>Estatus en Sistema:</td><td>VALIDADO / ALTA OFICIAL</td></tr>
                    </table>
                </div>
                <div class='section' style='margin-top: 30px;'>
                    <div class='section-title'>Observaciones de Ventanilla</div>
                    <p style='font-size: 13px; font-style: italic; padding: 10px;'>" . e($observaciones) . "</p>
                </div>
                <div class='signatures'>
                    <div class='signature-box' style='margin-top: 50px;'>Firma del Capacitando</div>
                    <div class='signature-box' style='margin-top: 50px;'>Sello y firma de control escolar</div>
                </div>
            </body>
            </html>
        ", 200);
    }

    public function exportar()
    {
        $inscripciones = Inscripcion::with(['capacitando', 'curso'])->get();
        $filename = 'reporte_general_icatebcs_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($inscripciones) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Folio', 'No. Control', 'Nombre del Alumno', 'CURP', 'Telefono', 'Tipo ID', 'Curso Solicitado', 'Estado', 'Resultado']);
            foreach ($inscripciones as $ins) {
                fputcsv($file, [
                    $ins->id,
                    $ins->capacitando->numero_control ?? 'PENDIENTE',
                    $ins->capacitando->nombre_completo,
                    $ins->capacitando->curp,
                    $ins->capacitando->telefono,
                    $ins->capacitando->tipo_identificacion,
                    $ins->curso->nombre,
                    strtoupper($ins->estado),
                    strtoupper($ins->resultado ?? 'pendiente'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
