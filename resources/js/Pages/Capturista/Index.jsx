import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Index({ inscripciones, filters, stats, demografia, edades }) {
    // Estados para la búsqueda y pestañas
    const [search, setSearch] = useState(filters?.search || '');
    const [tab, setTab] = useState(filters?.tab || 'todos');

    // Estados y Formulario para el Modal de Validación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIns, setSelectedIns] = useState(null);
    const { data: formData, setData: setFormData, post, processing, reset } = useForm({
        chk_id: false,
        chk_curp: false,
        chk_domicilio: false,
        chk_fotos: false,
        observaciones: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/capturista', { search, tab }, { preserveState: true });
    };

    const handleTabChange = (newTab) => {
        setTab(newTab);
        router.get('/capturista', { search, tab: newTab }, { preserveState: true });
    };

    // Funciones del Modal
    const openValidationModal = (ins) => {
        setSelectedIns(ins);
        setFormData({
            chk_id: false,
            chk_curp: false,
            chk_domicilio: false,
            chk_fotos: false,
            observaciones: '',
        });
        setIsModalOpen(true);
    };

    const handleValidationSubmit = (e) => {
        e.preventDefault();

        // VALIDACIÓN: Si falta un solo documento, no lo dejamos pasar
        if (!formData.chk_id || !formData.chk_curp || !formData.chk_domicilio || !formData.chk_fotos) {
            alert('EXPEDIENTE INCOMPLETO: El alumno debe entregar TODOS los documentos físicos del checklist para generar su matrícula oficial.');
            return; // Cortamos la ejecución aquí
        }

        post(`/capturista/validar/${selectedIns.id}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                alert('¡Expediente validado! Se ha generado su matrícula oficial.');
            }
        });
    };

    const chartEdadData = {
        labels: Object.keys(edades),
        datasets: [{
            label: 'Alumnos',
            data: Object.values(edades),
            backgroundColor: '#6B1230',
            borderRadius: 6,
            barPercentage: 0.6
        }]
    };

    return (
        <AdminLayout>
            <Head title="Ventanilla - ICATEBCS" />

            <section className="animate-[fadeIn_0.35s_ease_both]">
                <div className="section-header">
                    <span className="section-eyebrow">Panel Operativo</span>
                    <h2 className="section-title">Ventanilla de Control Escolar</h2>
                    <p className="section-sub">Resumen de inscripciones y validación de expedientes.</p>
                </div>

                {/* 1. KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card accent-guinda"><div className="kpi-value">{stats.activos}</div><div className="kpi-label">Alumnos Activos</div></div>
                    <div className="kpi-card accent-gold"><div className="kpi-value">{stats.por_validar}</div><div className="kpi-label">Por Validar</div></div>
                    <div className="kpi-card accent-blue"><div className="kpi-value">{stats.constancias}</div><div className="kpi-label">Constancias</div></div>
                    <div className="kpi-card accent-green"><div className="kpi-value">{stats.cursos}</div><div className="kpi-label">Cursos Ofertados</div></div>
                </div>

                {/* 2. GRÁFICAS */}
                <div className="dashboard-row mb-10">
                    <div className="dash-panel">
                        <div className="dash-panel-header"><h3 className="dash-panel-title">Inscripciones por Sede</h3></div>
                        <div className="chart-bars p-4">
                            {demografia.map((item, idx) => (
                                <div key={idx} className="chart-bar-row">
                                    <div className="chart-bar-label">{item.sede}</div>
                                    <div className="chart-bar-track"><div className="chart-bar-fill" style={{ width: `${item.porcentaje}%` }}></div></div>
                                    <div className="chart-bar-count">{item.total}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dash-panel">
                        <div className="dash-panel-header"><h3 className="dash-panel-title">Distribución por Edad</h3></div>
                        <div className="chart-wrapper p-4"><Bar data={chartEdadData} options={{ maintainAspectRatio: false }} /></div>
                    </div>
                </div>

                {/* 3. TABLA Y PESTAÑAS (Estéticamente unidas) */}
                <div className="mt-8">
                    
                    {/* Cabecera de la tabla con pestañas pegadas */}
                    <div className="flex flex-col sm:flex-row justify-between items-end mb-0 relative z-10">
                        <div className="tabs">
                            <button onClick={() => handleTabChange('todos')} className={`tab ${tab === 'todos' ? 'active' : ''}`}>
                                Todos
                            </button>
                            <button onClick={() => handleTabChange('pendientes')} className={`tab ${tab === 'pendientes' ? 'active' : ''}`}>
                                Pendientes
                            </button>
                            <button onClick={() => handleTabChange('validados')} className={`tab ${tab === 'validados' ? 'active' : ''}`}>
                                Validados
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="mb-2 sm:mb-2 w-full sm:w-80 z-20">
                            <input 
                                type="text" 
                                className="mini-search" 
                                placeholder="Buscar Nombre o CURP..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                            />
                        </form>
                    </div>

                    {/* Contenedor de la tabla (Z-0 para que las pestañas se sobrepongan) */}
                    <div className="dash-panel overflow-hidden relative z-0">
                        <div className="cursos-table-wrap !p-0">
                            <table className="cursos-table !mt-0 w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th>Folio</th>
                                        <th>Aspirante / CURP</th>
                                        <th>Curso Solicitado</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inscripciones.map((ins) => (
                                        <tr key={ins.id}>
                                            <td className="font-bold text-gray-500">#{ins.id}</td>
                                            <td>
                                                <div className="font-bold text-gray-900">{ins.capacitando?.nombre_completo}</div>
                                                <div className="font-mono text-xs text-gray-500">{ins.capacitando?.curp}</div>
                                            </td>
                                            <td>
                                                <div className="font-semibold text-[#6B1230]">{ins.curso?.nombre}</div>
                                                <div className="text-xs text-gray-500">{ins.curso?.unidad_capacitacion}</div>
                                            </td>
                                            <td>
                                                <span className={`estatus-badge ${ins.estado === 'validado' ? 'aprobado' : (ins.estado === 'pre-registrado' ? 'baja' : 'encurso')}`}>
                                                    <span className="estatus-dot"></span>
                                                    {ins.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {ins.estado === 'pre-registrado' && (
                                                        <button 
                                                            className="btn-mas-info !text-green-700 !border-green-300 hover:!bg-green-50"
                                                            onClick={() => openValidationModal(ins)}
                                                        >
                                                            Validar
                                                        </button>
                                                    )}
                                                    {ins.estado === 'validado' && (
                                                        <a 
                                                            href={`/capturista/imprimir/${ins.id}`} 
                                                            target="_blank"
                                                            className="btn-mas-info"
                                                        >
                                                            Acuse
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {inscripciones.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-12 text-gray-400">No hay registros para mostrar en esta vista.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTÓN FLOTANTE */}
            <a href="/capturista/exportar" className="fab-export flex items-center gap-2">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span>Exportar Padrón</span>
            </a>

            {/* ════════ MODAL DE VALIDACIÓN DE EXPEDIENTES ════════ */}
            {isModalOpen && selectedIns && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Validación de Expediente</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">{selectedIns.capacitando?.nombre_completo}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
                        </div>
                        <form onSubmit={handleValidationSubmit} className="p-6 space-y-5">
                            
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                <p className="text-xs text-yellow-800 font-semibold mb-2 uppercase">Cotejo de Documentos Físicos (Checklist)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.chk_id} onChange={(e) => setFormData('chk_id', e.target.checked)} className="rounded text-[#6B1230] focus:ring-[#6B1230]" /> Identidad Oficial (INE/Pasaporte)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.chk_curp} onChange={(e) => setFormData('chk_curp', e.target.checked)} className="rounded text-[#6B1230] focus:ring-[#6B1230]" /> CURP Actualizada
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.chk_domicilio} onChange={(e) => setFormData('chk_domicilio', e.target.checked)} className="rounded text-[#6B1230] focus:ring-[#6B1230]" /> Comprobante de Domicilio
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.chk_fotos} onChange={(e) => setFormData('chk_fotos', e.target.checked)} className="rounded text-[#6B1230] focus:ring-[#6B1230]" /> Fotografías Tamaño Infantil
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas de Control Escolar (Ventanilla)</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Agrega una nota interna si falta algo, ej. 'Quedó de traer foto mañana...'"
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData('observaciones', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6B1230] focus:ring-[#6B1230] text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded text-xs">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="btn-search py-2 px-6 shadow disabled:opacity-50">
                                    {processing ? 'Procesando...' : 'Validar y Generar Matrícula'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}