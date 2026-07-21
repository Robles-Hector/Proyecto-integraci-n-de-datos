package edu.espe.f1.dto;

import edu.espe.f1.entity.Circuit;
import edu.espe.f1.entity.Driver;
import edu.espe.f1.entity.Team;

import java.util.List;

public class DriverMapper {

    public static DriverResponseDTO toDTO(Driver driver) {
        TeamSummaryDTO teamDTO = mapTeamSummary(driver.getCurrentTeam());

        List<CircuitSummaryDTO> circuitsDTO = driver.getCircuits().stream()
                .map(CircuitMapper::toSummaryDTO)
                .toList();

        return new DriverResponseDTO(
                driver.getId(),
                driver.getName(),
                driver.getSlug(),
                driver.getNationality(),
                driver.getBorn(),
                driver.getNumber(),
                driver.isActive(),
                driver.getBio(),
                driver.getWins(),
                driver.getPodiums(),
                driver.getPoles(),
                driver.getPoints(),
                driver.getChampionships(),
                driver.getSeasonsData(),
                teamDTO,
                circuitsDTO);
    }

    public static DriverSummaryDTO toSummaryDTO(Driver driver) {
        return new DriverSummaryDTO(
                driver.getId(),
                driver.getName(),
                driver.getSlug(),
                driver.getNationality(),
                driver.getNumber(),
                driver.isActive(),
                driver.getWins(),
                driver.getPodiums(),
                driver.getPoles(),
                driver.getPoints(),
                driver.getChampionships());
    }

    private static TeamSummaryDTO mapTeamSummary(Team team) {
        if (team == null)
            return null;
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

    public static Driver toEntity(DriverRequestDTO dto, Team currentTeam) {
        Driver driver = new Driver();
        driver.setId(dto.id());
        driver.setName(dto.name());
        driver.setSlug(dto.slug());
        driver.setNationality(dto.nationality());
        driver.setBorn(dto.born());
        driver.setNumber(dto.number());
        driver.setChampionships(dto.championships());
        driver.setWins(dto.wins());
        driver.setPodiums(dto.podiums());
        driver.setPoles(dto.poles());
        driver.setPoints(dto.points());
        driver.setBio(dto.bio());
        driver.setActive(true);
        driver.setCurrentTeam(currentTeam);
        return driver;
    }
}