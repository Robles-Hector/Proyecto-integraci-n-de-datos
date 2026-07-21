package edu.espe.f1.dto;

import java.util.List;

public record DriverResponseDTO(
        String id,
        String name,
        String slug,
        String nationality,
        String born,
        int number,
        boolean active,
        String bio,
        int wins,
        int podiums,
        int poles,
        double points,
        int championships,
        String seasonsData,
        TeamSummaryDTO currentTeam, 
        List<CircuitSummaryDTO> circuits
) {}