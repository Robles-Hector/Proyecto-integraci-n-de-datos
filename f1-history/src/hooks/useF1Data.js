import { useState, useEffect, useCallback } from 'react';
import localData from '../data/f1Data.json'; 

export const useF1Data = () => {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [raceResults, setRaceResults] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seasons = localData.seasons;
  const recentRaces = localData.recentRaces;

  const API_BASE_URL = 'http://localhost:8082/api';

  const fetchBackendData = useCallback(async () => {
    try {
      setLoading(true);

      const [teamsResponse, driversResponse, racesResponse, resultsResponse, circuitsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/teams`),
        fetch(`${API_BASE_URL}/drivers`),
        fetch(`${API_BASE_URL}/races`),
        fetch(`${API_BASE_URL}/race-results`),
        fetch(`${API_BASE_URL}/circuits`)
      ]);

      if (!teamsResponse.ok || !driversResponse.ok || !racesResponse.ok || !resultsResponse.ok || !circuitsResponse.ok) {
        throw new Error('No se pudo conectar con la API de Spring Boot. ¡Asegúrate de que el backend esté corriendo!');
      }

      const teamsData    = await teamsResponse.json();
      const driversData  = await driversResponse.json();
      const racesData    = await racesResponse.json();
      const resultsData  = await resultsResponse.json();
      const circuitsData = await circuitsResponse.json();

      setTeams(teamsData);
      setDrivers(driversData);
      setRaces(racesData);
      setRaceResults(resultsData);
      setCircuits(circuitsData);
      setError(null);
    } catch (err) {
      console.error("Error de integración:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  return {
    loading,
    error,
    seasons,
    recentRaces,
    teams,
    drivers,
    races,
    raceResults,
    circuits,
    refetch: fetchBackendData
  };
};

export const LoadingScreen = () => (
  <div style={{
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '1rem'
  }}>
    <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>🏎️</div>
    <div style={{ fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
      Cargando datos desde Spring Boot...
    </div>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const ErrorScreen = ({ message }) => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
    <div style={{ fontSize: '3rem' }}>⚠️</div>
    <div style={{ fontWeight: '700', color: 'var(--accent)' }}>Error al sincronizar el sistema</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '400px' }}>{message}</div>
  </div>
);