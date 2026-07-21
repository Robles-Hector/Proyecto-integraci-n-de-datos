package edu.espe.f1.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.espe.f1.dto.TeamMapper;
import edu.espe.f1.dto.TeamRequestDTO;
import edu.espe.f1.entity.Driver;
import edu.espe.f1.entity.Team;
import edu.espe.f1.entity.User;
import edu.espe.f1.repository.DriverRepository;
import edu.espe.f1.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import edu.espe.f1.entity.Race;
import edu.espe.f1.entity.RaceResult;
import edu.espe.f1.repository.RaceRepository;
import edu.espe.f1.repository.RaceResultRepository;

import java.util.HashMap;

import edu.espe.f1.dto.TeamRequestDTO;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private ChangeLogService changeLogService;
    @Autowired
    private RaceRepository raceRepository;
    @Autowired
    private RaceResultRepository raceResultRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── CRUD básico ───────────────────────────────────────────────

    public List<Team> getAllTeams() {
        return teamRepository.findByStatus(Team.TeamStatus.APPROVED);
    }

    public Team getTeamById(String id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escudería no encontrada con ID: " + id));
    }

    public List<Team> searchTeams(String name) {
        return teamRepository.findByNameContainingIgnoreCase(name);
    }

    public Team createTeam(TeamRequestDTO dto) {
        if (teamRepository.existsById(dto.id())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La escudería ya existe con el ID: " + dto.id());
        }
        Team team = TeamMapper.toEntity(dto);
        team.setStatus(Team.TeamStatus.APPROVED);
        Team saved = teamRepository.save(team);
        changeLogService.log("CREATE", "Team", saved.getId(), currentUsername(),
                "Equipo creado: " + saved.getName());
        return saved;
    }

    public Team updateTeam(String id, TeamRequestDTO dto) {
        Team team = getTeamById(id);
        team.setName(dto.name());
        team.setFullName(dto.fullName());
        team.setBase(dto.base());
        team.setFounded(dto.founded());
        team.setChampionships(dto.championships());
        team.setColor(dto.color());
        team.setWins(dto.wins());
        Team saved = teamRepository.save(team);
        changeLogService.log("UPDATE", "Team", saved.getId(), currentUsername(),
                "Equipo actualizado: " + saved.getName());
        return saved;
    }

    public void deleteTeam(String id) {
        Team team = getTeamById(id);
        team.setStatus(Team.TeamStatus.DELETED);
        teamRepository.save(team);
        changeLogService.log("DELETE", "Team", team.getId(), currentUsername(),
                "Equipo desactivado (eliminación lógica): " + team.getName());
    }

    // ── POSTULACIONES ─────────────────────────────────────────────

    // Crear postulación (usuario normal)
    public Team submitTeam(Map<String, Object> body, User submittedBy) {
        Team team = new Team();

        String teamName = (String) body.get("teamName");

        if (teamName == null || teamName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre corto del equipo es obligatorio");
        }
        if (teamName.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El nombre corto no puede superar los 20 caracteres");
        }

        // ── Validación de color duplicado ─────────────────────────────
        String color = (String) body.getOrDefault("color", "#ff0000");
        boolean colorTaken = teamRepository.findByStatus(Team.TeamStatus.APPROVED).stream()
                .anyMatch(t -> t.getColor() != null && t.getColor().equalsIgnoreCase(color));
        if (colorTaken) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ese color ya está en uso por otra escudería. Elige un color distinto.");
        }

        // ── Validación de pilotos (número duplicado y regla del #1) ────
        List<Map<String, Object>> pilotsRaw;
        try {
            pilotsRaw = (List<Map<String, Object>>) body.get("pilots");
        } catch (Exception ex) {
            pilotsRaw = List.of();
        }

        List<Integer> submittedNumbers = new java.util.ArrayList<>();
        Driver champion = getCurrentChampion();

        for (Map<String, Object> p : pilotsRaw) {
            if (p.get("number") == null)
                continue;
            int number = Integer.parseInt(String.valueOf(p.get("number")));
            String pilotName = String.valueOf(p.getOrDefault("name", "")).trim();

            // No repetir número entre los pilotos del mismo formulario
            if (submittedNumbers.contains(number)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Los dos pilotos no pueden tener el mismo número (" + number + ")");
            }
            submittedNumbers.add(number);

            // No repetir número con un piloto activo ya existente
            if (driverRepository.existsByNumberAndActiveTrue(number)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El número " + number + " ya está siendo usado por otro piloto activo");
            }

            // El número 1 solo puede usarlo el campeón vigente de la temporada actual
            if (number == 1) {
                boolean isChampion = champion != null && champion.getName().equalsIgnoreCase(pilotName);
                if (!isChampion) {
                    String championName = champion != null ? champion.getName() : "el campeón vigente";
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "El número 1 está reservado para " + championName + ", campeón de la temporada actual");
                }
            }
        }

        String teamId = teamName.toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-");
        team.setId(teamId);
        team.setName(teamName);
        team.setFullName((String) body.get("fullName"));
        team.setBase((String) body.get("base"));
        team.setFounded(Integer.parseInt(String.valueOf(body.get("founded"))));
        team.setColor((String) body.getOrDefault("color", "#ff0000"));
        team.setChampionships(0);
        team.setWins(0);
        team.setStatus(Team.TeamStatus.PENDING);
        team.setNotes((String) body.getOrDefault("notes", ""));
        team.setSubmittedBy(submittedBy);

        try {
            Object pilots = body.get("pilots");
            team.setPilotsData(mapper.writeValueAsString(pilots));
        } catch (Exception e) {
            team.setPilotsData("[]");
        }

        if (teamRepository.existsById(teamId)) {
            team.setId(teamId + "-" + System.currentTimeMillis());
        }

        Team saved = teamRepository.save(team);
        changeLogService.log("CREATE", "Team", saved.getId(), currentUsername(),
                "Postulación enviada: " + saved.getName() + " (pendiente de revisión)");
        return saved;
    }

    public List<Team> getPendingTeams() {
        return teamRepository.findByStatus(Team.TeamStatus.PENDING);
    }

    public List<Team> getRejectedTeams() {
        return teamRepository.findByStatus(Team.TeamStatus.REJECTED);
    }

    public List<Team> getMySubmissions(User user) {
        return teamRepository.findBySubmittedBy(user);
    }

    // Aprobar equipo → cambia status e inserta pilotos en drivers
    @Transactional
    public Team approveTeam(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equipo no encontrado: " + id));

        if (team.getStatus() != Team.TeamStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se pueden aprobar equipos en estado PENDING");
        }

        team.setStatus(Team.TeamStatus.APPROVED);
        teamRepository.save(team);

        List<String> insertedPilots = insertPilotsFromTeam(team);

        changeLogService.log("UPDATE", "Team", team.getId(), currentUsername(),
                "Equipo aprobado: " + team.getName() +
                        (insertedPilots.isEmpty() ? ""
                                : " — pilotos insertados: " + String.join(", ", insertedPilots)));

        return team;
    }

    // Rechazar equipo con motivo
    public Team rejectTeam(String id, String reason) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equipo no encontrado: " + id));

        if (team.getStatus() != Team.TeamStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se pueden rechazar equipos en estado PENDING");
        }

        team.setStatus(Team.TeamStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            team.setNotes(reason);
        }
        Team saved = teamRepository.save(team);
        changeLogService.log("UPDATE", "Team", saved.getId(), currentUsername(),
                "Equipo rechazado: " + saved.getName()
                        + (reason != null && !reason.isBlank() ? " — motivo: " + reason : ""));
        return saved;
    }

    // ── HELPER: insertar pilotos al aprobar equipo ────────────────
    // Devuelve los nombres de los pilotos insertados, para incluirlos en el log de
    // auditoría
    private List<String> insertPilotsFromTeam(Team team) {
        List<String> insertedNames = new java.util.ArrayList<>();
        if (team.getPilotsData() == null || team.getPilotsData().isBlank())
            return insertedNames;

        try {
            List<Map<String, Object>> pilots = mapper.readValue(
                    team.getPilotsData(),
                    new TypeReference<>() {
                    });

            for (int i = 0; i < pilots.size(); i++) {
                Map<String, Object> p = pilots.get(i);
                String name = (String) p.get("name");
                if (name == null || name.isBlank())
                    continue;

                // Evitar duplicar un piloto que ya existe activo con el mismo nombre
                boolean alreadyExists = driverRepository.findByActiveTrue().stream()
                        .anyMatch(d -> d.getName().equalsIgnoreCase(name.trim()));
                if (alreadyExists) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Ya existe un piloto activo llamado \"" + name + "\". No se puede registrar duplicado.");
                }

                Driver driver = new Driver();

                String slug = name.toLowerCase()
                        .replaceAll("[^a-z0-9]", "-")
                        .replaceAll("-+", "-");
                driver.setId(slug + "-" + System.currentTimeMillis() + i);
                driver.setSlug(slug);
                driver.setName(name);
                driver.setNationality((String) p.getOrDefault("nationality", "Desconocida"));
                driver.setBorn((String) p.getOrDefault("born", ""));
                driver.setNumber(Integer.parseInt(String.valueOf(p.getOrDefault("number", 99))));
                driver.setChampionships(0);
                driver.setWins(0);
                driver.setPodiums(0);
                driver.setPoles(0);
                driver.setPoints(0.0);
                driver.setBio("Piloto incorporado con " + team.getName() + " en 2027.");
                driver.setActive(true);
                driver.setCurrentTeam(team);

                driverRepository.save(driver);
                insertedNames.add(name);
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al insertar pilotos del equipo " + team.getId() + ": " + e.getMessage());
        }

        return insertedNames;
    }

    // Calcula el piloto con más puntos en la temporada más reciente con carreras
    // registradas
    private Driver getCurrentChampion() {
        Integer latestSeason = raceRepository.findAll().stream()
                .map(Race::getSeason)
                .max(Integer::compareTo)
                .orElse(null);
        if (latestSeason == null)
            return null;

        List<Long> seasonRaceIds = raceRepository.findBySeasonOrderByRoundAsc(latestSeason).stream()
                .map(Race::getId)
                .collect(java.util.stream.Collectors.toList());

        Map<String, Double> pointsByDriver = new HashMap<>();
        for (Long raceId : seasonRaceIds) {
            for (RaceResult r : raceResultRepository.findByRaceIdAndActiveTrue(raceId)) {
                pointsByDriver.merge(r.getDriver().getId(), r.getPoints().doubleValue(), Double::sum);
            }
        }

        return pointsByDriver.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> driverRepository.findById(e.getKey()).orElse(null))
                .orElse(null);
    }

    // ── HELPER ───────────────────────────────────────────────────
    private String currentUsername() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anónimo";
    }
}