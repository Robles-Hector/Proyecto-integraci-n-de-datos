import React, { useState } from 'react';
import { useF1Data, LoadingScreen, ErrorScreen } from '../../hooks/useF1Data';

const TEAM_COLORS = {
  'Ferrari': '#E8002D', 'Mercedes': '#27F4D2', 'Red Bull': '#3671C6', 'McLaren': '#FF8000',
  'Aston Martin': '#00665E', 'Alpine': '#00A1E8', 'Williams': '#64C4FF', 'RB': '#6C98FF',
  'Sauber': '#000000', 'Haas': '#B6BABD', 'Cadillac': '#00594F',
  // nombres históricos que puedan aparecer en resultados de temporadas anteriores
  'Renault': '#FFF500', 'AlphaTauri': '#4E7C9B', 'Alfa Romeo': '#B12335',
  'Racing Point': '#F596C8', 'Kick Sauber': '#52E252', 'Visa Cash App RB': '#6692FF',
};

const SeasonsPage = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { loading, error, seasons, races, raceResults, drivers } = useF1Data();
  const [tab, setTab] = useState('drivers');

  const years = Object.keys(seasons).map(Number).sort();
  const [selected, setSelected] = useState(null);

  const currentYear = selected || (years.length ? years[years.length - 1] : null);
  const season = currentYear ? seasons[currentYear] : null;

  if (loading) return <div className="page"><LoadingScreen /></div>;
  if (error) return <div className="page"><ErrorScreen message={error} /></div>;

  // Clasificación real, calculada desde race_results de la temporada seleccionada
  const seasonRaceIds = races
    .filter(r => r.season === currentYear)
    .sort((a, b) => a.round - b.round)
    .map(r => r.id);

  const seasonResults = raceResults.filter(res => seasonRaceIds.includes(res.raceId));

  const standingsMap = {};
  seasonResults.forEach(res => {
    if (!standingsMap[res.driverId]) {
      const driverInfo = drivers.find(d => d.id === res.driverId);
      standingsMap[res.driverId] = {
        id: res.driverId,
        name: res.driverName,
        nationality: driverInfo?.nationality ?? '',
        team: res.teamName,
        points: 0,
        wins: 0,
      };
    }
    standingsMap[res.driverId].points += Number(res.points) || 0;
    if (res.finalPosition === 1) standingsMap[res.driverId].wins += 1;
    // último equipo con el que corrió en la temporada (por si hubo transferencia)
    standingsMap[res.driverId].team = res.teamName;
  });

  const standings = Object.values(standingsMap).sort((a, b) => b.points - a.points);
  const totalPages = Math.max(1, Math.ceil(standings.length / PAGE_SIZE));
  const paginatedStandings = standings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">📅 Historial</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>Temporadas</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Resultados completos de cada campeonato — 2020 a 2026</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {years.map(y => (
            <button key={y} onClick={() => { setSelected(y); setPage(1); }} style={{
              padding: '0.5rem 1.25rem', borderRadius: '4px', border: '1px solid',
              fontWeight: '700', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s',
              background: currentYear === y ? 'var(--accent)' : 'var(--bg-card)',
              borderColor: currentYear === y ? 'var(--accent)' : 'var(--border)',
              color: currentYear === y ? 'white' : 'var(--text-secondary)',
            }}>{y}</button>
          ))}
        </div>

        {season && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '3rem', fontWeight: '900', color: 'var(--accent)', lineHeight: 1 }}>{season.year}</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>{season.highlight}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem', maxWidth: '500px' }}>{season.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { v: seasonRaceIds.length, l: 'Carreras' },
                    { v: season.teams?.length, l: 'Equipos' },
                    { v: standings[0]?.name || '—', l: 'Campeón Piloto' },
                    { v: season.constructorChampion || '—', l: 'Campeón Constructor' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: i < 2 ? '1.8rem' : '0.95rem', fontWeight: '900', color: 'var(--accent)' }}>{s.v}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="page-tabs">
              {[['drivers', '🏎 Clasificación Pilotos'], ['teams', '🏁 Escuderías'], ['info', 'ℹ️ Información']].map(([id, lbl]) => (
                <button key={id} className={`page-tab ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); setPage(1); }}>{lbl}</button>
              ))}
            </div>

            {tab === 'drivers' && (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Pos</th><th>Piloto</th><th>Escudería</th><th>Victorias</th><th>Puntos</th></tr></thead>
                  <tbody>
                    {paginatedStandings.map((d, i) => (
                      <tr key={d.id}>
                        <td>
                          {(() => {
                            const globalPos = (page - 1) * PAGE_SIZE + i + 1;
                            return (
                              <span className={`pos-badge ${globalPos === 1 ? 'pos-1' : globalPos === 2 ? 'pos-2' : globalPos === 3 ? 'pos-3' : ''}`}>
                                {globalPos}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.nationality}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TEAM_COLORS[d.team] || '#888', display: 'inline-block', flexShrink: 0 }} />
                            {d.team}
                          </div>
                        </td>
                        <td style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: '700', color: 'var(--text-primary)' }}>{d.wins}</td>
                        <td style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: '700', color: 'var(--accent)' }}>{d.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {standings.length > PAGE_SIZE && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      ← Anterior
                    </button>

                    <span style={{ fontFamily: "'Share Tech Mono',monospace", color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Página {page} de {totalPages}
                    </span>

                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'teams' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {season.teams?.map(t => (
                  <div key={t} className="card" style={{ borderLeft: `3px solid ${TEAM_COLORS[t] || '#888'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: TEAM_COLORS[t] || '#888', display: 'inline-block' }} />
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{t}</span>
                    </div>
                    {t === season.constructorChampion && (
                      <span style={{ background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '2px', fontSize: '0.7rem', fontWeight: '700' }}>
                        🏆 Campeón Constructor
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'info' && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Temporada {season.year}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{season.description}</p>
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { l: 'Carreras disputadas', v: seasonRaceIds.length },
                    { l: 'Campeón Piloto', v: standings[0]?.name || 'Por definir' },
                    { l: 'Campeón Constructor', v: season.constructorChampion || 'Por definir' },
                    { l: 'Equipos participantes', v: season.teams?.length },
                  ].map((x, i) => (
                    <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{x.l}</div>
                      <div style={{ fontWeight: '700', fontFamily: "'Share Tech Mono',monospace", color: 'var(--accent)' }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeasonsPage;