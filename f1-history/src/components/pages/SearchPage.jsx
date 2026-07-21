import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';

const API = 'http://localhost:8082/api';
const ANON_LIMIT = 2;

const FILTERS = [
  { id: 'all',      label: 'Todos' },
  { id: 'drivers',  label: '🏎 Pilotos' },
  { id: 'teams',    label: '🏁 Escuderías' },
  { id: 'circuits', label: '📍 Circuitos' },
  { id: 'races',    label: '🏆 Carreras' },
];

const SearchPage = () => {
  const { isUser, user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCount, setSearchCount] = useState(() =>
    Number(localStorage.getItem('f1-anon-searches') || 0)
  );

  const limitReached = !isUser && searchCount >= ANON_LIMIT;

  const runSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (limitReached) return;

    setLoading(true);
    setError('');

    try {
      const headers = {};
      if (isUser) headers['Authorization'] = `Bearer ${user.token}`;

      const params = new URLSearchParams({ q: query.trim() });
      if (type !== 'all') params.set('type', type);

      const res = await fetch(`${API}/search?${params}`, { headers });
      if (!res.ok) throw new Error('No se pudo realizar la búsqueda');

      const data = await res.json();
      setResults(data);

      if (!isUser) {
        const next = searchCount + 1;
        setSearchCount(next);
        localStorage.setItem('f1-anon-searches', String(next));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results
    ? Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : 0;

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">🔍 Explorar</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>Búsqueda General</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Filtra por categoría o busca cualquier dato — pilotos, equipos, circuitos, temporadas...</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        {!isUser && (
          <div style={{
            background: limitReached ? 'rgba(229,9,20,0.08)' : 'rgba(245,197,24,0.08)',
            border: `1px solid ${limitReached ? 'rgba(229,9,20,0.3)' : 'rgba(245,197,24,0.3)'}`,
            color: limitReached ? 'var(--accent)' : 'var(--accent-gold)',
            padding: '0.85rem 1.1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'
          }}>
            <span>
              {limitReached
                ? '⚠️ Alcanzaste el límite de 2 búsquedas sin iniciar sesión.'
                : `ℹ️ Te quedan ${ANON_LIMIT - searchCount} búsqueda${ANON_LIMIT - searchCount === 1 ? '' : 's'} gratis sin iniciar sesión.`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              🔐 Iniciar sesión para buscar sin límite
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => { setType(f.id); setQuery(''); setResults(null); setError(''); }} style={{
              padding: '0.5rem 1.1rem', borderRadius: '4px', border: '1px solid',
              fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
              background: type === f.id ? 'var(--accent)' : 'var(--bg-card)',
              borderColor: type === f.id ? 'var(--accent)' : 'var(--border)',
              color: type === f.id ? 'white' : 'var(--text-secondary)',
            }}>{f.label}</button>
          ))}
        </div>

        <form onSubmit={runSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder='Ej: "Max", "2021", "Monza", "Ferrari"...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={limitReached}
          />
          <button className="btn btn-primary" type="submit" disabled={limitReached || loading || !query.trim()}>
            {loading ? 'Buscando...' : '🔍 Buscar'}
          </button>
        </form>

        {error && (
          <div style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>⚠️ {error}</div>
        )}

        {results && !error && (
          <>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {totalResults} resultado{totalResults === 1 ? '' : 's'} para "{query}"
            </div>

            {results.drivers && results.drivers.length > 0 && (
              <ResultSection title="🏎 Pilotos">
                {results.drivers.map(d => (
                  <ResultCard key={d.id} onClick={() => navigate(`/piloto/${d.slug}`)}
                    title={d.name} subtitle={`${d.nationality} · #${d.number} · ${d.currentTeam?.name ?? 'Sin equipo'}`} />
                ))}
              </ResultSection>
            )}

            {results.teams && results.teams.length > 0 && (
              <ResultSection title="🏁 Escuderías">
                {results.teams.map(t => (
                  <ResultCard key={t.id} title={t.name} subtitle={`${t.fullName} · ${t.base}`} />
                ))}
              </ResultSection>
            )}

            {results.circuits && results.circuits.length > 0 && (
              <ResultSection title="📍 Circuitos">
                {results.circuits.map(c => (
                  <ResultCard key={c.id} title={c.name} subtitle={`${c.city}, ${c.country}`} />
                ))}
              </ResultSection>
            )}

            {results.races && results.races.length > 0 && (
              <ResultSection title="🏆 Carreras">
                {results.races.map(r => (
                  <ResultCard key={r.id} onClick={() => navigate(`/carreras/${r.id}`)}
                    title={`${r.circuitName} — Temporada ${r.season}`} subtitle={`Ronda ${r.round} · ${r.raceDate}`} />
                ))}
              </ResultSection>
            )}

            {totalResults === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <div style={{ fontWeight: '700' }}>Sin resultados para "{query}"</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ResultSection = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
      {title}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
      {children}
    </div>
  </div>
);

const ResultCard = ({ title, subtitle, onClick }) => (
  <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{title}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</div>
  </div>
);

export default SearchPage;