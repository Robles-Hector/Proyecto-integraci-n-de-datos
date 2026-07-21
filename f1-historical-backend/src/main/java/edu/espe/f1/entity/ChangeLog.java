package edu.espe.f1.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "change_logs")
@Data
@NoArgsConstructor
public class ChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String action; // CREATE, UPDATE, DELETE, SEARCH

    @Column(name = "entity_type", nullable = false, length = 40)
    private String entityType; // Driver, Team, Race, RaceResult, Search

    @Column(name = "entity_id", length = 60)
    private String entityId; // id afectado, o el término buscado si action=SEARCH

    @Column(name = "performed_by", nullable = false, length = 50)
    private String performedBy; // username, o "anónimo"

    @Column(columnDefinition = "TEXT")
    private String details; // descripción legible, ej. "Piloto Max Verstappen creado"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChangeLog(String action, String entityType, String entityId, String performedBy, String details) {
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.details = details;
    }
}