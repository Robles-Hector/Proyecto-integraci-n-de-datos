package edu.espe.f1.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamRequestDTO(
    @NotBlank(message = "El id del equipo es obligatorio") String id,
    @NotBlank(message = "El nombre de la escudería es obligatorio")
    @Size(max = 20, message = "El nombre corto no puede superar los 20 caracteres") String name,
    @NotBlank(message = "El nombre completo es obligatorio") String fullName,
    @NotBlank(message = "La sede es obligatoria") String base,
    @Min(value = 1950, message = "Año de fundación inválido") int founded,
    @Min(0) int championships,
    @NotBlank(message = "El color hexadecimal es obligatorio") String color,
    int wins
) {}