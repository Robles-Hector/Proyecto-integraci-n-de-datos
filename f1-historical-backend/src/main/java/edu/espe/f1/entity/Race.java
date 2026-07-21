package edu.espe.f1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "races")
@Data
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La temporada es obligatoria")
    private Integer season;

    @NotNull(message = "La ronda es obligatoria")
    @Min(value = 1, message = "La ronda debe ser mayor a 0")
    private Integer round;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "circuit_id", nullable = false)
    private Circuit circuit;

    @NotNull(message = "La fecha de la carrera es obligatoria")
    private LocalDate raceDate;

    @NotNull(message = "El total de vueltas es obligatorio")
    @Min(value = 1, message = "El total de vueltas debe ser mayor a 0")
    private Integer lapsTotal;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(nullable = false)
    private boolean active = true;
}