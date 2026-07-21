import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { useF1Data, LoadingScreen, ErrorScreen } from '../../hooks/useF1Data';

const API = 'http://localhost:8082/api';

const emptyForm = { driverId: '', teamId: '', gridPosition: '', finalPosition: '', points: '', status: 'FINISHED', fastestLap: false, pole: false };

const RaceResultsPage = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { loading, error, races, raceResults, drivers, teams, refetch } = useF1Data();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [toast, setToast] = useState(null);

  if (loading) return <div className="page"><LoadingScreen /></div>;
  if (error) return <div className="page"><ErrorScreen message={error} /></div>;

  const race = races.find(r => String(r.id) === raceId);
  const results = raceResults
    .filter(r => String(r.raceId) === raceId)
    .sort((a, b) => (a.finalPosition ?? 999) - (b.finalPosition ?? 999));

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const res = await fetch(`${API}/race-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          raceId: Number(raceId),
          driverId: form.driverId,
          teamId: form.teamId,
          gridPosition: form.gridPosition ? Number(form.gridPosition) : null,
          finalPosition: form.finalPosition ? Number(form.finalPosition) : null,
          points: Number(form.points || 0),
          status: form.status,
          fastestLap: form.fastestLap,
          pole: form.pole
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo registrar el resultado');
      }

      setShowForm(false);
      setToast('✅ Resultado registrado correctamente');
      setTimeout(() => setToast(null), 4000);
      refetch();

      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (!race) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Carrera no encontrada</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/carreras')}>Volver a Carreras</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">🏆 Resultados</div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>{race.circuitName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Temporada {race.season} — Ronda {race.round} — {race.raceDate}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/carreras')}>← Volver a Carreras</button>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Agregar resultado</button>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pos</th><th>Piloto</th><th>Escudería</th><th>Salida</th><th>Puntos</th><th>Estado</th><th>Vuelta rápida</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(res => (
                <tr key={res.id}>
                  <td>
                    <span className={`pos-badge ${res.finalPosition === 1 ? 'pos-1' : res.finalPosition === 2 ? 'pos-2' : res.finalPosition === 3 ? 'pos-3' : ''}`}>
                      {res.finalPosition ?? '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{res.driverName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{res.teamName}</td>
                  <td style={{ fontFamily: "'Share Tech Mono',monospace", color: 'var(--text-secondary)' }}>{res.gridPosition ?? '—'}</td>
                  <td style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: '700', color: 'var(--accent)' }}>{res.points}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{res.status}</td>
                  <td>{res.fastestLap ? '⚡' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length > PAGE_SIZE && (
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

        {results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <div style={{ fontWeight: '700' }}>Aún no hay resultados registrados para esta carrera</div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowForm(false)}>
          <form className="card" style={{ width: '400px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()} onSubmit={submitForm}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Agregar resultado</h3>

            {formError && <div style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.85rem' }}>{formError}</div>}

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label>Piloto
                <select required value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} className="input">
                  <option value="">Selecciona un piloto</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label>Escudería
                <select required value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })} className="input">
                  <option value="">Selecciona una escudería</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>Posición de salida
                <input type="number" value={form.gridPosition} onChange={e => setForm({ ...form, gridPosition: e.target.value })} className="input" />
              </label>
              <label>Posición final
                <input type="number" value={form.finalPosition} onChange={e => setForm({ ...form, finalPosition: e.target.value })} className="input" />
              </label>
              <label>Puntos
                <input type="number" step="0.5" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} className="input" />
              </label>
              <label>Estado
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
                  <option value="FINISHED">Finalizado</option>
                  <option value="DNF">Abandono (DNF)</option>
                  <option value="DSQ">Descalificado</option>
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.fastestLap} onChange={e => setForm({ ...form, fastestLap: e.target.checked })} />
                Vuelta rápida
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.pole} onChange={e => setForm({ ...form, pole: e.target.checked })} />
                Pole position
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm">Guardar resultado</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
};

export default RaceResultsPage;