import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Show({ curso }) {
    const [activeTab, setActiveTab] = useState('alumnos');

    const alumnos = curso.inscripciones || [];

    return (
        <AdminLayout>
            <Head title={`${curso.matricula} - ICATEBCS`} />

            <section className="animate-[fadeIn_0.35s_ease_both]">
                
                {/* Botón de regreso */}
                <Link href="/admin/cursos" className="inline-flex items-center text-sm font-bold text-[#6B1230] hover:text-[#4A0B20] mb-4 transition">
                    ← Volver al Catálogo
                </Link>

                {/* Cabecera del Curso */}
                <div className="bg-white rounded-2xl shadow-sm border border-[rgba(107,18,48,.09)] p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded mb-2">
                                MATRÍCULA: {curso.matricula}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">{curso.nombre}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                📍 {curso.unidad_capacitacion} | 🗓️ {curso.dias_semana} ({curso.hora_inicio.substring(0,5)} a {curso.hora_fin.substring(0,5)})
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase">Docente Titular</p>
                            {curso.capacitador ? (
                                <div className="person-pill teacher inline-flex mt-1">
                                    <span>{curso.capacitador.nombre.substring(0,2)}</span>
                                    {curso.capacitador.nombre}
                                </div>
                            ) : (
                                <span className="text-red-500 font-bold text-sm">Sin Asignar</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ════════ CONTENEDOR UNIFICADO DE PESTAÑAS Y TABLA ════════ */}
                <div className="mt-8">
                    
                    {/* Menú de Pestañas (Z-10 para que quede encima del borde de la tabla) */}
                    <div className="flex mb-0 relative z-10">
                        <div className="tabs">
                            <button onClick={() => setActiveTab('alumnos')} className={`tab ${activeTab === 'alumnos' ? 'active' : ''}`}>
                                👥 Alumnos Inscritos ({alumnos.length})
                            </button>
                            <button onClick={() => setActiveTab('asistencia')} className={`tab ${activeTab === 'asistencia' ? 'active' : ''}`}>
                                📝 Pase de Asistencia
                            </button>
                            <button onClick={() => setActiveTab('calificaciones')} className={`tab ${activeTab === 'calificaciones' ? 'active' : ''}`}>
                                🎓 Calificaciones
                            </button>
                        </div>
                    </div>

                    {/* Contenedor Principal (Z-0) */}
                    <div className="dash-panel overflow-hidden relative z-0 min-h-[400px]">
                        
                        {/* ════ PESTAÑA: ALUMNOS ════ */}
                        {activeTab === 'alumnos' && (
                            <div className="animate-[fadeIn_0.3s_ease]">
                                <div className="dash-panel-header flex justify-between items-center bg-gray-50/50 border-b border-[rgba(107,18,48,.09)]">
                                    <h3 className="dash-panel-title">Lista Oficial de Grupo</h3>
                                    <button className="btn-mas-info !text-[#6B1230] !border-[#6B1230] hover:!bg-[#6B1230] hover:!text-white">
                                        🖨️ Imprimir Lista
                                    </button>
                                </div>
                                <div className="cursos-table-wrap !p-0">
                                    <table className="cursos-table !mt-0 w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">No.</th>
                                                <th>No. Control / Alumno</th>
                                                <th>Contacto</th>
                                                <th>Estatus Escolar</th>
                                                <th className="text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alumnos.map((ins, idx) => (
                                                <tr key={ins.id}>
                                                    <td className="text-center font-bold text-gray-400">{idx + 1}</td>
                                                    <td>
                                                        <div className="font-mono text-xs text-[#6B1230] font-bold mb-0.5">
                                                            {ins.capacitando?.numero_control}
                                                        </div>
                                                        <div className="font-bold text-gray-900">{ins.capacitando?.nombre_completo}</div>
                                                        <div className="text-xs text-gray-500 uppercase">{ins.capacitando?.curp}</div>
                                                    </td>
                                                    <td>
                                                        <span className="text-sm text-gray-700">📞 {ins.capacitando?.telefono}</span>
                                                    </td>
                                                    <td>
                                                        <span className="estatus-badge aprobado">
                                                            <span className="estatus-dot"></span> REGULAR
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="text-xs font-bold text-gray-500 hover:text-red-600 transition">
                                                            Dar de baja
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {alumnos.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                                        Aún no hay alumnos validados en este grupo.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ════ PESTAÑA: CALIFICACIONES (ACREDITACIÓN FINAL) ════ */}
                        {activeTab === 'calificaciones' && (
                            <div className="animate-[fadeIn_0.3s_ease]">
                                <div className="dash-panel-header flex justify-between items-center bg-gray-50/50 border-b border-[rgba(107,18,48,.09)]">
                                    <div>
                                        <h3 className="dash-panel-title">Asentamiento de Calificaciones</h3>
                                        <p className="text-xs text-gray-500">Cierre oficial de grupo. Captura la calificación y el resultado final.</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            router.post(`/admin/cursos/${curso.id}/acreditacion`, { alumnos }, { preserveScroll: true, onSuccess: () => alert('✅ Calificaciones guardadas con éxito.') });
                                        }}
                                        className="btn-mas-info !bg-[#6B1230] !text-white hover:!bg-[#4A0B20]"
                                    >
                                        💾 Guardar Evaluación Final
                                    </button>
                                </div>
                                <div className="cursos-table-wrap !p-0">
                                    <table className="cursos-table !mt-0 w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">No.</th>
                                                <th>Número de Control / Alumno</th>
                                                <th className="w-32 text-center">Calificación (0-10)</th>
                                                <th className="w-48 text-center">Resultado Final</th>
                                                <th className="text-center w-32">Constancia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alumnos.map((ins, idx) => (
                                                <tr key={ins.id} className={ins.resultado === 'baja' ? 'opacity-50 bg-gray-50' : ''}>
                                                    <td className="text-center font-bold text-gray-400">{idx + 1}</td>
                                                    <td>
                                                        <div className="font-mono text-xs text-gray-500 mb-0.5">{ins.capacitando?.numero_control}</div>
                                                        <div className="font-bold text-gray-900">{ins.capacitando?.nombre_completo}</div>
                                                    </td>
                                                    <td className="text-center p-2">
                                                        <input 
                                                            type="number" 
                                                            min="0" max="10" step="0.1"
                                                            defaultValue={ins.calificacion || ''}
                                                            onChange={(e) => { ins.calificacion = e.target.value; }}
                                                            className="w-full text-center rounded border-gray-300 shadow-sm focus:border-[#6B1230] focus:ring-[#6B1230] text-sm py-1.5"
                                                            placeholder="-"
                                                        />
                                                    </td>
                                                    <td className="text-center p-2">
                                                        <select 
                                                            defaultValue={ins.resultado || 'pendiente'}
                                                            onChange={(e) => { ins.resultado = e.target.value; }}
                                                            className={`w-full rounded border-gray-300 shadow-sm focus:border-[#6B1230] focus:ring-[#6B1230] text-sm py-1.5 font-semibold
                                                                ${ins.resultado === 'aprobado' ? 'text-green-700 bg-green-50' : (ins.resultado === 'reprobado' ? 'text-red-700 bg-red-50' : 'text-gray-600')}`}
                                                        >
                                                            <option value="pendiente">Pendiente</option>
                                                            <option value="aprobado">Aprobado</option>
                                                            <option value="reprobado">Reprobado</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="text-center">
                                                        {ins.resultado === 'aprobado' ? (
                                                            <button className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded border border-blue-200">
                                                                🖨️ Generar PDF
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No disponible</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </section>
        </AdminLayout>
    );
}