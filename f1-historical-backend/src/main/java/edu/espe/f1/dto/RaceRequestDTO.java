package edu.espe.f1.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RaceRequestDTO(
    @NotNull(message = "La temporada es obligatoria") Integer season,
    @NotNull(message = "La ronda es obligatoria")
    @Min(value = 1, message = "La ronda debe ser mayor a 0") Integer round,
    @NotNull(message = "El circuito es obligatorio") Long circuitId,
    @NotNull(message = "La fecha de la carrera es obligatoria") LocalDate raceDate,
    @NotNull(message = "El total de vueltas es obligatorio")
    @Min(value = 1, message = "El total de vueltas debe ser mayor a 0") Integer lapsTotal
) {}