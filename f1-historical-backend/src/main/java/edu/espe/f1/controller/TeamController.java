package edu.espe.f1.controller;

import edu.espe.f1.dto.TeamMapper;
import edu.espe.f1.dto.TeamRequestDTO;
import edu.espe.f1.dto.TeamResponseDTO;
import edu.espe.f1.entity.Team;
import edu.espe.f1.entity.User;
import edu.espe.f1.service.AuthService;
import edu.espe.f1.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private AuthService authService;

    // GET /api/teams — solo APPROVED
    @GetMapping
    public ResponseEntity<List<TeamResponseDTO>> getAllTeams() {
        List<TeamResponseDTO> dtos = teamService.getAllTeams().stream()
                .map(TeamMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // GET /api/teams/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponseDTO> getTeamById(@PathVariable String id) {
        Team team = teamService.getTeamById(id);
        return ResponseEntity.ok(TeamMapper.toDTO(team));
    }

    // POST /api/teams — crear equipo aprobado (admin)
    @PostMapping
    public ResponseEntity<TeamResponseDTO> createTeam(@Valid @RequestBody TeamRequestDTO dto) {
        Team created = teamService.createTeam(dto);
        return new ResponseEntity<>(TeamMapper.toDTO(created), HttpStatus.CREATED);
    }

    // PUT /api/teams/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponseDTO> updateTeam(@PathVariable String id, @Valid @RequestBody TeamRequestDTO dto) {
        Team updated = teamService.updateTeam(id, dto);
        return ResponseEntity.ok(TeamMapper.toDTO(updated));
    }

    // DELETE /api/teams/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    // ── POSTULACIONES ─────────────────────────────────────────────

    // POST /api/teams/pending — usuario postula un equipo nuevo
    @PostMapping("/pending")
    public ResponseEntity<TeamResponseDTO> submitTeam(@RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUser();
        Team submitted = teamService.submitTeam(body, user);
        return new ResponseEntity<>(TeamMapper.toDTO(submitted), HttpStatus.CREATED);
    }

    // GET /api/teams/pending — admin ve todos los pendientes
    @GetMapping("/pending")
    public ResponseEntity<List<TeamResponseDTO>> getPendingTeams() {
        List<TeamResponseDTO> dtos = teamService.getPendingTeams().stream()
                .map(TeamMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // GET /api/teams/rejected — admin ve todos los rechazados
    @GetMapping("/rejected")
    public ResponseEntity<List<TeamResponseDTO>> getRejectedTeams() {
        List<TeamResponseDTO> dtos = teamService.getRejectedTeams().stream()
                .map(TeamMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // GET /api/teams/my-submissions — usuario ve sus propias postulaciones
    @GetMapping("/my-submissions")
    public ResponseEntity<List<TeamResponseDTO>> getMySubmissions() {
        User user = authService.getCurrentUser();
        List<TeamResponseDTO> dtos = teamService.getMySubmissions(user).stream()
                .map(TeamMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // PUT /api/teams/{id}/approve — admin aprueba e inserta pilotos
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveTeam(@PathVariable String id) {
        Team team = teamService.approveTeam(id);
        return ResponseEntity.ok(Map.of(
                "message", "✅ \"" + team.getName() + "\" aprobado y visible en la parrilla",
                "team", TeamMapper.toDTO(team)));
    }

    // PUT /api/teams/{id}/reject — admin rechaza con motivo opcional
    // Body: { "reason": "Presupuesto insuficiente" }
    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectTeam(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        Team team = teamService.rejectTeam(id, reason);
        return ResponseEntity.ok(Map.of(
                "message", "❌ \"" + team.getName() + "\" rechazado",
                "team", TeamMapper.toDTO(team)));
    }

    // GET /api/teams/search?name=ferrari
    @GetMapping("/search")
    public ResponseEntity<List<TeamResponseDTO>> searchTeams(@RequestParam String name) {
        List<TeamResponseDTO> dtos = teamService.searchTeams(name).stream()
                .map(TeamMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}