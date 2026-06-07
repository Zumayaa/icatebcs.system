import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    // Jalamos la URL actual y los datos del usuario logueado (para saber su rol)
    const { url, props } = usePage(); 
    const user = props.auth.user; 

    return (
        <>
            <div className="bg-pattern"></div>
            <header>
                <div className="header-inner">
                    <div className="logo-ring">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>

                    <div className="header-text">
                        <h1>ICATEBCS</h1>
                        <p>Sistema de Control Escolar</p>
                    </div>

                    <nav className="header-nav">
                        {/* 🔴 SOLO EL ADMIN VE ESTOS BOTONES */}
                        {user.role === 'admin' && (
                            <>
                                <Link href="/dashboard" className={`nav-btn ${url === '/dashboard' ? 'active' : ''}`}>Panel</Link>
                                <Link href="/admin/cursos" className={`nav-btn ${url.startsWith('/admin/cursos') ? 'active' : ''}`}>Cursos</Link>
                                <Link href="/admin/capacitadores" className={`nav-btn ${url.startsWith('/admin/capacitadores') ? 'active' : ''}`}>Instructores</Link>
                                <Link href="/admin/usuarios" className={`nav-btn ${url.startsWith('/admin/usuarios') ? 'active' : ''}`}>Usuarios</Link>
                            </>
                        )}

                        {/* 🟢 TODOS (Admin y Capturista) VEN LA VENTANILLA */}
                        <Link href="/capturista" className={`nav-btn ${url.startsWith('/capturista') ? 'active' : ''}`}>
                            Ventanilla
                        </Link>
                        
                        <div className="w-px h-6 bg-white/20 mx-2 self-center"></div>

                        <Link href={route('logout')} method="post" as="button" className="nav-btn hover:bg-red-500/20 hover:text-white hover:border-red-500/50">
                            Salir
                        </Link>
                    </nav>
                </div>
            </header>
            <div className="gold-line"></div>
            <main>
                {children}
            </main>
        </>
    );
}
