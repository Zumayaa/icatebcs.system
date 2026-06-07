import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Index({ stats, demografia, edades, recientes, busqueda, alumnoEncontrado }) {
    const [searchCurp, setSearchCurp] = useState(busqueda || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/capturista', { search: searchCurp }, { preserveState: true });
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
            <section>
                <div className="section-header">
                    <span className="section-eyebrow">Panel Operativo</span>
                    <h2 className="section-title">Ventanilla de Control Escolar</h2>
                </div>

                <div className="kpi-grid">
                    <div className="kpi-card accent-guinda"><div className="kpi-value">{stats.activos}</div><div className="kpi-label">Alumnos Activos</div></div>
                    <div className="kpi-card accent-gold"><div className="kpi-value">{stats.por_validar}</div><div className="kpi-label">Por Validar</div></div>
                    <div className="kpi-card accent-blue"><div className="kpi-value">{stats.constancias}</div><div className="kpi-label">Constancias</div></div>
                    <div className="kpi-card accent-green"><div className="kpi-value">{stats.cursos}</div><div className="kpi-label">Cursos</div></div>
                </div>

                <div className="search-card mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input className="curp-input uppercase tracking-widest" value={searchCurp} onChange={(e) => setSearchCurp(e.target.value.toUpperCase())} placeholder="Escribe CURP..." />
                        <button type="submit" className="btn-search">Consultar</button>
                    </form>
                </div>

                <div className="dashboard-row mb-6">
                    <div className="dash-panel">
                        <div className="dash-panel-header"><h3 className="dash-panel-title">Inscripciones por Sede</h3></div>
                        <div className="chart-bars p-4">
                            {demografia.map((item, idx) => (
                                <div key={idx} className="chart-bar-row">
                                    <div className="chart-bar-label">{item.sede}</div>
                                    <div className="chart-bar-track"><div className="chart-bar-fill" style={{ width: `${item.porcentaje}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dash-panel">
                        <div className="dash-panel-header"><h3 className="dash-panel-title">Distribución por Edad</h3></div>
                        <div className="chart-wrapper p-4"><Bar data={chartEdadData} options={{ maintainAspectRatio: false }} /></div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}