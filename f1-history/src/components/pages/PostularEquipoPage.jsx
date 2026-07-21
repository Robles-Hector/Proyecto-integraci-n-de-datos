import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';

// Diccionario país (inglés, tal como lo da la API) → gentilicio en español
const COUNTRY_TO_DEMONYM_ES = {
  'Netherlands': 'Neerlandés', 'United Kingdom': 'Británico', 'Germany': 'Alemán',
  'Spain': 'Español', 'Italy': 'Italiano', 'France': 'Francés', 'Monaco': 'Monegasco',
  'Belgium': 'Belga', 'Austria': 'Austríaco', 'Switzerland': 'Suizo', 'Finland': 'Finlandés',
  'Denmark': 'Danés', 'Sweden': 'Sueco', 'Norway': 'Noruego', 'Poland': 'Polaco',
  'Portugal': 'Portugués', 'Ireland': 'Irlandés', 'Russia': 'Ruso', 'Thailand': 'Tailandés',
  'Japan': 'Japonés', 'China': 'Chino', 'India': 'Indio', 'Australia': 'Australiano',
  'New Zealand': 'Neozelandés', 'Canada': 'Canadiense', 'United States': 'Estadounidense',
  'Mexico': 'Mexicano', 'Brazil': 'Brasileño', 'Argentina': 'Argentino', 'Chile': 'Chileno',
  'Colombia': 'Colombiano', 'Ecuador': 'Ecuatoriano', 'Peru': 'Peruano', 'Venezuela': 'Venezolano',
  'Uruguay': 'Uruguayo', 'Paraguay': 'Paraguayo', 'Bolivia': 'Boliviano',
  'South Africa': 'Sudafricano', 'Morocco': 'Marroquí', 'Egypt': 'Egipcio',
  'Saudi Arabia': 'Saudí', 'United Arab Emirates': 'Emiratí', 'Qatar': 'Catarí',
  'Bahrain': 'Bareiní', 'Turkey': 'Turco', 'Indonesia': 'Indonesio', 'Malaysia': 'Malasio',
  'Singapore': 'Singapurense', 'South Korea': 'Surcoreano', 'Hungary': 'Húngaro',
  'Czechia': 'Checo', 'Czech Republic': 'Checo', 'Greece': 'Griego', 'Croatia': 'Croata',
  'Ukraine': 'Ucraniano', 'Estonia': 'Estonio', 'Latvia': 'Letón', 'Lithuania': 'Lituano',
  'Iceland': 'Islandés', 'Luxembourg': 'Luxemburgués',
};

// Respaldo si la API no responde — nacionalidades más frecuentes en F1
const FALLBACK_NATIONALITIES = [
  'Alemán', 'Argentino', 'Australiano', 'Austríaco', 'Belga', 'Brasileño', 'Británico',
  'Canadiense', 'Checo', 'Chileno', 'Colombiano', 'Danés', 'Ecuatoriano', 'Español',
  'Estadounidense', 'Finlandés', 'Francés', 'Holandés', 'Húngaro', 'Italiano', 'Japonés',
  'Mexicano', 'Monegasco', 'Neerlandés', 'Neozelandés', 'Noruego', 'Polaco', 'Portugués',
  'Ruso', 'Sueco', 'Suizo', 'Tailandés',
].sort((a, b) => a.localeCompare(b, 'es'));

const API = 'http://localhost:8082/api';

const getMaxBirthDate = () => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0]; // formato YYYY-MM-DD
};

const Field = ({ label, fieldKey, placeholder, type = 'text', required, maxLength, max, form, setForm, errors }) => (
  <div className="form-group">
    <label className="form-label">{label}{required && ' *'}</label>
    <input
      className="form-input"
      type={type}
      placeholder={placeholder}
      value={form[fieldKey]}
      maxLength={maxLength}
      max={max}
      onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
      style={{ borderColor: errors[fieldKey] ? 'var(--accent)' : undefined }}
    />
    {maxLength && (
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        {form[fieldKey].length}/{maxLength}
      </span>
    )}
    {errors[fieldKey] && (
      <span style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>
        {errors[fieldKey] === 'age'
          ? 'El piloto debe ser mayor de 18 años'
          : errors[fieldKey] === 'letters'
            ? 'Solo se permiten letras'
            : errors[fieldKey] === 'duplicate'
              ? 'Los pilotos no pueden compartir número'
              : 'Campo requerido'}
      </span>
    )}
  </div>
);

