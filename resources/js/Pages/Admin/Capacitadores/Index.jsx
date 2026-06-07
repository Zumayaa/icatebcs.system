import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ capacitadores, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Buscador en vivo
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/capacitadores', { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        nombre: '', rfc: '', CURP: '', numero_control: '', telefono: '', email: '', grado_academico: '', especialidad: '',
    });

    const openCreateModal = () => { reset(); setEditMode(false); setIsModalOpen(true); };

    const openEditModal = (cap) => {
        setSelectedId(cap.id);
        setData({
            nombre: cap.nombre, rfc: cap.rfc, CURP: cap.CURP, numero_control: cap.numero_control,
            telefono: cap.telefono, email: cap.email || '', grado_academico: cap.grado_academico || '', especialidad: cap.especialidad || '',
        });
        setEditMode(true); setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) put(`/admin/capacitadores/${selectedId}`, { onSuccess: () => setIsModalOpen(false) });
        else post('/admin/capacitadores', { onSuccess: () => { setIsModalOpen(false); reset(); } });
    };

    const handleDelete = (id, nombre) => {
        if (confirm(`¿Dar de baja al instructor ${nombre}?`)) router.delete(`/admin/capacitadores/${id}`);
    };

    // Función rápida para sacar las iniciales del profe para su Avatar
    const getInitials = (name) => {
        let parts = name.split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    };

    return (
        <AdminLayout>
            <Head title="Instructores - ICATEBCS" />

            <section>
                {/* Cabecera dividida con buscador integrado (Clases de tu CSS) */}
                <div className="split-header">
                    <div>
                        <h2 className="section-title">Plantilla de capacitadores</h2>
                        <p className="section-sub">Directorio oficial de capacitadores del instituto.</p>
                    </div>

                    <div className="toolbar-search">
                        <input 
                            type="text" 
                            placeholder="Buscar por Nombre, RFC o CURP..." 
                            className="mini-search"
                            value={search} 
                            onChange={(e) => setSearch(e.target.value.toUpperCase())} 
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6 mb-2">
                    <button onClick={openCreateModal} className="btn-search">
                        Registrar instructor
                    </button>
                </div>

                {/* Grid de Tarjetas de Perfil (Reemplaza a la tabla) */}
                <div className="entity-grid mt-4">
                    {capacitadores.map((cap) => (
                        <div key={cap.id} className="entity-card">
                            <div className="entity-topline">
                                <div className="entity-avatar teacher">
                                    {getInitials(cap.nombre)}
                                </div>
                                <div>
                                    <h3>{cap.nombre}</h3>
                                    <p className="font-mono text-[0.68rem] text-gray-500 mt-1 uppercase">
                                        Emp: <span className="text-blue-700 font-bold">{cap.numero_control}</span> | RFC: {cap.rfc}
                                    </p>
                                </div>
                            </div>

                            <div className="metric-strip">
                                <span>
                                    <strong>Teléfono</strong> 
                                    {cap.telefono}
                                </span>
                                <span>
                                    <strong>Grado</strong> 
                                    {cap.grado_academico || 'N/A'}
                                </span>
                                <span>
                                    <strong>Especialidad</strong> 
                                    {cap.especialidad ? cap.especialidad.substring(0,10)+'..' : 'General'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-gray-100/50 mt-2">
                                <button onClick={() => openEditModal(cap)} className="btn-mas-info w-full">
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(cap.id, cap.nombre)} className="btn-mas-info w-full !text-red-700 !border-red-200 hover:!bg-red-50">
                                    Dar de baja
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {capacitadores.length === 0 && (
                        <div className="empty-panel text-center py-10 w-full col-span-2">
                            No se encontraron instructores registrados en el sistema.
                        </div>
                    )}
                </div>
            </section>

            {/* MODAL (Mantenemos la estructura Tailwind para que funcione bien) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="text-base font-bold text-gray-800">
                                {editMode ? 'Modificar Instructor' : 'Alta de Nuevo Instructor'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Nombre Completo *</label>
                                    <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value.toUpperCase())} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Número de Empleado *</label>
                                    <input type="text" value={data.numero_control} onChange={(e) => setData('numero_control', e.target.value.toUpperCase())} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">RFC *</label>
                                    <input type="text" maxLength="13" value={data.rfc} onChange={(e) => setData('rfc', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">CURP *</label>
                                    <input type="text" maxLength="18" value={data.CURP} onChange={(e) => setData('CURP', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Teléfono Móvil *</label>
                                    <input type="text" maxLength="10" value={data.telefono} onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, ''))} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Grado Académico</label>
                                    <select value={data.grado_academico} onChange={(e) => setData('grado_academico', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]">
                                        <option value="">Seleccione...</option>
                                        <option value="Técnico">Técnico</option><option value="Licenciatura">Licenciatura</option><option value="Ingeniería">Ingeniería</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Especialidad</label>
                                    <input type="text" value={data.especialidad} onChange={(e) => setData('especialidad', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-1.5 px-4 rounded text-xs">Cancelar</button>
                                <button type="submit" disabled={processing} className="btn-search py-1.5">{editMode ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}