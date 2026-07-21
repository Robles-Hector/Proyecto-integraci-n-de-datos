import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, AdminDataProvider } from './context/AppContext';
import { useAuth } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import HomePage from './components/pages/HomePage';
import SeasonsPage from './components/pages/SeasonsPage';
import DriversPage from './components/pages/DriversPage';
import PilotPage from './components/pages/PilotPage';
import ComparatorPage from './components/pages/ComparatorPage';
import DashboardPage from './components/pages/DashboardPage';
import CircuitsPage from './components/pages/CircuitsPage';
import AdminPage from './components/pages/AdminPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import PostularEquipoPage from './components/pages/PostularEquipoPage';
import MisPostulacionesPage from './components/pages/MisPostulacionesPage';
import './App.css';
import RacesPage from './components/pages/RacesPage';
import RaceResultsPage from './components/pages/RaceResultsPage';
import SearchPage from './components/pages/SearchPage';

// Ruta que requiere estar logueado (cualquier rol)
const PrivateRoute = ({ children }) => {
  const { isUser, authLoading } = useAuth();
  if (authLoading) return null;
  return isUser ? children : <Navigate to="/login" replace />;
};

// Ruta exclusiva para admin
const AdminRoute = ({ children }) => {
  const { isAdmin, authLoading } = useAuth();
  if (authLoading) return null;
  return isAdmin ? children : <Navigate to="/login" replace />;
};

// Ruta exclusiva para usuarios normales (NO admin)
const UserOnlyRoute = ({ children }) => {
  const { isUser, isAdmin, authLoading } = useAuth();
  if (authLoading) return null;
  // Admin logueado intentando acceder → redirigir al panel admin
  if (isAdmin) return <Navigate to="/admin" replace />;
  return isUser ? children : <Navigate to="/login" replace />;
};

const NotFound = () => (
  <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏎</div>
      <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>404</div>
      <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Página no encontrada</div>
      <a href="/" className="btn btn-primary">Volver al inicio</a>
    </div>
  </div>
);

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* ── Públicas ─────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/temporadas" element={<SeasonsPage />} />
      <Route path="/pilotos" element={<DriversPage />} />
      <Route path="/piloto/:slug" element={<PilotPage />} />
      <Route path="/comparador" element={<ComparatorPage />} />
      <Route path="/circuitos" element={<CircuitsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/buscar" element={<SearchPage />} />
      <Route path="/carreras" element={<RacesPage />} />
      <Route path="/carreras/:raceId" element={<RaceResultsPage />} />
      {/* ── Requieren login (cualquier rol) ──────────────────── */}
      <Route path="/dashboard"
        element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      {/* ── Solo usuarios normales (no admin) ────────────────── */}
      <Route path="/postular-equipo"
        element={<UserOnlyRoute><PostularEquipoPage /></UserOnlyRoute>} />
      <Route path="/mis-postulaciones"
        element={<UserOnlyRoute><MisPostulacionesPage /></UserOnlyRoute>} />

      {/* ── Solo admin ───────────────────────────────────────── */}
      <Route path="/admin"
        element={<AdminRoute><AdminPage /></AdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminDataProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AdminDataProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
