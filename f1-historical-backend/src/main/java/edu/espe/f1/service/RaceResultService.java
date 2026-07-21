package edu.espe.f1.service;

import edu.espe.f1.entity.*;
import edu.espe.f1.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class RaceResultService {

    @Autowired private RaceResultRepository raceResultRepository;
    @Autowired private RaceRepository       raceRepository;
    @Autowired private DriverRepository     driverRepository;
    @Autowired private TeamRepository       teamRepository;
    @Autowired private ChangeLogService     changeLogService;

    public List<RaceResult> getAllResults() {
        return raceResultRepository.findByActiveTrue();
    }

    public RaceResult getResultById(Long id) {
        return raceResultRepository.findById(id)
            .filter(RaceResult::isActive)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Resultado no encontrado con id: " + id));
    }

    public List<RaceResult> getResultsByRace(Long raceId) {
        return raceResultRepository.findByRaceIdAndActiveTrue(raceId);
    }

    public List<RaceResult> getResultsByDriver(String driverId) {
        return raceResultRepository.findByDriverIdAndActiveTrue(driverId);
    }

    @Transactional
    public RaceResult registerRaceResult(Map<String, Object> body) {

        Long   raceId   = Long.parseLong(String.valueOf(body.get("raceId")));
        String driverId = (String) body.get("driverId");
        String teamId   = (String) body.get("teamId");

        Race race = raceRepository.findById(raceId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Carrera no encontrada con id: " + raceId));

        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Piloto no encontrado con id: " + driverId));

        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Equipo no encontrado con id: " + teamId));

        if (raceResultRepository.existsByRaceIdAndDriverIdAndActiveTrue(raceId, driverId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Ya existe un resultado registrado para este piloto en esta carrera");
        }

        Integer gridPosition  = body.get("gridPosition")  != null ? Integer.parseInt(String.valueOf(body.get("gridPosition")))  : null;
        Integer finalPosition = body.get("finalPosition") != null ? Integer.parseInt(String.valueOf(body.get("finalPosition"))) : null;
        BigDecimal points     = new BigDecimal(String.valueOf(body.getOrDefault("points", "0")));
        String status         = (String) body.getOrDefault("status", "FINISHED");
        boolean fastestLap    = Boolean.parseBoolean(String.valueOf(body.getOrDefault("fastestLap", false)));
        boolean pole          = Boolean.parseBoolean(String.valueOf(body.getOrDefault("pole", false)));

        RaceResult result = new RaceResult();
        result.setRace(race);
        result.setDriver(driver);
        result.setTeam(team);
        result.setGridPosition(gridPosition);
        result.setFinalPosition(finalPosition);
        result.setPoints(points);
        result.setStatus(status);
        result.setFastestLap(fastestLap);
        result.setActive(true);

        raceResultRepository.save(result);

        driver.setPoints(driver.getPoints() + points.doubleValue());
        if (finalPosition != null && finalPosition == 1) {
            driver.setWins(driver.getWins() + 1);
        }
        if (finalPosition != null && finalPosition <= 3) {
            driver.setPodiums(driver.getPodiums() + 1);
        }
        if (pole) {
            driver.setPoles(driver.getPoles() + 1);
        }

        driverRepository.save(driver);

        changeLogService.log("CREATE", "RaceResult", String.valueOf(result.getId()), currentUsername(),
            "Resultado registrado: " + driver.getName() + " — pos. " + (finalPosition != null ? finalPosition : "N/A") +
            " en carrera #" + raceId + " (" + points + " pts)");

        return result;
    }

    public void deleteResult(Long id) {
        RaceResult result = getResultById(id);
        result.setActive(false);
        raceResultRepository.save(result);
        changeLogService.log("DELETE", "RaceResult", String.valueOf(result.getId()), currentUsername(),
            "Resultado desactivado: " + result.getDriver().getName() + " en carrera #" + result.getRace().getId());
    }

    private String currentUsername() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anónimo";
    }
}