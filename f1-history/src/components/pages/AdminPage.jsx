import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';

const API = 'http://localhost:8082/api';

const AdminPage = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [changeLogs, setChangeLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const LOG_PAGE_SIZE = 15;

  const [tab, setTab] = useState('pending');
  const [pendingTeams, setPendingTeams] = useState([]);
  const [rejectedTeams, setRejectedTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Transferencia
  const [transferDriverId, setTransferDriverId] = useState('');
  const [transferToTeam, setTransferToTeam] = useState('');
  const [transferSeason, setTransferSeason] = useState('2027');
  const [transferNotes, setTransferNotes] = useState('');

  // Rechazo
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const authHeaders = { 'Authorization': `Bearer ${user?.token}` };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/teams/pending`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${API}/teams/rejected`, { headers: authHeaders }).then(r => r.json()),
      fetch(`${API}/drivers`).then(r => r.json()),
      fetch(`${API}/teams`).then(r => r.json()),
      fetch(`${API}/change-logs`, { headers: authHeaders }).then(r => r.json()),
    ])
      .then(([pending, rejected, driversData, teamsData, logsData]) => {
        setPendingTeams(pending);
        setRejectedTeams(rejected);
        setDrivers(driversData);
        setTeams(teamsData);
        setChangeLogs(logsData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/teams/${id}/approve`, {
        method: 'PUT',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al aprobar');
      showToast(data.message);
      loadData();
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API}/teams/${id}/reject`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al rechazar');
      showToast(data.message);
      setRejectingId(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  };

  const handleTransfer = async () => {
    if (!transferDriverId || !transferToTeam) {
      showToast('⚠️ Selecciona piloto y equipo destino');
      return;
    }
    try {
      const res = await fetch(`${API}/drivers/${transferDriverId}/transfer`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toTeamId: transferToTeam,
          season: parseInt(transferSeason),
          notes: transferNotes
        })
      });
      if (!res.ok) throw new Error('Error al realizar la transferencia');
      const driver = drivers.find(d => d.id === transferDriverId);
      const team = teams.find(t => t.id === transferToTeam);
      showToast(`🔄 ${driver?.name} transferido a ${team?.name} para ${transferSeason}`);
      setTransferDriverId(''); setTransferToTeam(''); setTransferNotes('');
      loadData();
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  };

  const handleDeleteDriver = async (id, name) => {
    if (!window.confirm(`¿Desactivar a ${name}? Esta acción se puede revertir luego.`)) return;
    try {
      const res = await fetch(`${API}/drivers/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Error al desactivar el piloto');
      showToast(`🗑 ${name} desactivado correctamente`);
      loadData();
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  };

  if (!isAdmin) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Acceso Restringido</div>
        <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Necesitas iniciar sesión como administrador.</div>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Ir al Login</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">⚙️ Administrador</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--hero-text-primary)' }}>Panel de Administración</h1>
          <p style={{ color: 'var(--hero-text-secondary)' }}>Gestiona postulaciones, transferencias y datos del campeonato</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-tabs">
          <button className={`page-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            📋 Pendientes ({pendingTeams.length})
          </button>
          <button className={`page-tab ${tab === 'rejected' ? 'active' : ''}`} onClick={() => setTab('rejected')}>
            ❌ Rechazados ({rejectedTeams.length})
          </button>
          <button className={`page-tab ${tab === 'transfers' ? 'active' : ''}`} onClick={() => setTab('transfers')}>
            🔄 Transferencias
          </button>
          <button className={`page-tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => { setTab('logs'); setLogPage(1); }}>
            📜 Historial ({changeLogs.length})
          </button>
          <button className={`page-tab ${tab === 'drivers' ? 'active' : ''}`} onClick={() => setTab('drivers')}>
            🏎 Pilotos ({drivers.length})
          </button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando...</div>}

        {/* ── PENDIENTES ─────────────────────────────────────── */}
        {!loading && tab === 'pending' && (
          pendingTeams.length === 0 ? (
            <EmptyState icon="📋" title="No hay escuderías pendientes" subtitle="Las nuevas postulaciones aparecerán aquí." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingTeams.map(t => {
                let pilots = [];
                try { pilots = JSON.parse(t.pilotsData || '[]'); } catch { }
                return (
                  <div key={t.id} className="card">
                    <TeamHeader team={t} badge="🕐 Pendiente" badgeColor="var(--accent-gold)" />
                    <PilotsGrid pilots={pilots} />
                    {t.notes && <Notes text={t.notes} />}
                    {t.submittedBy && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Postulado por: <strong>{t.submittedBy.username}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(t.id)}>✅ Aprobar</button>
                      {rejectingId === t.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                          <input className="form-input" placeholder="Motivo del rechazo (opcional)"
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            style={{ flex: 1 }} />
                          <button className="btn btn-secondary btn-sm" onClick={() => handleReject(t.id)}>Confirmar</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancelar</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setRejectingId(t.id)}>❌ Rechazar</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── RECHAZADOS ─────────────────────────────────────── */}
        {!loading && tab === 'rejected' && (
          rejectedTeams.length === 0 ? (
            <EmptyState icon="❌" title="No hay escuderías rechazadas" subtitle="Los equipos rechazados aparecerán aquí." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rejectedTeams.map(t => (
                <div key={t.id} className="card">
                  <TeamHeader team={t} badge="❌ Rechazado" badgeColor="var(--accent)" />
                  {t.notes && <Notes text={t.notes} label="Motivo:" />}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── TRANSFERENCIAS ──────────────────────────────────── */}
        {!loading && tab === 'transfers' && (
          <div className="admin-form">
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              🔄 Transferir Piloto
            </div>
            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Piloto</label>
                <select className="form-input" value={transferDriverId} onChange={e => setTransferDriverId(e.target.value)}>
                  <option value="">Selecciona un piloto</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.currentTeam?.name || 'Sin equipo'})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Equipo Destino</label>
                <select className="form-input" value={transferToTeam} onChange={e => setTransferToTeam(e.target.value)}>
                  <option value="">Selecciona equipo</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Temporada</label>
                <input className="form-input" type="number" value={transferSeason} onChange={e => setTransferSeason(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Notas</label>
              <textarea className="form-input" rows={2} placeholder="Motivo del cambio, contrato, etc."
                value={transferNotes} onChange={e => setTransferNotes(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleTransfer}>🔄 Confirmar Transferencia</button>
          </div>
        )}

        {/* ── ELIMINACIÓN DE PILOTO ────────────────────────────── */}
        {!loading && tab === 'drivers' && (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Piloto</th><th>Escudería</th><th>Número</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{d.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.currentTeam?.name ?? 'Sin equipo'}</td>
                    <td style={{ fontFamily: "'Share Tech Mono',monospace" }}>#{d.number}</td>
                    <td>
                      <span style={{ color: d.active !== false ? '#2ecc71' : 'var(--accent)', fontWeight: '700', fontSize: '0.8rem' }}>
                        {d.active !== false ? '● Activo' : '● Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteDriver(d.id, d.name)}>
                        🗑 Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── HISTORIAL DE CAMBIOS ────────────────────────────── */}
        {!loading && tab === 'logs' && (
          changeLogs.length === 0 ? (
            <EmptyState icon="📜" title="Sin actividad registrada" subtitle="Los cambios y búsquedas aparecerán aquí." />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Fecha</th><th>Acción</th><th>Entidad</th><th>Detalle</th><th>Usuario</th></tr>
                  </thead>
                  <tbody>
                    {changeLogs
                      .slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE)
                      .map(log => (
                        <tr key={log.id}>
                          <td style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString('es-EC')}
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700',
                              background: log.action === 'CREATE' ? 'rgba(46,204,113,0.12)' : log.action === 'DELETE' ? 'rgba(229,9,20,0.12)' : log.action === 'SEARCH' ? 'rgba(52,152,219,0.12)' : 'rgba(245,197,24,0.12)',
                              color: log.action === 'CREATE' ? '#2ecc71' : log.action === 'DELETE' ? 'var(--accent)' : log.action === 'SEARCH' ? '#3498db' : 'var(--accent-gold)',
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{log.entityType}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.details}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{log.performedBy}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {changeLogs.length > LOG_PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={logPage === 1}
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                    style={{ opacity: logPage === 1 ? 0.4 : 1, cursor: logPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Página {logPage} de {Math.ceil(changeLogs.length / LOG_PAGE_SIZE)}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={logPage >= Math.ceil(changeLogs.length / LOG_PAGE_SIZE)}
                    onClick={() => setLogPage(p => p + 1)}
                    style={{ opacity: logPage >= Math.ceil(changeLogs.length / LOG_PAGE_SIZE) ? 0.4 : 1, cursor: logPage >= Math.ceil(changeLogs.length / LOG_PAGE_SIZE) ? 'not-allowed' : 'pointer' }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>

      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
    <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</div>
    <div style={{ fontSize: '0.85rem' }}>{subtitle}</div>
  </div>
);

const TeamHeader = ({ team, badge, badgeColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: team.color, border: '3px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{team.name}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{team.fullName}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{team.base} · Fundado: {team.founded}</div>
      </div>
    </div>
    <div style={{ background: 'rgba(0,0,0,0.05)', border: `1px solid ${badgeColor}`, color: badgeColor, padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
      {badge}
    </div>
  </div>
);

const PilotsGrid = ({ pilots }) => (
  pilots.length > 0 && (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      {pilots.map((p, i) => (
        <div key={i} style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Piloto {i + 1}</div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.nationality} · #{p.number}</div>
        </div>
      ))}
    </div>
  )
);

const Notes = ({ text, label = '📝' }) => (
  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
    {label} {text}
  </div>
);

export default AdminPage;
