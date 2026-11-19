package com.pointage.repository;

import com.pointage.model.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    @Query("SELECT COUNT(p) FROM Projet p WHERE p.createdAt >= :debut AND p.createdAt < :fin")
    int countByCreatedAtBetween(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT DISTINCT p FROM Projet p LEFT JOIN FETCH p.affaires ORDER BY p.createdAt DESC")
    List<Projet> findAllWithAffaires();

    @Query("SELECT DISTINCT p FROM Projet p LEFT JOIN FETCH p.affaires WHERE p.id = :id")
    Optional<Projet> findByIdWithAffaires(@Param("id") Long id);
}
