package edu.espe.f1.dto;

import edu.espe.f1.entity.Driver;
import edu.espe.f1.entity.Team;

import java.util.Collections;
import java.util.List;

public class TeamMapper {

        // Uso cuando no necesitas la lista de pilotos (ej. listado de equipos)
        public static TeamResponseDTO toDTO(Team team) {
                return toDTO(team, Collections.emptyList());
        }

        // Uso cuando sí necesitas los pilotos: tráelos aparte con
        // driverRepository.findByCurrentTeamId(team.getId()) en el service,
        // porque Team no tiene una colección @OneToMany inversa hacia Driver.
        public static TeamResponseDTO toDTO(Team team, List<Driver> pilots) {
                List<DriverSummaryDTO> pilotsDTO = pilots.stream()
                                .map(DriverMapper::toSummaryDTO)
                                .toList();

                Long submittedById = team.getSubmittedBy() != null
                                ? team.getSubmittedBy().getId()
                                : null;
                String submittedByUsername = team.getSubmittedBy() != null
                                ? team.getSubmittedBy().getUsername()
                                : null;

                return new TeamResponseDTO(
                                team.getId(),
                                team.getName(),
                                team.getFullName(),
                                team.getBase(),
                                team.getFounded(),
                                team.getChampionships(),
                                team.getColor(),
                                team.getWins(),
                                team.getStatus().name(),
                                team.getPilotsData(),
                                team.getNotes(),
                                submittedById,
                                submittedByUsername,
                                pilotsDTO);
        }

        // Version "resumida", para usar dentro de DriverResponseDTO
        public static TeamSummaryDTO toSummaryDTO(Team team) {
                return new TeamSummaryDTO(
                                team.getId(),
                                team.getName(),
                                team.getFullName(),
                                team.getColor(),
                                team.getBase(),
                                team.getFounded(),
                                team.getChampionships(),
                                team.getWins(),
                                team.getStatus().name());
        }

        public static Team toEntity(TeamRequestDTO dto) {
                Team team = new Team();
                team.setId(dto.id());
                team.setName(dto.name());
                team.setFullName(dto.fullName());
                team.setBase(dto.base());
                team.setFounded(dto.founded());
                team.setChampionships(dto.championships());
                team.setColor(dto.color());
                team.setWins(dto.wins());
                return team;
        }
}