package com.pointage.repository;

import com.pointage.model.Accompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccompteRepository extends JpaRepository<Accompte, Long> {
    @Query("SELECT a FROM Accompte a WHERE a.affaire.id = :affaireId ORDER BY a.date ASC, a.savedAt ASC")
    List<Accompte> findByAffaireId(@Param("affaireId") Long affaireId);
}
