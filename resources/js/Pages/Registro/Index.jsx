import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ cursos }) {
    // Estado para controlar la notificación animada (Toast)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre_completo: '',
        curp: '',
        telefono: '',
        fecha_nacimiento: '',
        tipo_identificacion: 'INE',
        curso_id: '',
    });

    // Función para invocar el recuadro animado
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        // Se oculta solito después de 4 segundos
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. VALIDACIÓN DE EDAD (Mínimo 15 años cumplidos)
        if (data.fecha_nacimiento) {
            const birthDate = new Date(data.fecha_nacimiento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // Si el mes actual es menor al de nacimiento, o si es el mismo mes pero el día no ha llegado, le restamos 1 año
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 15) {
                showToast('Lo sentimos. Por lineamientos oficiales, debes tener al menos 15 años cumplidos para inscribirte.', 'error');
                return; // Cortamos la ejecución aquí, no se envía nada
            }
        }

        // 2. ENVÍO DE DATOS
        post('/registro', {
            onSuccess: () => {
                showToast('¡Ficha generada con éxito! Acude a la ventanilla de Control Escolar para validar tu lugar.', 'success');
                reset();
            },
            onError: () => {
                showToast('Revisa los campos en rojo. Hubo un error al procesar tu solicitud.', 'error');
            }
        });
    };

    return (
        <>
            <div className="bg-pattern"></div>

            <header>
                <div className="header-inner justify-center sm:justify-start">
                    <div className="logo-ring">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div className="header-text">
                        <h1>ICATEBCS</h1>
                        <p>Portal Público de Pre-Registro Escolar</p>
                    </div>
                </div>
            </header>

            <div className="gold-line"></div>

            <main className="max-w-2xl mx-auto px-4 py-10 animate-[fadeIn_0.35s_ease_both]">
                <div className="section-header text-center mb-8">
                    <span className="section-eyebrow">Trámite de Nuevo Ingreso</span>
                    <h2 className="section-title">Solicitud de Inscripción</h2>
                    <p className="section-sub">Aparta tu lugar ingresando tus datos correctos. Posteriormente deberás validar tu expediente en ventanilla.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-[rgba(107,18,48,.09)] overflow-hidden">
                    <div className="bg-gradient-to-r from-[#4A0B20] to-[#6B1230] px-6 py-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">Ficha Digital de Aspirante</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
                        
                        <div>
                            <label className="search-label">1. Selecciona el Curso de tu Interés *</label>
                            <select
                                value={data.curso_id}
                                onChange={(e) => setData('curso_id', e.target.value)}
                                className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] text-sm p-3 transition bg-[#FAF7F2]"
                                required
                            >
                                <option value="">-- Elige una opción de la oferta educativa --</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre} — Sede: {curso.unidad_capacitacion} ({curso.dias_semana} de {curso.hora_inicio.substring(0,5)} a {curso.hora_fin.substring(0,5)})
                                    </option>
                                ))}
                            </select>
                            {errors.curso_id && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.curso_id}</p>}
                        </div>

                        <div>
                            <label className="search-label">2. Nombre Completo (Como aparece en tu acta o INE) *</label>
                            <input
                                type="text"
                                value={data.nombre_completo}
                                onChange={(e) => setData('nombre_completo', e.target.value.toUpperCase())}
                                className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] text-sm p-3 transition bg-[#FAF7F2]"
                                placeholder="INGRESA TU NOMBRE"
                                required
                            />
                            {errors.nombre_completo && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.nombre_completo}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="search-label">3. CURP *</label>
                                <input
                                    type="text"
                                    maxLength="18"
                                    value={data.curp}
                                    onChange={(e) => setData('curp', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] font-mono text-sm p-3 transition bg-[#FAF7F2] tracking-widest"
                                    placeholder="18 DÍGITOS"
                                    required
                                />
                                {errors.curp && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.curp}</p>}
                            </div>

                            <div>
                                <label className="search-label">4. Teléfono Celular *</label>
                                <input
                                    type="text"
                                    maxLength="10"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, ''))}
                                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] text-sm p-3 transition bg-[#FAF7F2]"
                                    placeholder="10 DÍGITOS"
                                    required
                                />
                                {errors.telefono && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.telefono}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="search-label">5. Fecha de Nacimiento *</label>
                                <input
                                    type="date"
                                    value={data.fecha_nacimiento}
                                    onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] text-sm p-3 transition bg-[#FAF7F2]"
                                    required
                                />
                                {errors.fecha_nacimiento && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.fecha_nacimiento}</p>}
                            </div>

                            <div>
                                <label className="search-label">6. Tipo de Identificación Física *</label>
                                <select
                                    value={data.tipo_identificacion}
                                    onChange={(e) => setData('tipo_identificacion', e.target.value)}
                                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#6B1230] focus:ring-[#6B1230] text-sm p-3 transition bg-[#FAF7F2]"
                                    required
                                >
                                    <option value="INE">INE (Credencial para Votar)</option>
                                    <option value="Pasaporte">Pasaporte Mexicano</option>
                                    <option value="Credencial Escolar">Credencial Escolar (Menores de edad)</option>
                                    <option value="Constancia Delegacional">Constancia de Residencia / Delegacional</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-search w-full sm:w-auto text-center justify-center font-bold tracking-wider py-3.5 px-10 rounded-xl disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Procesando...
                                    </span>
                                ) : 'Enviar Pre-registro oficial'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <footer>
                Gobierno del Estado de Baja California Sur — Instituto de Capacitación para los Trabajadores <span>ICATEBCS</span>
            </footer>

            {/* NOTIFICACIÓN FLOTANTE (TOAST) ANIMADA */}
            <div 
                className={`fixed bottom-8 right-6 sm:right-10 z-[999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform max-w-sm border
                    ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'} 
                    ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#F0FDF4] border-[#166534]/20 text-[#166534]'}`
                }
            >
                <div className="text-xl shrink-0">{toast.type === 'error' ? '⚠️' : '✅'}</div>
                <p className="text-sm font-semibold leading-tight">{toast.message}</p>
            </div>
        </>
    );
}