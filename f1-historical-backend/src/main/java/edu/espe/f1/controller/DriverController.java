package edu.espe.f1.controller;

import edu.espe.f1.dto.DriverMapper;
import edu.espe.f1.dto.DriverRequestDTO;
import edu.espe.f1.dto.DriverResponseDTO;
import edu.espe.f1.entity.Driver;
import edu.espe.f1.entity.DriverTransfer;
import edu.espe.f1.entity.User;
import edu.espe.f1.service.AuthService;
import edu.espe.f1.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private AuthService authService;

    // GET /api/drivers — solo activos
    @GetMapping
    public ResponseEntity<List<DriverResponseDTO>> getAllDrivers() {
        List<DriverResponseDTO> dtos = driverService.getAllDrivers().stream()
                .map(DriverMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // GET /api/drivers/inactive — solo admin
    @GetMapping("/inactive")
    public ResponseEntity<List<DriverResponseDTO>> getInactiveDrivers() {
        List<DriverResponseDTO> dtos = driverService.getInactiveDrivers().stream()
                .map(DriverMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // GET /api/drivers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<DriverResponseDTO> getDriverById(@PathVariable String id) {
        Driver driver = driverService.getDriverById(id);
        return ResponseEntity.ok(DriverMapper.toDTO(driver));
    }

    // POST /api/drivers
    @PostMapping
    public ResponseEntity<DriverResponseDTO> createDriver(@Valid @RequestBody DriverRequestDTO dto) {
        Driver created = driverService.createDriver(dto);
        return new ResponseEntity<>(DriverMapper.toDTO(created), HttpStatus.CREATED);
    }

    // PUT /api/drivers/{id}
    @PutMapping("/{id}")
    public ResponseEntity<DriverResponseDTO> updateDriver(
            @PathVariable String id,
            @Valid @RequestBody DriverRequestDTO dto) {
        Driver updated = driverService.updateDriver(id, dto);
        return ResponseEntity.ok(DriverMapper.toDTO(updated));
    }

    // DELETE /api/drivers/{id} — borrado LÓGICO
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDriver(@PathVariable String id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(Map.of("message", "Piloto desactivado correctamente"));
    }

    // PUT /api/drivers/{id}/restore — restaurar piloto (admin)
    @PutMapping("/{id}/restore")
    public ResponseEntity<DriverResponseDTO> restoreDriver(@PathVariable String id) {
        Driver restored = driverService.restoreDriver(id);
        return ResponseEntity.ok(DriverMapper.toDTO(restored));
    }

    // POST /api/drivers/{id}/transfer
    // Body: { "toTeamId": "mercedes", "season": 2027, "notes": "..." }
    @PostMapping("/{id}/transfer")
    public ResponseEntity<DriverTransfer> transferDriver(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        // Se obtiene el usuario administrativo directamente desde el contexto seguro
        User admin = authService.getCurrentUser();
        return ResponseEntity.ok(driverService.transferDriver(id, body, admin));
    }

    // GET /api/drivers/{id}/transfers — historial de transferencias
    @GetMapping("/{id}/transfers")
    public ResponseEntity<List<DriverTransfer>> getTransferHistory(@PathVariable String id) {
        return ResponseEntity.ok(driverService.getTransferHistory(id));
    }

    // GET /api/drivers/search?name=hamilton
    @GetMapping("/search")
    public ResponseEntity<List<DriverResponseDTO>> searchDrivers(@RequestParam String name) {
        List<DriverResponseDTO> dtos = driverService.searchDrivers(name).stream()
                .map(DriverMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}