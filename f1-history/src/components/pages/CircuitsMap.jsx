import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useTheme } from '../../context/AppContext';
import 'leaflet/dist/leaflet.css';

const CircuitsMap = ({ circuits, onSelect }) => {
  const { dark } = useTheme();

  // Estilo del punto según el tema — brillante en ambos, pero con color que resalta sobre el fondo del mapa
  const markerColor = dark ? '#39FF88' : '#E50914';
  const glowColor   = dark ? 'rgba(57,255,136,0.6)' : 'rgba(229,9,20,0.5)';

  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div style={{ height: '420px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2rem' }}>
      <MapContainer
        center={[25, 10]}
        zoom={2}
        minZoom={2}
        style={{ height: '100%', width: '100%', background: dark ? '#0d1117' : '#eef2f5' }}
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />

        {circuits.filter(c => c.lat != null && c.lng != null).map(c => (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={7}
            pathOptions={{
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.9,
              weight: 2,
            }}
            className="circuit-glow-marker"
            eventHandlers={{
              click: () => onSelect && onSelect(c.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: '0.78rem' }}>{c.country}</div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <style>{`
        .circuit-glow-marker path {
          filter: drop-shadow(0 0 6px ${glowColor});
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default CircuitsMap;