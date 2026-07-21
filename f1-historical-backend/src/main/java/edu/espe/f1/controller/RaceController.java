package edu.espe.f1.controller;

import edu.espe.f1.dto.RaceMapper;
import edu.espe.f1.dto.RaceRequestDTO;
import edu.espe.f1.dto.RaceResponseDTO;
import edu.espe.f1.entity.Race;
import edu.espe.f1.service.RaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/races")
@CrossOrigin(origins = "*")
public class RaceController {

    @Autowired
    private RaceService raceService;

    @GetMapping
    public ResponseEntity<List<RaceResponseDTO>> getAllRaces() {
        List<RaceResponseDTO> dtos = raceService.getAllRaces().stream()
                .map(RaceMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RaceResponseDTO> getRaceById(@PathVariable Long id) {
        Race race = raceService.getRaceById(id);
        return ResponseEntity.ok(RaceMapper.toDTO(race));
    }

    @GetMapping("/season/{season}")
    public ResponseEntity<List<RaceResponseDTO>> getRacesBySeason(@PathVariable Integer season) {
        List<RaceResponseDTO> dtos = raceService.getRacesBySeason(season).stream()
                .map(RaceMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<RaceResponseDTO> createRace(@Valid @RequestBody RaceRequestDTO dto) {
        Race created = raceService.createRace(dto);
        return new ResponseEntity<>(RaceMapper.toDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RaceResponseDTO> updateRace(@PathVariable Long id, @Valid @RequestBody RaceRequestDTO dto) {
        Race updated = raceService.updateRace(id, dto);
        return ResponseEntity.ok(RaceMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRace(@PathVariable Long id) {
        raceService.deleteRace(id);
        return ResponseEntity.ok(Map.of("message", "Carrera eliminada correctamente"));
    }
}