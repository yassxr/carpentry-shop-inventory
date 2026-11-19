package com.pointage.repository;

import com.pointage.model.Affaire;
import com.pointage.model.PlageHoraire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlageHoraireRepository extends JpaRepository<PlageHoraire, Long> {

    List<PlageHoraire> findByPointageId(Long pointageId);

    List<PlageHoraire> findByPointageIdAndPeriode(Long pointageId, String periode);

    List<PlageHoraire> findByAffaireId(Long affaireId);

    @Query("SELECT DISTINCT ph.affaire FROM PlageHoraire ph LEFT JOIN FETCH ph.affaire.projet WHERE ph.pointage.employe.id = :employeId AND ph.affaire IS NOT NULL")
    List<Affaire> findDistinctAffairesByEmployeId(@Param("employeId") Long employeId);
}
