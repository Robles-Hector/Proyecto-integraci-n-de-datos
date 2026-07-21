package edu.espe.f1.service;

import edu.espe.f1.dto.*;
import edu.espe.f1.entity.*;
import edu.espe.f1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired private DriverRepository   driverRepository;
    @Autowired private TeamRepository     teamRepository;
    @Autowired private CircuitRepository  circuitRepository;
    @Autowired private RaceRepository     raceRepository;
    @Autowired private ChangeLogService   changeLogService;

    public Map<String, Object> search(String query, String type, String performedBy) {
        String q = query.trim();
        boolean all = type == null || type.isBlank() || type.equalsIgnoreCase("all");
        Integer numericQuery = tryParseInt(q);

        Map<String, Object> results = new LinkedHashMap<>();

        if (all || type.equalsIgnoreCase("drivers")) {
            List<DriverResponseDTO> drivers = driverRepository.findByActiveTrue().stream()
                .filter(d -> contains(d.getName(), q) || contains(d.getNationality(), q))
                .map(DriverMapper::toDTO)
                .collect(Collectors.toList());
            results.put("drivers", drivers);
        }

        if (all || type.equalsIgnoreCase("teams")) {
            List<TeamResponseDTO> teams = teamRepository.findByStatus(Team.TeamStatus.APPROVED).stream()
                .filter(t -> contains(t.getName(), q) || contains(t.getFullName(), q) || contains(t.getBase(), q))
                .map(TeamMapper::toDTO)
                .collect(Collectors.toList());
            results.put("teams", teams);
        }

        if (all || type.equalsIgnoreCase("circuits")) {
            List<CircuitResponseDTO> circuits = circuitRepository.findAll().stream()
                .filter(c -> contains(c.getName(), q) || contains(c.getCountry(), q) || contains(c.getCity(), q))
                .map(CircuitMapper::toDTO)
                .collect(Collectors.toList());
            results.put("circuits", circuits);
        }

        if (all || type.equalsIgnoreCase("races")) {
            List<RaceResponseDTO> races = raceRepository.findAll().stream()
                .filter(r ->
                    (numericQuery != null && (r.getSeason().equals(numericQuery) || r.getRound().equals(numericQuery)))
                    || contains(r.getCircuit().getName(), q)
                    || contains(r.getCircuit().getCountry(), q)
                )
                .map(RaceMapper::toDTO)
                .collect(Collectors.toList());
            results.put("races", races);
        }

        changeLogService.log("SEARCH", "Search", q, performedBy,
            "Búsqueda: \"" + q + "\"" + (all ? "" : " (filtro: " + type + ")"));

        return results;
    }

    private boolean contains(String field, String q) {
        return field != null && field.toLowerCase().contains(q.toLowerCase());
    }

    private Integer tryParseInt(String s) {
        try { return Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
    }
}