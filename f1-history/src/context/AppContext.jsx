import React, { createContext, useContext, useState, useEffect } from 'react';

const API = 'http://localhost:8082/api';

// ── Auth Context ──────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem('f1-token');
    const username = localStorage.getItem('f1-username');
    const rolesRaw = localStorage.getItem('f1-roles');

    if (token && username && rolesRaw) {
      fetch(`${API}/auth/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then((data) => setUser({ username, roles: data.roles, token }))
        .catch(() => {
          localStorage.removeItem('f1-token');
          localStorage.removeItem('f1-username');
          localStorage.removeItem('f1-roles');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('f1-token',    data.token);
    localStorage.setItem('f1-username', data.username);
    localStorage.setItem('f1-roles',    JSON.stringify(data.roles));
    setUser({ username: data.username, roles: data.roles, token: data.token });
  };

  const login = async (username, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Usuario o contraseña incorrectos');
    }

    const data = await res.json();
    persistSession(data);
    return data;
  };

  const register = async (username, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar usuario');
    }

    const data = await res.json();
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('f1-token');
    localStorage.removeItem('f1-username');
    localStorage.removeItem('f1-roles');
    setUser(null);
  };

  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const isUser  = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ── Theme Context ─────────────────────────────────────────────────
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('f1-theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (dark) {
      root.classList.add('theme-dark');    root.classList.remove('theme-light');
      body.classList.add('theme-dark');    body.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');   root.classList.remove('theme-dark');
      body.classList.add('theme-light');   body.classList.remove('theme-dark');
    }
    localStorage.setItem('f1-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'theme-dark' : 'theme-light'} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// ── AdminData Context (eliminado — ahora es backend) ─────────────
const AdminDataContext = createContext({ pendingTeams: [], addTeam: () => {} });
export const AdminDataProvider = ({ children }) => (
  <AdminDataContext.Provider value={{ pendingTeams: [], addTeam: () => {} }}>
    {children}
  </AdminDataContext.Provider>
);
export const useAdminData = () => useContext(AdminDataContext);