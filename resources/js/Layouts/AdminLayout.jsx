import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { url } = usePage(); // Para saber en qué página estamos y pintar el botón activo

    return (
        <>
            {/* Fondo decorativo institucional */}
            <div className="bg-pattern"></div>

            {/* Cabecera Guinda */}
            <header>
                <div className="header-inner">
                    {/* Logo Falso (El anillo dorado de tu CSS) */}
                    <div className="logo-ring">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>

                    <div className="header-text">
                        <h1>ICATEBCS</h1>
                        <p>Sistema de Control Escolar</p>
                    </div>

                    {/* Navegación usando tus botones redondeados */}
                    <nav className="header-nav">
                        <Link 
                            href="/dashboard" 
                            className={`nav-btn ${url === '/dashboard' ? 'active' : ''}`}
                        >
                            📊 Panel
                        </Link>
                        <Link 
                            href="/admin/cursos" 
                            className={`nav-btn ${url.startsWith('/admin/cursos') ? 'active' : ''}`}
                        >
                            📚 Cursos
                        </Link>
                        <Link 
                            href="/admin/capacitadores" 
                            className={`nav-btn ${url.startsWith('/admin/capacitadores') ? 'active' : ''}`}
                        >
                            👨‍🏫 Instructores
                        </Link>
                        
                        {/* Separador visual */}
                        <div className="w-px h-6 bg-white/20 mx-2 self-center"></div>

                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="nav-btn hover:bg-red-500/20 hover:text-white hover:border-red-500/50"
                        >
                            Salir
                        </Link>
                    </nav>
                </div>
            </header>

            {/* La rayita dorada degradada de tu diseño */}
            <div className="gold-line"></div>

            {/* Aquí adentro se inyecta el contenido de cada página */}
            <main>
                {children}
            </main>
        </>
    );
}