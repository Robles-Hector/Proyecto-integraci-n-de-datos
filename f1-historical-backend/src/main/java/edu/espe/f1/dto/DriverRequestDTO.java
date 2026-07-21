package edu.espe.f1.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record DriverRequestDTO(
    @NotBlank(message = "El id del piloto es obligatorio") String id,
    @NotBlank(message = "El nombre del piloto es obligatorio") String name,
    @NotBlank(message = "El slug es obligatorio") String slug,
    @NotBlank(message = "La nacionalidad es obligatoria") String nationality,
    @NotBlank(message = "La fecha de nacimiento es obligatoria") String born,
    @Min(value = 1, message = "Número de piloto inválido") int number,
    int championships,
    int wins,
    int podiums,
    int poles,
    double points,
    String bio,
    String teamId
) {}