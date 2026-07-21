import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { useF1Data, LoadingScreen, ErrorScreen } from '../../hooks/useF1Data';

const API = 'http://localhost:8082/api';

const emptyForm = { season: '', round: '', circuitId: '', raceDate: '', lapsTotal: '' };

const RacesPage = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { loading, error, races, refetch } = useF1Data();

  const [season, setSeason] = useState(null);
  const [circuits, setCircuits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${API}/circuits`).then(r => r.json()).then(setCircuits).catch(() => setCircuits([]));
  }, []);

  if (loading) return <div className="page"><LoadingScreen /></div>;
  if (error) return <div className="page"><ErrorScreen message={error} /></div>;

  const seasons = [...new Set(races.map(r => r.season))].sort();
  const currentSeason = season || (seasons.length ? seasons[seasons.length - 1] : null);
  const filtered = races.filter(r => r.season === currentSeason).sort((a, b) => a.round - b.round);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (race) => {
    setEditingId(race.id);
    setForm({
      season: race.season, round: race.round,
      circuitId: race.circuitId, raceDate: race.raceDate, lapsTotal: race.lapsTotal
    });
    setFormError('');
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/races/${editingId}` : `${API}/races`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          season: Number(form.season),
          round: Number(form.round),
          circuitId: Number(form.circuitId),
          raceDate: form.raceDate,
          lapsTotal: Number(form.lapsTotal)
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo guardar la carrera');
      }

      setShowForm(false);
      setToast(editingId ? '✅ Carrera actualizada correctamente' : '✅ Carrera creada correctamente');
      setTimeout(() => setToast(null), 4000);
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">🏁 Calendario</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>Carreras</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Todas las carreras disputadas, por temporada — 2020 a 2026</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {seasons.map(y => (
              <button key={y} onClick={() => { setSeason(y); setPage(1); }} style={{
                padding: '0.5rem 1.25rem', borderRadius: '4px', border: '1px solid',
                fontWeight: '700', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.9rem',
                cursor: 'pointer',
                background: currentSeason === y ? 'var(--accent)' : 'var(--bg-card)',
                borderColor: currentSeason === y ? 'var(--accent)' : 'var(--border)',
                color: currentSeason === y ? 'white' : 'var(--text-secondary)',
              }}>{y}</button>
            ))}
          </div>

          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Agregar carrera</button>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ronda</th><th>Circuito</th><th>Fecha</th><th>Vueltas</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map(race => (
                <tr key={race.id}>
                  <td style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: '700', color: 'var(--accent)' }}>{race.round}</td>
                  <td style={{ cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '700' }}
                    onClick={() => navigate(`/carreras/${race.id}`)}>
                    {race.circuitName}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{race.raceDate}</td>
                  <td style={{ fontFamily: "'Share Tech Mono',monospace", color: 'var(--text-secondary)' }}>{race.lapsTotal}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(race)}>Editar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
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


        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
            <div style={{ fontWeight: '700' }}>No hay carreras registradas en esta temporada</div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowForm(false)}>
          <form className="card" style={{ width: '400px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()} onSubmit={submitForm}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{editingId ? 'Editar carrera' : 'Agregar carrera'}</h3>

            {formError && <div style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.85rem' }}>{formError}</div>}

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label>Temporada
                <input type="number" required value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} className="input" />
              </label>
              <label>Ronda
                <input type="number" required value={form.round} onChange={e => setForm({ ...form, round: e.target.value })} className="input" />
              </label>
              <label>Circuito
                <select required value={form.circuitId} onChange={e => setForm({ ...form, circuitId: e.target.value })} className="input">
                  <option value="">Selecciona un circuito</option>
                  {circuits.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>Fecha
                <input type="date" required value={form.raceDate} onChange={e => setForm({ ...form, raceDate: e.target.value })} className="input" />
              </label>
              <label>Vueltas totales
                <input type="number" required value={form.lapsTotal} onChange={e => setForm({ ...form, lapsTotal: e.target.value })} className="input" />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm">{editingId ? 'Guardar cambios' : 'Crear carrera'}</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
};

export default RacesPage;