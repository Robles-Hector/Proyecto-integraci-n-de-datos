import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, useTheme } from '../../context/AppContext';

const Navbar = () => {
  const { dark, toggle } = useTheme();
  const { user, logout, isAdmin, isUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isRegularUser = isUser && !isAdmin;

  const links = useMemo(() => [
    { to: '/', label: 'Inicio' },
    { to: '/temporadas', label: 'Temporadas' },
    { to: '/pilotos', label: 'Pilotos' },
    { to: '/carreras', label: 'Carreras' },
    { to: '/buscar', label: 'Buscar' },
    { to: '/comparador', label: 'Comparador' },
    // Dashboard — visible para cualquier usuario logueado
    ...(isUser ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    // Postular y Mis Postulaciones — SOLO usuarios normales, no admin
    ...(isRegularUser ? [
      { to: '/postular-equipo', label: 'Postular Equipo' },
      { to: '/mis-postulaciones', label: 'Mis Postulaciones' },
    ] : []),
    { to: '/circuitos', label: 'Circuitos' },
    // Admin — solo admin
    ...(isAdmin ? [{ to: '/admin', label: '⚙ Admin' }] : []),
  ], [isUser, isAdmin, isRegularUser]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="f1-badge">F1</span>
        <span>HISTORICAL DB</span>
      </NavLink>

      <ul className="nav-links">
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button className="btn-theme" onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}>
          {dark ? '☀️' : '🌙'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              background: 'rgba(229,9,20,0.1)',
              border: '1px solid rgba(229,9,20,0.3)',
              color: 'var(--accent)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
            }}>
              👤 {user.username} {isAdmin && '· Admin'}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Salir
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn btn-outline btn-sm">
            🔐 Iniciar Sesión
          </NavLink>
        )}

        <button
          className="btn-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            {links.map(l => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  end={l.to === '/'}
                  onClick={closeMenu}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