// ── Estado inicial del formulario ─────────────────────────────────
const EMPTY_FORM = {
  teamName: '', fullName: '', base: '', founded: '', color: '#ff0000',
  pilot1Name: '', pilot1Nationality: '', pilot1Number: '', pilot1Born: '',
  pilot2Name: '', pilot2Nationality: '', pilot2Number: '', pilot2Born: '',
  notes: ''
};

// ── Componente principal ──────────────────────────────────────────
const PostularEquipoPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const isOnlyLetters = (str) => /^[a-zA-ZÀ-ÿñÑ\s]+$/.test(str.trim());

  const [existingDrivers, setExistingDrivers] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/drivers`).then(r => r.json()),
      fetch(`${API}/teams`).then(r => r.json())
    ]).then(([driversData, teamsData]) => {
      setExistingDrivers(driversData);
      setExistingTeams(teamsData);
    }).catch(() => { });
  }, []);

  const calculateAge = (birthDateStr) => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validate = () => {
    const e = {};
    [
      'teamName', 'fullName', 'base', 'founded',
      'pilot1Name', 'pilot1Nationality', 'pilot1Number', 'pilot1Born',
      'pilot2Name', 'pilot2Nationality', 'pilot2Number', 'pilot2Born'
    ].forEach(k => { if (!String(form[k]).trim()) e[k] = true; });

    // Nombres: solo letras (evita "123", números sueltos, símbolos)
    ['teamName', 'fullName', 'pilot1Name', 'pilot2Name'].forEach(k => {
      if (form[k].trim() && !isOnlyLetters(form[k])) {
        e[k] = 'letters';
      }
    });

    ['1', '2'].forEach(n => {
      const born = form[`pilot${n}Born`];
      if (born && calculateAge(born) < 18) {
        e[`pilot${n}Born`] = 'age';
      }
    });

    if (form.pilot1Number && form.pilot2Number && form.pilot1Number === form.pilot2Number) {
      e.pilot1Number = 'duplicate';
      e.pilot2Number = 'duplicate';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const [nationalities, setNationalities] = useState([]);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(r => {
        if (!r.ok) throw new Error('API no disponible');
        return r.json();
      })
      .then(data => {
        const translated = data
          .map(c => COUNTRY_TO_DEMONYM_ES[c.name.common])
          .filter(Boolean); // descarta países sin traducción en el diccionario

        const unique = [...new Set(translated)].sort((a, b) => a.localeCompare(b, 'es'));
        setNationalities(unique.length > 0 ? unique : FALLBACK_NATIONALITIES);
      })
      .catch(() => setNationalities(FALLBACK_NATIONALITIES));
  }, []);

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const body = {
      teamName: form.teamName,
      fullName: form.fullName,
      base: form.base,
      founded: form.founded,
      color: form.color,
      notes: form.notes,
      pilots: [
        { name: form.pilot1Name, nationality: form.pilot1Nationality, number: form.pilot1Number, born: form.pilot1Born },
        { name: form.pilot2Name, nationality: form.pilot2Nationality, number: form.pilot2Number, born: form.pilot2Born },
      ]
    };

    try {
      const res = await fetch(`${API}/teams/pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('No se pudo enviar la postulación');

      setSaved(true);
      setForm(EMPTY_FORM);
      setErrors({});
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Props compartidas que recibe cada Field
  const fieldProps = { form, setForm, errors };

  return (
    <div className="page">
      <div style={{ background: 'var(--gradient-hero)', padding: '4rem 0 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">🏁 Nueva Postulación</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--hero-text-primary)' }}>
            Postular Escudería
          </h1>
          <p style={{ color: 'var(--hero-text-secondary)' }}>
            Postula un nuevo equipo para la temporada 2027 — será revisado por un administrador
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem', maxWidth: '900px' }}>
        <div className="admin-form">
          <div className="admin-warning">
            <span className="admin-warning-icon">⚠️</span>
            <div className="admin-warning-text">
              <strong>Importante:</strong> Tu postulación quedará en estado <strong>pendiente</strong> hasta
              que un administrador la revise. Podrás ver el estado en{' '}
              <button
                onClick={() => navigate('/mis-postulaciones')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', padding: 0, textDecoration: 'underline' }}
              >
                Mis Postulaciones
              </button>.
            </div>
          </div>

          {apiError && (
            <div style={{ background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.3)', color: 'var(--accent)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* ── Datos del equipo ────────────────────────────── */}
          <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            🏁 Datos del Equipo
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>⚠️ Ya en uso (no puedes repetir):</div>
            <div style={{ marginBottom: '0.35rem' }}>
              <strong>Colores:</strong> {existingTeams.map(t => (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '10px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                  {t.color}
                </span>
              ))}
            </div>
            <div style={{ marginBottom: '0.35rem' }}>
              <strong>Nombres de equipo:</strong> {existingTeams.map(t => t.name).join(', ')}
            </div>
            <div>
              <strong>Números de piloto:</strong> {existingDrivers.map(d => d.number).sort((a, b) => a - b).join(', ')}
            </div>
          </div>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <Field label="Nombre Corto" fieldKey="teamName" placeholder="Ej: Andretti" maxLength={20} required {...fieldProps} />
            <Field label="Nombre Completo" fieldKey="fullName" placeholder="Ej: Andretti Cadillac F1 Team" required {...fieldProps} />
            <Field label="Base de Operaciones" fieldKey="base" placeholder="Ej: Silverstone, UK" required {...fieldProps} />
            <Field label="Año de Fundación" fieldKey="founded" placeholder="Ej: 2025" type="number" required {...fieldProps} />
            <div className="form-group">
              <label className="form-label">Color del Equipo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 48, height: 36, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {form.color}
                </span>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: form.color }} />
              </div>
            </div>
          </div>

          {/* ── Pilotos ─────────────────────────────────────── */}
          {['1', '2'].map(n => (
            <div key={n} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                🏎 Piloto {n}
              </div>
              <div className="form-grid">
                <Field label="Nombre Completo" fieldKey={`pilot${n}Name`} placeholder="Ej: Marco Rossi" required {...fieldProps} />

                <div className="form-group">
                  <label className="form-label">Nacionalidad *</label>
                  <select
                    className="form-input"
                    value={form[`pilot${n}Nationality`]}
                    onChange={e => setForm(f => ({ ...f, [`pilot${n}Nationality`]: e.target.value }))}
                    style={{ borderColor: errors[`pilot${n}Nationality`] ? 'var(--accent)' : undefined }}
                  >
                    <option value="">Selecciona una nacionalidad</option>
                    {nationalities.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                  </select>
                  {errors[`pilot${n}Nationality`] && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>Campo requerido</span>
                  )}
                </div>

                <Field label="Número" fieldKey={`pilot${n}Number`} placeholder="Ej: 23" type="number" required {...fieldProps} />
                <Field label="Fecha Nacimiento" fieldKey={`pilot${n}Born`} type="date" max={getMaxBirthDate()} required {...fieldProps} />
              </div>
            </div>
          ))}

          {/* ── Notas ───────────────────────────────────────── */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Notas Adicionales</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Información sobre el equipo, patrocinadores, etc."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : '✅ Enviar Postulación'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}>
              🗑 Limpiar
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Campos obligatorios</span>
          </div>
        </div>
      </div>

      {saved && <div className="success-toast">✅ Postulación enviada — revisa el estado en Mis Postulaciones</div>}
    </div>
  );
};

export default PostularEquipoPage;
