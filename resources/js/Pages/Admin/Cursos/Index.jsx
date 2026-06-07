import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

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
            matricula: curso.matricula,
            nombre: curso.nombre,
            descripcion: curso.descripcion || '',
            unidad_capacitacion: curso.unidad_capacitacion,
            capacitador_id: curso.capacitador_id,
            dias_semana: curso.dias_semana ? curso.dias_semana.split(', ') : [],
            hora_inicio: curso.hora_inicio.substring(0, 5),
            hora_fin: curso.hora_fin.substring(0, 5),
            horas_totales: curso.horas_totales,
            modalidad: curso.modalidad,
            cupo_maximo: curso.cupo_maximo,
            costo: curso.costo,
            activo: Boolean(curso.activo),
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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <Head title="Administración - Cursos" />
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Cabecera Interactiva */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-bold text-gray-900">Oferta Educativa (Cursos)</h1>
                        <p className="text-sm text-gray-500">Catálogo general de capacitación estatal</p>
                    </div>
                    
                    {/* BUSCADOR */}
                    <div className="w-full sm:w-80 mx-0 sm:mx-4">
                        <input type="text" placeholder="Buscar curso o clave..." className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())} />
                    </div>

                    <button onClick={openCreateModal} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm shadow transition">
                        ➕ Abrir Nuevo Curso
                    </button>
                </div>

                {/* Tabla Extendida */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-gray-700 font-semibold">Clave / Nombre del Curso</th>
                                    <th className="px-4 py-3 text-gray-700 font-semibold">Instructor</th>
                                    <th className="px-4 py-3 text-gray-700 font-semibold">Modalidad / Horas</th>
                                    <th className="px-4 py-3 text-gray-700 font-semibold">Logística / Días</th>
                                    <th className="px-4 py-3 text-gray-700 font-semibold text-center">Estado</th>
                                    <th className="px-4 py-3 text-center text-gray-700 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {cursos.map((curso) => (
                                    <tr key={curso.id} className={`hover:bg-gray-50 ${!curso.activo && 'opacity-60'}`}>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-mono font-bold text-indigo-600 block">{curso.matricula}</span>
                                            <span className="font-bold text-gray-900 block">{curso.nombre}</span>
                                            {curso.descripcion && <span className="text-xs text-gray-400 line-clamp-1">{curso.descripcion}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                            {curso.capacitador ? curso.capacitador.nombre : '⚠️ Sin Asignar'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${curso.modalidad === 'Presencial' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>{curso.modalidad}</span>
                                            <span className="block text-xs text-gray-500 mt-0.5">⏱️ {curso.horas_totales} horas oficiales</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <span className="font-semibold text-gray-800 block">{curso.dias_semana}</span>
                                            <span>{curso.hora_inicio.substring(0,5)} a {curso.hora_fin.substring(0,5)} | 👥 Max: {curso.cupo_maximo}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => router.patch(`/admin/cursos/${curso.id}/toggle`)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${curso.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                                {curso.activo ? '🟢 Activo' : '🔴 Pausado'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openEditModal(curso)} className="text-indigo-600 hover:text-indigo-900 text-xs font-bold bg-indigo-50 px-2.5 py-1.5 rounded border border-indigo-100">Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL DETALLADO */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
                            <div className="bg-gray-800 px-6 py-4"><h3 className="text-base font-bold text-white">{editMode ? 'Modificar Parámetros de Curso' : 'Apertura de Nuevo Curso Oficial'}</h3></div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Clave / Matrícula *</label>
                                        <input type="text" placeholder="Ej. EXCEL-26A" value={data.matricula} onChange={(e) => setData('matricula', e.target.value.toUpperCase().replace(/\s/g, ''))} className="mt-1 block w-full rounded-md border-gray-300 text-sm font-mono" required />
                                        {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Nombre Completo del Curso *</label>
                                        <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value.toUpperCase())} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Objetivo o Descripción Breve</label>
                                    <textarea rows="2" placeholder="De qué trata el curso..." value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md border">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Unidad Sede *</label>
                                        <select value={data.unidad_capacitacion} onChange={(e) => setData('unidad_capacitacion', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm">
                                            <option value="La Paz">La Paz</option><option value="Los Cabos">Los Cabos</option><option value="Comondú">Comondú</option><option value="Loreto">Loreto</option><option value="Mulegé">Mulegé</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Modalidad *</label>
                                        <select value={data.modalidad} onChange={(e) => setData('modalidad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm">
                                            <option value="Presencial">Presencial</option><option value="En Línea">En Línea</option><option value="Híbrido">Híbrido</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Duración (Horas Totales) *</label>
                                        <input type="number" value={data.horas_totales} onChange={(e) => setData('horas_totales', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase">Instructor Responsable *</label>
                                    <select value={data.capacitador_id} onChange={(e) => setData('capacitador_id', e.target.value)} className="mt-1 block w-full rounded-md border-indigo-300 text-sm" required>
                                        <option value="">Selecciona un maestro...</option>
                                        {capacitadores.map(cap => <option key={cap.id} value={cap.id}>{cap.nombre}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Días Impartidos *</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {DIAS_PERMITIDOS.map((dia) => (
                                            <label key={dia} className={`cursor-pointer px-3 py-1 border rounded-md text-xs font-medium transition ${data.dias_semana.includes(dia) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                <input type="checkbox" className="hidden" checked={data.dias_semana.includes(dia)} onChange={() => handleDiaChange(dia)} />
                                                {dia}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Hora Entrada *</label>
                                        <input type="time" value={data.hora_inicio} onChange={(e) => setData('hora_inicio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Hora Salida *</label>
                                        <input type="time" value={data.hora_fin} onChange={(e) => setData('hora_fin', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                        {errors.hora_fin && <p className="text-red-500 text-xs mt-1">{errors.hora_fin}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Cupo Límite *</label>
                                        <input type="number" min="1" value={data.cupo_maximo} onChange={(e) => setData('cupo_maximo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Costo Inscripción *</label>
                                        <input type="number" min="0" value={data.costo} onChange={(e) => setData('costo', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm" required />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1.5 px-4 rounded text-xs">Cancelar</button>
                                    <button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded text-xs shadow disabled:opacity-50">{editMode ? 'Guardar Cambios' : 'Aperturar Curso'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}