import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Index({ stats, busqueda }) {
    // Simulamos un estado para el buscador de ventanilla
    const [searchCurp, setSearchCurp] = useState('');
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);

    // Datos simulados para las gráficas si no vienen del backend aún
    const demografia = [
        { sede: 'La Paz', total: 450, porcentaje: 85 },
        { sede: 'Los Cabos', total: 320, porcentaje: 60 },
        { sede: 'Comondú', total: 150, porcentaje: 35 },
        { sede: 'Loreto', total: 80, porcentaje: 15 },
    ];

    const recientes = [
        { id: 1, nombre: 'MARÍA FERNANDA LÓPEZ', curp: 'LOMF980214...', tramite: 'Validación', tiempo: 'Hace 5 min' },
        { id: 2, nombre: 'JUAN CARLOS PÉREZ', curp: 'PEJC010522...', tramite: 'Inscripción', tiempo: 'Hace 12 min' },
        { id: 3, nombre: 'ANA SOFÍA RAMÍREZ', curp: 'RASA950830...', tramite: 'Constancia', tiempo: 'Hace 1 hora' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        // Aquí mandarías la petición real a Laravel, por ahora simulamos que encuentra al alumno
        setAlumnoEncontrado({
            nombre: 'PEDRO PÉREZ ZUMAYA',
            curp: searchCurp || 'PEZP990101HDFRXX01',
            curso: 'EXCEL BÁSICO - LA PAZ',
            estatus: 'Pendiente de Validar'
        });
    };

    return (
        <AdminLayout>
            <Head title="Ventanilla - ICATEBCS" />

            <section className="animate-[fadeIn_0.35s_ease_both]">
                <div className="section-header">
                    <span className="section-eyebrow">Panel Operativo</span>
                    <h2 className="section-title">Ventanilla de Control Escolar</h2>
                    <p className="section-sub">Resumen de inscripciones y validación rápida de expedientes.</p>
                </div>

                {/* 1. FILA DE INDICADORES (KPIs) */}
                <div className="kpi-grid">
                    <div className="kpi-card accent-guinda">
                        <div className="kpi-icon bg-guinda text-xl">👥</div>
                        <div className="kpi-value">1,248</div>
                        <div className="kpi-label">Alumnos Activos</div>
                    </div>
                    
                    <div className="kpi-card accent-gold">
                        <div className="kpi-icon bg-gold text-xl">⏳</div>
                        <div className="kpi-value">42</div>
                        <div className="kpi-label">Por Validar</div>
                    </div>

                    <div className="kpi-card accent-blue">
                        <div className="kpi-icon bg-blue text-xl">🎓</div>
                        <div className="kpi-value">850</div>
                        <div className="kpi-label">Constancias Emitidas</div>
                    </div>

                    <div className="kpi-card accent-green">
                        <div className="kpi-icon bg-green text-xl">📚</div>
                        <div className="kpi-value">24</div>
                        <div className="kpi-label">Cursos Ofertados</div>
                    </div>
                </div>

                {/* 2. EL BUSCADOR PRINCIPAL (La Ventanilla) */}
                <div className="search-card mb-6">
                    <label className="search-label">Validación Rápida de Expediente</label>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="input-icon-wrap flex-1">
                            <span className="input-icon text-lg">🔎</span>
                            <input 
                                type="text" 
                                className="curp-input with-icon uppercase tracking-widest" 
                                placeholder="Escribe o escanea la CURP del alumno..." 
                                maxLength="18"
                                value={searchCurp}
                                onChange={(e) => setSearchCurp(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-search">
                            Buscar Expediente
                        </button>
                    </form>
                    <p className="hint">El sistema buscará en la base de datos de pre-registros y alumnos activos.</p>
                </div>

                {/* TARJETA DE RESULTADO (Se oculta si no hay búsqueda) */}
                {alumnoEncontrado && (
                    <div className="result-card mb-6">
                        <div className="result-header">
                            <div className="avatar">
                                {alumnoEncontrado.nombre.substring(0,2)}
                            </div>
                            <div>
                                <h3 className="result-name">{alumnoEncontrado.nombre}</h3>
                                <div className="flex gap-2">
                                    <span className="result-curp-tag">{alumnoEncontrado.curp}</span>
                                    <span className="result-rol-tag alumno border border-white/20">Aspirante</span>
                                </div>
                            </div>
                        </div>
                        <div className="data-grid">
                            <div className="data-item">
                                <div className="data-item-label">Curso Solicitado</div>
                                <div className="data-item-value big">{alumnoEncontrado.curso}</div>
                            </div>
                            <div className="data-item">
                                <div className="data-item-label">Estatus Físico</div>
                                <div className="data-item-value text-orange-600 font-bold">⚠️ {alumnoEncontrado.estatus}</div>
                            </div>
                        </div>
                        <div className="result-card-footer justify-end bg-orange-50">
                            <button className="btn-constancia !bg-green-600 !hover:bg-green-700 text-sm px-6 py-2">
                                ✅ Validar Documentación
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. GRÁFICAS Y ACTIVIDAD RECIENTE */}
                <div className="dashboard-row">
                    
                    {/* Gráfica de Barras CSS Nativas */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <h3 className="dash-panel-title">Demografía por Unidad Sede</h3>
                            <button className="dash-ver-mas">Ver Reporte</button>
                        </div>
                        <div className="chart-bars">
                            {demografia.map((item, idx) => (
                                <div key={idx} className="chart-bar-row">
                                    <div className="chart-bar-label">{item.sede}</div>
                                    <div className="chart-bar-track">
                                        <div 
                                            className="chart-bar-fill" 
                                            style={{ width: `${item.porcentaje}%` }}
                                        ></div>
                                    </div>
                                    <div className="chart-bar-count">{item.total}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lista de Actividad */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <h3 className="dash-panel-title">Movimientos Recientes</h3>
                        </div>
                        <div className="recent-list">
                            {recientes.map((mov) => (
                                <div key={mov.id} className="recent-item">
                                    <div className="recent-avatar alumno">
                                        {mov.nombre.substring(0, 2)}
                                    </div>
                                    <div className="recent-info">
                                        <div className="recent-name">{mov.nombre}</div>
                                        <div className="recent-meta">{mov.curp}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="recent-badge badge-alumno inline-block mb-1">{mov.tramite}</span>
                                        <div className="text-[0.65rem] text-gray-400 font-medium">{mov.tiempo}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* BOTÓN FLOTANTE (FAB) PARA EXPORTAR PADRÓN */}
            <button className="fab-export">
                📊 <span>Exportar Excel</span>
            </button>
        </AdminLayout>
    );
}