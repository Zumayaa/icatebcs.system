import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

const DIAS_PERMITIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function Index({ cursos, capacitadores, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Debounce para la barra de búsqueda (300ms)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/cursos', { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        matricula: '', nombre: '', descripcion: '', unidad_capacitacion: 'La Paz',
        capacitador_id: '', dias_semana: [], hora_inicio: '', hora_fin: '',
        horas_totales: 20, modalidad: 'Presencial', cupo_maximo: 20, costo: 0, activo: true,
    });

    const openCreateModal = () => { reset(); setEditMode(false); setIsModalOpen(true); };

    const openEditModal = (curso) => {
        setSelectedId(curso.id);
        setData({
            matricula: curso.matricula, nombre: curso.nombre, descripcion: curso.descripcion || '',
            unidad_capacitacion: curso.unidad_capacitacion, capacitador_id: curso.capacitador_id,
            dias_semana: curso.dias_semana ? curso.dias_semana.split(', ') : [],
            hora_inicio: curso.hora_inicio.substring(0, 5), hora_fin: curso.hora_fin.substring(0, 5),
            horas_totales: curso.horas_totales, modalidad: curso.modalidad,
            cupo_maximo: curso.cupo_maximo, costo: curso.costo, activo: Boolean(curso.activo),
        });
        setEditMode(true); setIsModalOpen(true);
    };

    const handleDiaChange = (dia) => {
        let nuevosDias = [...data.dias_semana];
        if (nuevosDias.includes(dia)) nuevosDias = nuevosDias.filter(d => d !== dia);
        else nuevosDias.push(dia);
        setData('dias_semana', nuevosDias);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) put(`/admin/cursos/${selectedId}`, { onSuccess: () => setIsModalOpen(false) });
        else post('/admin/cursos', { onSuccess: () => { setIsModalOpen(false); reset(); } });
    };

    return (
        <AdminLayout>
            <Head title="Cursos - ICATEBCS" />

            <section className="animate-[fadeIn_0.35s_ease_both]">
                
                {/* Cabecera Interactiva con CSS Nativo */}
                <div className="split-header mb-6">
                    <div>
                        <h2 className="section-title">Catálogo de cursos</h2>
                        <p className="section-sub">Oferta educativa estatal activa y control de asignaciones.</p>
                    </div>

                    <div className="toolbar-search flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <input 
                            type="text" 
                            className="mini-search w-full sm:w-64" 
                            placeholder="Buscar por matrícula o nombre..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value.toUpperCase())} 
                        />
                        <button onClick={openCreateModal} className="btn-search whitespace-nowrap justify-center">
                            Aperturar curso
                        </button>
                    </div>
                </div>

                {/* Grid de Tarjetas de Curso */}
                <div className="course-grid">
                    {cursos.map(curso => (
                        <div key={curso.id} className="course-card">
                            <div className="course-card-head">
                                <div>
                                    <p className="course-code">{curso.matricula}</p>
                                    <h3>{curso.nombre}</h3>
                                    <p>{curso.unidad_capacitacion} · {curso.dias_semana} ({curso.hora_inicio.substring(0,5)} a {curso.hora_fin.substring(0,5)})</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`estatus-badge ${curso.activo ? 'aprobado' : 'baja'}`}>
                                        <span className="estatus-dot"></span>
                                        {curso.activo ? 'ACTIVO' : 'PAUSADO'}
                                    </span>
                                </div>
                            </div>

                            <div className="course-relationship">
                                <div className="relationship-block">
                                    <span className="relationship-label">Docente Asignado</span>
                                    {curso.capacitador ? (
                                        <div className="person-pill teacher">
                                            <span>{curso.capacitador.nombre.substring(0,2)}</span>
                                            {curso.capacitador.nombre}
                                        </div>
                                    ) : (
                                        <p className="muted-empty text-xs">⚠️ Sin docente asignado</p>
                                    )}
                                </div>
                                <div className="relationship-block">
                                    <span className="relationship-label">Detalles Logísticos</span>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`chip ${curso.modalidad === 'Presencial' ? 'chip-valid' : 'chip-m'}`}>{curso.modalidad}</span>
                                        <span className="chip bg-gray-100 text-gray-700">{curso.horas_totales} hrs</span>
                                        <span className="chip bg-gray-100 text-gray-700">👥 Max: {curso.cupo_maximo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100/50 mt-1">
                                <button onClick={() => openEditModal(curso)} className="btn-mas-info w-full">
                                    Modificar
                                </button>
                                <button 
                                    onClick={() => router.patch(`/admin/cursos/${curso.id}/toggle`)} 
                                    className={`btn-mas-info w-full ${curso.activo ? '!text-orange-700 !border-orange-300 hover:!bg-orange-50' : '!text-green-700 !border-green-300 hover:!bg-green-50'}`}
                                >
                                    {curso.activo ? 'Pausar curso' : 'Reactivar'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {cursos.length === 0 && (
                        <div className="empty-panel text-center py-10">
                            No se encontraron cursos activos con ese criterio.
                        </div>
                    )}
                </div>
            </section>

            {/* BOTÓN FLOTANTE PARA EXCEL */}
            <a href="/admin/cursos/exportar" className="fab-export flex items-center gap-2">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span>Exportar Excel</span>
            </a>

            {/* MODAL DE APERTURA / EDICIÓN */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content !max-w-2xl">
                        <div className="modal-header">
                            <h3 className="text-base font-bold text-gray-800">
                                {editMode ? 'Modificar Parámetros de Curso' : 'Apertura de Nuevo Curso Oficial'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Matrícula *</label>
                                    <input type="text" value={data.matricula} onChange={(e) => setData('matricula', e.target.value.toUpperCase().replace(/\s/g, ''))} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                    {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Nombre del Curso *</label>
                                    <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value.toUpperCase())} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase">Descripción / Objetivo</label>
                                <textarea rows="2" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Sede *</label>
                                    <select value={data.unidad_capacitacion} onChange={(e) => setData('unidad_capacitacion', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]">
                                        <option value="La Paz">La Paz</option><option value="Los Cabos">Los Cabos</option><option value="Comondú">Comondú</option><option value="Loreto">Loreto</option><option value="Mulegé">Mulegé</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Modalidad *</label>
                                    <select value={data.modalidad} onChange={(e) => setData('modalidad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]">
                                        <option value="Presencial">Presencial</option><option value="En Línea">En Línea</option><option value="Híbrido">Híbrido</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Horas Totales *</label>
                                    <input type="number" value={data.horas_totales} onChange={(e) => setData('horas_totales', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                            </div>

                            <div className="bg-[#FAF7F2] p-3 rounded-md border border-[rgba(201,168,76,.4)]">
                                <label className="block text-xs font-bold text-[#6B1230] uppercase">Instructor Responsable *</label>
                                <select value={data.capacitador_id} onChange={(e) => setData('capacitador_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required>
                                    <option value="">Selecciona un maestro...</option>
                                    {capacitadores.map(cap => <option key={cap.id} value={cap.id}>{cap.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Días Impartidos *</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIAS_PERMITIDOS.map((dia) => (
                                        <label key={dia} className={`cursor-pointer px-3 py-1 border rounded-md text-xs font-semibold transition ${data.dias_semana.includes(dia) ? 'bg-[#6B1230] text-white border-[#6B1230]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                                            <input type="checkbox" className="hidden" checked={data.dias_semana.includes(dia)} onChange={() => handleDiaChange(dia)} />
                                            {dia}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Entrada *</label>
                                    <input type="time" value={data.hora_inicio} onChange={(e) => setData('hora_inicio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Salida *</label>
                                    <input type="time" value={data.hora_fin} onChange={(e) => setData('hora_fin', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Cupo *</label>
                                    <input type="number" min="1" value={data.cupo_maximo} onChange={(e) => setData('cupo_maximo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Costo $ *</label>
                                    <input type="number" min="0" value={data.costo} onChange={(e) => setData('costo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md text-xs hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="btn-search py-2 px-6 rounded-md disabled:opacity-50">
                                    {editMode ? 'Actualizar Curso' : 'Aperturar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}