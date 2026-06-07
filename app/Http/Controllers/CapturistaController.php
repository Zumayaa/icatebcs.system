<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscripcion;
use App\Models\Curso;
use App\Models\Capacitando;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CapturistaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tab = $request->input('tab', 'todos');

        // 1. CONSULTA PRINCIPAL PARA LA TABLA (Con buscador y pestañas)
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

        // 2. INDICADORES (KPIs) REALES
        $stats = [
            'activos' => Inscripcion::where('estado', 'validado')->count(),
            'por_validar' => Inscripcion::where('estado', 'pre-registrado')->count(),
            'constancias' => Inscripcion::where('estado', 'aprobado')->count(),
            'cursos' => Curso::where('activo', true)->count(),
        ];

        // 3. DEMOGRAFÍA POR SEDE (Gráfica de barras) - Arreglado el error del GROUP BY
        $sedes = DB::table('inscripciones')
            ->join('cursos', 'inscripciones.curso_id', '=', 'cursos.id')
            ->select('cursos.unidad_capacitacion as sede', DB::raw('count(*) as total'))
            ->groupBy('cursos.unidad_capacitacion')
            ->get();
        
        $totalInscripciones = Inscripcion::count() ?: 1; 
        
        $demografia = $sedes->map(function($item) use ($totalInscripciones) {
            return [
                'sede' => $item->sede,
                'total' => $item->total,
                'porcentaje' => round(($item->total / $totalInscripciones) * 100)
            ];
        });

        // 4. DISTRIBUCIÓN POR EDAD (Para gráfica de Chart.js)
        $edadesRaw = DB::table('capacitandos')
            ->selectRaw('TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad')
            ->get();
            
        $edades = [
            '18-25' => $edadesRaw->whereBetween('edad', [18, 25])->count(),
            '26-35' => $edadesRaw->whereBetween('edad', [26, 35])->count(),
            '36-45' => $edadesRaw->whereBetween('edad', [36, 45])->count(),
            '46+' => $edadesRaw->where('edad', '>=', 46)->count(),
        ];

        // Mandamos todo a React
        return Inertia::render('Capturista/Index', [
            'inscripciones' => $inscripciones,
            'filters' => ['search' => $search, 'tab' => $tab],
            'stats' => $stats,
            'demografia' => $demografia,
            'edades' => $edades
        ]);
    }

    // Procesa el modal: guarda checklist, notas y crea el No. de Control
    public function validar(Request $request, $id)
    {
        // 1. BLINDAJE: Si alguien intenta hackear y manda la petición sin los checks, Laravel la rebota
        $request->validate([
            'chk_id' => 'accepted',
            'chk_curp' => 'accepted',
            'chk_domicilio' => 'accepted',
            'chk_fotos' => 'accepted',
        ]);

        // 2. Si pasó el candado, procedemos a guardar
        $inscripcion = Inscripcion::findOrFail($id);
        
        $inscripcion->update([
            'estado' => 'validado',
            'chk_id' => $request->boolean('chk_id'),
            'chk_curp' => $request->boolean('chk_curp'),
            'chk_domicilio' => $request->boolean('chk_domicilio'),
            'chk_fotos' => $request->boolean('chk_fotos'),
            'observaciones' => $request->input('observaciones'),
        ]);

        $capacitando = $inscripcion->capacitando;
        if (!$capacitando->numero_control) {
            $prefijo = "ICAT-26-";
            $nuevoNoControl = $prefijo . str_pad($capacitando->id, 5, '0', STR_PAD_LEFT);
            
            $capacitando->update([
                'numero_control' => $nuevoNoControl,
                'identificacion_validada' => true
            ]);
        } else {
            $capacitando->update(['identificacion_validada' => true]);
        }

        return back();
    }

    // Acuse de Recibo listo para la impresora
    public function imprimir($id)
    {
        $inscripcion = Inscripcion::with(['capacitando', 'curso'])->findOrFail($id);
        
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
                    <p>Ficha oficial de inscripcion escolar (Sistema hibrido portal)</p>
                </div>

                <div class='section'>
                    <div class='section-title'>Datos del Alumno</div>
                    <table>
                        <tr><td class='label'>Numero de Control:</td><td style='font-weight:bold; color: #1e3a8a;'>{$inscripcion->capacitando->numero_control}</td></tr>
                        <tr><td class='label'>Nombre Completo:</td><td>{$inscripcion->capacitando->nombre_completo}</td></tr>
                        <tr><td class='label'>CURP:</td><td>{$inscripcion->capacitando->curp}</td></tr>
                        <tr><td class='label'>Telefono:</td><td>{$inscripcion->capacitando->telefono}</td></tr>
                        <tr><td class='label'>ID Cotejada:</td><td>{$inscripcion->capacitando->tipo_identificacion}</td></tr>
                    </table>
                </div>

                <div class='section' style='margin-top: 30px;'>
                    <div class='section-title'>Detalles del Curso</div>
                    <table>
                        <tr><td class='label'>Curso:</td><td style='font-weight:bold;'>{$inscripcion->curso->nombre}</td></tr>
                        <tr><td class='label'>Unidad de Capacitacion:</td><td>{$inscripcion->curso->unidad_capacitacion}</td></tr>
                        <tr><td class='label'>Horario / Dias:</td><td>{$inscripcion->curso->hora_inicio} - {$inscripcion->curso->hora_fin} / {$inscripcion->curso->dias_semana}</td></tr>
                        <tr><td class='label'>Estatus en Sistema:</td><td>VALIDADO / ALTA OFICIAL</td></tr>
                    </table>
                </div>

                <div class='section' style='margin-top: 30px;'>
                    <div class='section-title'>Observaciones de Ventanilla</div>
                    <p style='font-size: 13px; font-style: italic; padding: 10px;'>
                        " . ($inscripcion->observaciones ?? 'Sin observaciones particulares en el expediente.') . "
                    </p>
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
        $filename = "reporte_general_icatebcs_" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache", "Cache-Control" => "must-revalidate, post-check=0, pre-check=0", "Expires" => "0"
        ];
        
        $callback = function() use($inscripciones) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Folio', 'No. Control', 'Nombre del Alumno', 'CURP', 'Telefono', 'Tipo ID', 'Curso Solicitado', 'Estado']);
            foreach ($inscripciones as $ins) {
                fputcsv($file, [
                    $ins->id, $ins->capacitando->numero_control ?? 'PENDIENTE', $ins->capacitando->nombre_completo,
                    $ins->capacitando->curp, $ins->capacitando->telefono, $ins->capacitando->tipo_identificacion,
                    $ins->curso->nombre, strtoupper($ins->estado)
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}