import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ usuarios }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        email: '',
        role: 'capturista',
        password: '',
        password_confirmation: '',
    });

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setSelectedId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (usuario) => {
        setData({
            name: usuario.name,
            email: usuario.email,
            role: usuario.role,
            password: '',
            password_confirmation: '',
        });
        setSelectedId(usuario.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editMode) {
            put(`/admin/usuarios/${selectedId}`, { onSuccess: () => setIsModalOpen(false) });
            return;
        }

        post('/admin/usuarios', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Usuarios - ICATEBCS" />

            <section>
                <div className="split-header">
                    <div>
                        <h2 className="section-title">Usuarios y roles</h2>
                        <p className="section-sub">Alta controlada de cuentas administrativas del sistema.</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-search">
                        Crear usuario
                    </button>
                </div>

                <div className="dash-panel overflow-hidden mt-6">
                    <div className="cursos-table-wrap !p-0">
                        <table className="cursos-table !mt-0 w-full">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Alta</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td className="font-bold text-gray-900">{usuario.name}</td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            <span className={`estatus-badge ${usuario.role === 'admin' ? 'aprobado' : 'encurso'}`}>
                                                <span className="estatus-dot"></span>
                                                {usuario.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{new Date(usuario.created_at).toLocaleDateString('es-MX')}</td>
                                        <td className="text-center">
                                            <button onClick={() => openEditModal(usuario)} className="btn-mas-info">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="text-base font-bold text-gray-800">
                                {editMode ? 'Editar usuario' : 'Crear usuario'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase">Nombre *</label>
                                <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase">Correo *</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase">Rol *</label>
                                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]">
                                    <option value="capturista">Capturista</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">{editMode ? 'Nueva contraseña' : 'Contraseña *'}</label>
                                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required={!editMode} />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase">Confirmar</label>
                                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-[#6B1230] focus:ring-[#6B1230]" required={!editMode || data.password.length > 0} />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-1.5 px-4 rounded text-xs">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="btn-search py-1.5">
                                    {editMode ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
