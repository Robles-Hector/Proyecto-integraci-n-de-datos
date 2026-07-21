package edu.espe.f1.repository;

import edu.espe.f1.entity.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Long> {
    List<Race> findBySeasonOrderByRoundAsc(Integer season);
    List<Race> findByCircuitId(Long circuitId);
    List<Race> findByActiveTrue();
    List<Race> findBySeasonAndActiveTrueOrderByRoundAsc(Integer season);
}