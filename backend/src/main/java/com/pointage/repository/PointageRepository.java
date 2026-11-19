package com.pointage.repository;

import com.pointage.model.Pointage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {

    List<Pointage> findByDatePointage(LocalDate date);

    Optional<Pointage> findByEmployeIdAndDatePointage(Long employeId, LocalDate date);

    List<Pointage> findByEmployeId(Long employeId);

    @Query("SELECT p FROM Pointage p WHERE p.datePointage BETWEEN :debut AND :fin ORDER BY p.datePointage, p.employe.nom")
    List<Pointage> findByDateRange(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);

    @Query("SELECT p FROM Pointage p " +
           "WHERE p.employe.id = :employeId " +
           "AND p.datePointage BETWEEN :debut AND :fin " +
           "ORDER BY p.datePointage")
    List<Pointage> findMensuel(@Param("employeId") Long employeId,
                               @Param("debut") LocalDate debut,
                               @Param("fin") LocalDate fin);
}
