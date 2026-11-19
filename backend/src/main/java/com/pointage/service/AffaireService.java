package com.pointage.service;

import com.pointage.dto.AffaireDTO;
import com.pointage.dto.AffaireHistoryItemDTO;
import com.pointage.dto.AffaireRequestDTO;
import com.pointage.model.Affaire;
import com.pointage.model.PlageHoraire;
import com.pointage.model.Projet;
import com.pointage.repository.AffaireRepository;
import com.pointage.repository.PlageHoraireRepository;
import com.pointage.repository.ProjetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AffaireService {

    private final AffaireRepository repo;
    private final PlageHoraireRepository plageHoraireRepository;
    private final ProjetRepository projetRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public List<AffaireDTO> findAll() {
        return repo.findAllWithProjet().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AffaireDTO create(AffaireRequestDTO req) {
        Affaire affaire = new Affaire();
        affaire.setNom(req.getNom());
        affaire.setDescription(req.getDescription());
        affaire.setActif(req.getActif() != null ? req.getActif() : true);
        affaire.setEtat(req.getEtat() != null ? req.getEtat() : "en_instance");
        affaire.setMontant(req.getMontant());

        if (req.getProjetId() != null) {
            Projet projet = projetRepository.findById(req.getProjetId())
                    .orElseThrow(() -> new RuntimeException("Projet introuvable: " + req.getProjetId()));
            int count = repo.countByProjetId(req.getProjetId());
            String numeroAffaire = ProjetService.buildNumeroAffaire(projet.getNumeroSerie(), count + 1);
            affaire.setProjet(projet);
            affaire.setNumeroAffaire(numeroAffaire);
            affaire.setDevis(numeroAffaire + "D");
        }

        return toDTO(repo.save(affaire));
    }

    public AffaireDTO update(Long id, AffaireRequestDTO req) {
        Affaire affaire = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Affaire introuvable: " + id));
        affaire.setNom(req.getNom());
        affaire.setDescription(req.getDescription());
        if (req.getActif() != null) affaire.setActif(req.getActif());
        if (req.getEtat() != null) affaire.setEtat(req.getEtat());
        affaire.setMontant(req.getMontant());

        AffaireDTO result = toDTO(repo.save(affaire));

        if (affaire.getProjet() != null) {
            Long projetId = affaire.getProjet().getId();
            List<Affaire> siblings = repo.findByProjetId(projetId);
            if (!siblings.isEmpty() && siblings.stream().allMatch(a -> "annule".equals(a.getEtat()))) {
                Projet projet = affaire.getProjet();
                projet.setSituation(Projet.SituationProjet.AVORTE);
                projetRepository.save(projet);
            }
        }

        return result;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AffaireDTO> findUnassigned() {
        return repo.findUnassigned().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AffaireHistoryItemDTO> getHistory(Long affaireId) {
        List<PlageHoraire> plages = plageHoraireRepository.findByAffaireId(affaireId);

        Map<String, AffaireHistoryItemDTO> map = new LinkedHashMap<>();

        for (PlageHoraire ph : plages) {
            String date = ph.getPointage().getDatePointage().format(DATE_FMT);
            Long empId = ph.getPointage().getEmploye().getId();
            String key = date + "_" + empId;

            AffaireHistoryItemDTO item = map.computeIfAbsent(key, k -> {
                var emp = ph.getPointage().getEmploye();
                return AffaireHistoryItemDTO.builder()
                        .date(date)
                        .employeNom(emp.getNom())
                        .employePrenom(emp.getPrenom())
                        .matinPlages(new ArrayList<>())
                        .apresmidiPlages(new ArrayList<>())
                        .build();
            });

            AffaireHistoryItemDTO.PlageInfo info = AffaireHistoryItemDTO.PlageInfo.builder()
                    .heureDebut(ph.getHeureDebut() != null ? ph.getHeureDebut().format(TIME_FMT) : null)
                    .heureFin(ph.getHeureFin() != null ? ph.getHeureFin().format(TIME_FMT) : null)
                    .commentaire(ph.getCommentaire())
                    .build();

            if ("MATIN".equals(ph.getPeriode())) {
                item.getMatinPlages().add(info);
            } else {
                item.getApresmidiPlages().add(info);
            }
        }

        return new ArrayList<>(map.values());
    }

    AffaireDTO toDTO(Affaire a) {
        return AffaireDTO.builder()
                .id(a.getId())
                .nom(a.getNom())
                .description(a.getDescription())
                .actif(a.getActif())
                .numeroAffaire(a.getNumeroAffaire())
                .devis(a.getDevis())
                .projetId(a.getProjet() != null ? a.getProjet().getId() : null)
                .projetNom(a.getProjet() != null ? a.getProjet().getNom() : null)
                .projetNumeroSerie(a.getProjet() != null ? a.getProjet().getNumeroSerie() : null)
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toLocalDate().toString() : null)
                .lieuTravailType(a.getLieuTravailType())
                .etat(a.getEtat() != null ? a.getEtat() : "en_instance")
                .montant(a.getMontant())
                .build();
    }
}
