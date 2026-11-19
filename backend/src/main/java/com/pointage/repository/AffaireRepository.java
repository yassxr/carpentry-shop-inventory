package com.pointage.repository;

import com.pointage.model.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AffaireRepository extends JpaRepository<Affaire, Long> {

    @Query("SELECT DISTINCT a FROM Affaire a LEFT JOIN FETCH a.projet ORDER BY a.id")
    List<Affaire> findAllWithProjet();

    @Query("SELECT COUNT(a) FROM Affaire a WHERE a.projet.id = :projetId")
    int countByProjetId(@Param("projetId") Long projetId);

    @Modifying
    @Query("UPDATE Affaire a SET a.projet = null, a.numeroAffaire = null, a.devis = null WHERE a.projet.id = :projetId")
    void unlinkFromProjet(@Param("projetId") Long projetId);

    @Query("SELECT a FROM Affaire a WHERE a.projet IS NULL ORDER BY a.id")
    List<Affaire> findUnassigned();

    @Query("SELECT a FROM Affaire a WHERE a.projet.id = :projetId")
    List<Affaire> findByProjetId(@Param("projetId") Long projetId);
}
