import React, { useState } from 'react';
import { useF1Data, LoadingScreen, ErrorScreen } from '../../hooks/useF1Data';
import CircuitsMap from './CircuitsMap';

const COUNTRY_FLAGS = {
  'Mónaco':'🇲🇨','Reino Unido':'🇬🇧','Italia':'🇮🇹','Bélgica':'🇧🇪',
  'EE.UU.':'🇺🇸','Japón':'🇯🇵','Brasil':'🇧🇷','EAU':'🇦🇪',
  'Baréin':'🇧🇭','Australia':'🇦🇺','España':'🇪🇸','Austria':'🇦🇹',
  'Hungría':'🇭🇺','Países Bajos':'🇳🇱','Singapur':'🇸🇬','China':'🇨🇳',
  'México':'🇲🇽','Qatar':'🇶🇦','Arabia Saudita':'🇸🇦',
};

const CONTINENTS = {
  'Europa':           ['Reino Unido','Italia','Bélgica','Mónaco','España','Austria','Hungría','Países Bajos'],
  'América':          ['EE.UU.','Brasil','México'],
  'Asia / Medio Oriente': ['Japón','EAU','Baréin','Singapur','China','Qatar','Arabia Saudita'],
  'Oceanía':          ['Australia'],
};

const getContinent = (country) => {
  for (const [cont, countries] of Object.entries(CONTINENTS)) {
    if (countries.includes(country)) return cont;
  }
  return 'Otro';
};

const CircuitsPage = () => {
  const { loading, error, circuits } = useF1Data();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCont, setFilterCont] = useState('all');

  if (loading) return <div className="page"><LoadingScreen /></div>;
  if (error)   return <div className="page"><ErrorScreen message={error} /></div>;

  const filtered = circuits.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchFilter = filterCont === 'all' || getContinent(c.country) === filterCont;
    return matchSearch && matchFilter;
  });

  const circuit = selected ? circuits.find(c => c.id === selected) : null;
  const currentYear = new Date().getFullYear();

  return (
    <div className="page">
      <div style={{ background:'var(--gradient-hero)', padding:'4rem 0 2.5rem', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div className="hero-eyebrow">🗺️ Circuitos</div>
          <h1 style={{ fontSize:'2.8rem', fontWeight:'900', marginBottom:'0.5rem', color:'white' }}>Mapa de Circuitos</h1>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>Los {circuits.length} circuitos que conforman el calendario de F1</p>
        </div>
      </div>

      <div className="container" style={{ padding:'2rem' }}>
        {/* Filtros */}
        <div style={{ display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
            <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>🔍</span>
            <input style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'6px', padding:'0.65rem 1rem 0.65rem 2.25rem', color:'var(--text-primary)', fontSize:'0.9rem', outline:'none' }}
              placeholder="Buscar circuito o país..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {['all', ...Object.keys(CONTINENTS)].map(c => (
              <button key={c} onClick={() => setFilterCont(c)} className={`btn btn-sm ${filterCont===c?'btn-primary':'btn-secondary'}`}>
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen por continente */}
        <div style={{ display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap' }}>
          {Object.entries(CONTINENTS).map(([cont, countries]) => {
            const count = circuits.filter(c => countries.includes(c.country)).length;
            return (
              <div key={cont} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.85rem 1.25rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'1.5rem', fontWeight:'900', color:'var(--accent)' }}>{count}</div>
                <div style={{ fontSize:'0.78rem', fontWeight:'700', color:'var(--text-muted)' }}>{cont}</div>
              </div>
            );
          })}
        </div>

        <CircuitsMap circuits={filtered} onSelect={(id) => setSelected(id === selected ? null : id)} />

        <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1fr':'1fr', gap:'1.5rem' }}>
          <div className="circuits-grid" style={{ alignContent:'start' }}>
            {filtered.map(c => (
              <div key={c.id} className="circuit-card"
                onClick={() => setSelected(selected===c.id ? null : c.id)}
                style={{ borderColor: selected===c.id ? 'var(--accent)' : 'var(--border)' }}>
                <div className="circuit-country-flag">{COUNTRY_FLAGS[c.country]||'🏁'}</div>
                <div className="circuit-name">{c.name}</div>
                <div className="circuit-location">{c.city}, {c.country}</div>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                  <span className="circuit-since">Desde {c.since}</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{c.laps} vueltas · {c.length} km</span>
                </div>
                <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--accent-green)', fontWeight:'700' }}>
                  ● Activo — {currentYear - c.since} años en F1
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)', gridColumn:'1/-1' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🗺️</div>
                <div style={{ fontWeight:'700' }}>No se encontraron circuitos</div>
              </div>
            )}
          </div>

          {circuit && (
            <div className="card" style={{ position:'sticky', top:'80px', alignSelf:'flex-start', border:'1px solid var(--border-accent)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>{COUNTRY_FLAGS[circuit.country]||'🏁'}</div>
                  <div style={{ fontWeight:'900', fontSize:'1.3rem', lineHeight:1.2, color:'var(--text-primary)' }}>{circuit.name}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'0.25rem' }}>{circuit.city}, {circuit.country}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
                {[
                  {l:'En F1 desde',    v:circuit.since},
                  {l:'Años activo',    v:`${currentYear - circuit.since} años`},
                  {l:'Vueltas',        v:circuit.laps},
                  {l:'Longitud',       v:`${circuit.length} km`},
                  {l:'Latitud',        v:circuit.lat?.toFixed(4)},
                  {l:'Longitud GPS',   v:circuit.lng?.toFixed(4)},
                ].map((s,i) => (
                  <div key={i} style={{ background:'var(--bg-secondary)', padding:'0.75rem 1rem', borderRadius:'6px', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.68rem', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{s.l}</div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontWeight:'700', color:'var(--accent)' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'1rem', background:'rgba(229,9,20,0.05)', border:'1px solid rgba(229,9,20,0.15)', borderRadius:'6px' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', marginBottom:'0.5rem' }}>📍 Distancia de carrera</div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.9rem', color:'var(--text-primary)', fontWeight:'700' }}>
                  {(circuit.laps * circuit.length).toFixed(1)} km totales
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitsPage;
