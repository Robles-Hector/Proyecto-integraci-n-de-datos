package edu.espe.f1.service;

import edu.espe.f1.dto.RaceRequestDTO;
import edu.espe.f1.entity.Circuit;
import edu.espe.f1.entity.Race;
import edu.espe.f1.repository.CircuitRepository;
import edu.espe.f1.repository.RaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RaceService {

    @Autowired
    private RaceRepository raceRepository;
    @Autowired
    private CircuitRepository circuitRepository;
    @Autowired
    private ChangeLogService changeLogService;

    public List<Race> getAllRaces() {
        return raceRepository.findByActiveTrue();
    }

    public Race getRaceById(Long id) {
        return raceRepository.findById(id)
                .filter(Race::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Carrera no encontrada con id: " + id));
    }

    public List<Race> getRacesBySeason(Integer season) {
        return raceRepository.findBySeasonAndActiveTrueOrderByRoundAsc(season);
    }

    public Race createRace(RaceRequestDTO dto) {
        Circuit circuit = circuitRepository.findById(dto.circuitId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Circuito no encontrado con id: " + dto.circuitId()));

        boolean roundExists = raceRepository.findBySeasonAndActiveTrueOrderByRoundAsc(dto.season()).stream()
                .anyMatch(r -> r.getRound().equals(dto.round()));
        if (roundExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una carrera en la temporada " + dto.season() + " con la ronda " + dto.round());
        }

        Race race = new Race();
        race.setSeason(dto.season());
        race.setRound(dto.round());
        race.setCircuit(circuit);
        race.setRaceDate(dto.raceDate());
        race.setLapsTotal(dto.lapsTotal());
        race.setActive(true);

        Race saved = raceRepository.save(race);
        changeLogService.log("CREATE", "Race", String.valueOf(saved.getId()), currentUsername(),
                "Carrera creada: temporada " + saved.getSeason() + ", ronda " + saved.getRound() + " en "
                        + circuit.getName());
        return saved;
    }

    public Race updateRace(Long id, RaceRequestDTO dto) {
        Race race = getRaceById(id);

        Circuit circuit = circuitRepository.findById(dto.circuitId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Circuito no encontrado con id: " + dto.circuitId()));
        race.setCircuit(circuit);

        race.setSeason(dto.season());
        race.setRound(dto.round());
        race.setRaceDate(dto.raceDate());
        race.setLapsTotal(dto.lapsTotal());

        Race saved = raceRepository.save(race);
        changeLogService.log("UPDATE", "Race", String.valueOf(saved.getId()), currentUsername(),
                "Carrera actualizada: temporada " + saved.getSeason() + ", ronda " + saved.getRound());
        return saved;
    }

    public void deleteRace(Long id) {
        Race race = getRaceById(id);
        race.setActive(false);
        raceRepository.save(race);
        changeLogService.log("DELETE", "Race", String.valueOf(race.getId()), currentUsername(),
                "Carrera desactivada (eliminación lógica): temporada " + race.getSeason() + ", ronda "
                        + race.getRound());
    }

    private String currentUsername() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anónimo";
    }
}