package edu.espe.f1.service;

import edu.espe.f1.dto.DriverMapper;
import edu.espe.f1.dto.DriverRequestDTO;
import edu.espe.f1.entity.Driver;
import edu.espe.f1.entity.DriverTransfer;
import edu.espe.f1.entity.Team;
import edu.espe.f1.entity.User;
import edu.espe.f1.repository.DriverRepository;
import edu.espe.f1.repository.DriverTransferRepository;
import edu.espe.f1.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private DriverTransferRepository transferRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private ChangeLogService changeLogService;

    // Solo activos
    public List<Driver> getAllDrivers() {
        return driverRepository.findByActiveTrue();
    }

    // Incluye inactivos (para admin)
    public List<Driver> getInactiveDrivers() {
        return driverRepository.findByActiveFalse();
    }

    public Driver getDriverById(String id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Piloto no encontrado con id: " + id));
    }

    public Driver createDriver(DriverRequestDTO dto) {
        if (driverRepository.existsByNumberAndActiveTrue(dto.number())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un piloto activo con el número " + dto.number());
        }
        Team team = null;
        if (dto.teamId() != null && !dto.teamId().isBlank()) {
            team = teamRepository.findById(dto.teamId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Equipo no encontrado: " + dto.teamId()));
        }
        Driver saved = driverRepository.save(DriverMapper.toEntity(dto, team));
        changeLogService.log("CREATE", "Driver", saved.getId(), currentUsername(),
                "Piloto creado: " + saved.getName());
        return saved;
    }

    public Driver updateDriver(String id, DriverRequestDTO dto) {
        Driver driver = getDriverById(id);
        driver.setName(dto.name());
        driver.setSlug(dto.slug());
        driver.setNationality(dto.nationality());
        driver.setBorn(dto.born());
        driver.setNumber(dto.number());
        driver.setChampionships(dto.championships());
        driver.setWins(dto.wins());
        driver.setPodiums(dto.podiums());
        driver.setPoles(dto.poles());
        driver.setPoints(dto.points());
        driver.setBio(dto.bio());
        Driver saved = driverRepository.save(driver);
        changeLogService.log("UPDATE", "Driver", saved.getId(), currentUsername(),
                "Piloto actualizado: " + saved.getName());
        return saved;
    }

    public List<Driver> searchDrivers(String name) {
        return driverRepository.findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    // Borrado LÓGICO — no elimina de la BD
    public void deleteDriver(String id) {
        Driver driver = getDriverById(id);
        driver.setActive(false);
        driverRepository.save(driver);
        changeLogService.log("DELETE", "Driver", driver.getId(), currentUsername(),
                "Piloto desactivado: " + driver.getName());
    }

    // Restaurar piloto eliminado (admin)
    public Driver restoreDriver(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Piloto no encontrado con id: " + id));
        driver.setActive(true);
        Driver saved = driverRepository.save(driver);
        changeLogService.log("UPDATE", "Driver", saved.getId(), currentUsername(),
                "Piloto restaurado: " + saved.getName());
        return saved;
    }

    // ── TRANSFERENCIAS ────────────────────────────────────────────

    @Transactional
    public DriverTransfer transferDriver(String driverId, Map<String, Object> body, User admin) {
        Driver driver = getDriverById(driverId);

        String toTeamId = (String) body.get("toTeamId");
        int season = Integer.parseInt(String.valueOf(body.get("season")));
        String notes = (String) body.getOrDefault("notes", "");

        Team toTeam = teamRepository.findById(toTeamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Equipo destino no encontrado: " + toTeamId));

        // Registrar transferencia
        DriverTransfer transfer = new DriverTransfer();
        transfer.setDriver(driver);
        transfer.setFromTeam(driver.getCurrentTeam());
        transfer.setToTeam(toTeam);
        transfer.setSeason(season);
        transfer.setNotes(notes);
        transfer.setTransferredBy(admin);
        transferRepository.save(transfer);

        // Actualizar equipo actual del piloto
        driver.setCurrentTeam(toTeam);
        driverRepository.save(driver);

        changeLogService.log("UPDATE", "Driver", driver.getId(), currentUsername(),
                "Transferencia: " + driver.getName() + " → " + toTeam.getName() + " (temporada " + season + ")");

        return transfer;
    }

    public List<DriverTransfer> getTransferHistory(String driverId) {
        return transferRepository.findByDriverIdOrderByTransferDateDesc(driverId);
    }

    // ── HELPER ───────────────────────────────────────────────────
    private String currentUsername() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anónimo";
    }
}