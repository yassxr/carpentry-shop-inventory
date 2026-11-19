package com.pointage.service;

import com.pointage.dto.AffaireDTO;
import com.pointage.dto.AffaireRequestDTO;
import com.pointage.dto.ProjetRequestDTO;
import com.pointage.dto.ProjetResponseDTO;
import com.pointage.model.Affaire;
import com.pointage.model.Projet;
import com.pointage.repository.AffaireRepository;
import com.pointage.repository.ProjetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjetService {

    private final ProjetRepository projetRepository;
    private final AffaireRepository affaireRepository;

    @Transactional(readOnly = true)
    public List<ProjetResponseDTO> findAll() {
        return projetRepository.findAllWithAffaires().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjetResponseDTO create(ProjetRequestDTO req) {
        Projet projet = new Projet();
        applyFields(projet, req);
        projet.setNumeroSerie(generateNumeroSerie());
        return toDTO(projetRepository.save(projet));
    }

    public ProjetResponseDTO update(Long id, ProjetRequestDTO req) {
        Projet projet = projetRepository.findByIdWithAffaires(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable: " + id));
        applyFields(projet, req);
        return toDTO(projetRepository.save(projet));
    }

    public void delete(Long id) {
        affaireRepository.unlinkFromProjet(id);
        projetRepository.deleteById(id);
    }

    public AffaireDTO addAffaire(Long projetId, AffaireRequestDTO req) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable: " + projetId));
        int count = affaireRepository.countByProjetId(projetId);
        String numeroAffaire = buildNumeroAffaire(projet.getNumeroSerie(), count + 1);

        Affaire affaire = new Affaire();
        affaire.setNom(req.getNom());
        affaire.setDescription(req.getDescription());
        affaire.setActif(req.getActif() != null ? req.getActif() : true);
        affaire.setEtat(req.getEtat() != null ? req.getEtat() : "en_instance");
        affaire.setMontant(req.getMontant());
        affaire.setProjet(projet);
        affaire.setNumeroAffaire(numeroAffaire);
        affaire.setDevis(numeroAffaire + "D");

        return toAffaireDTO(affaireRepository.save(affaire));
    }

    public AffaireDTO assignAffaire(Long projetId, Long affaireId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable: " + projetId));
        Affaire affaire = affaireRepository.findById(affaireId)
                .orElseThrow(() -> new RuntimeException("Affaire introuvable: " + affaireId));

        int count = affaireRepository.countByProjetId(projetId);
        String numeroAffaire = buildNumeroAffaire(projet.getNumeroSerie(), count + 1);
        affaire.setProjet(projet);
        affaire.setNumeroAffaire(numeroAffaire);
        affaire.setDevis(numeroAffaire + "D");

        return toAffaireDTO(affaireRepository.save(affaire));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String generateNumeroSerie() {
        int year = LocalDate.now().getYear();
        int twoDigitYear = year % 100;
        LocalDateTime debut = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(year + 1, 1, 1).atStartOfDay();
        int sequence = projetRepository.countByCreatedAtBetween(debut, fin) + 1;
        return (sequence * 100) + "AM" + String.format("%02d", twoDigitYear);
    }

    // e.g. "100AM26" → seqBase=100, year="26" → index-th affaire = "101AM26"
    public static String buildNumeroAffaire(String projetNumeroSerie, int index) {
        int amIdx = projetNumeroSerie.indexOf("AM");
        int seqBase = Integer.parseInt(projetNumeroSerie.substring(0, amIdx));
        String yearPart = projetNumeroSerie.substring(amIdx + 2);
        return (seqBase + index) + "AM" + yearPart;
    }

    private void applyFields(Projet projet, ProjetRequestDTO req) {
        projet.setNom(req.getNom());
        if (req.getSituation() != null && !req.getSituation().isBlank()) {
            projet.setSituation(Projet.SituationProjet.valueOf(req.getSituation()));
        } else {
            projet.setSituation(null);
        }
        projet.setMaitreouvrage(req.getMaitreouvrage());
        projet.setTelephone(req.getTelephone());
        projet.setEmail(req.getEmail());
        projet.setChef(req.getChef());
        projet.setBct(req.getBct());
        projet.setBet(req.getBet());
        projet.setLieu(req.getLieu());
        projet.setTypePersonne(req.getTypePersonne() != null ? req.getTypePersonne() : "physique");
        projet.setNomSociete(req.getNomSociete());
        projet.setNomResponsable(req.getNomResponsable());
    }

    ProjetResponseDTO toDTO(Projet p) {
        List<ProjetResponseDTO.AffaireInfo> infos = p.getAffaires().stream()
                .map(a -> ProjetResponseDTO.AffaireInfo.builder()
                        .id(a.getId())
                        .nom(a.getNom())
                        .numeroAffaire(a.getNumeroAffaire())
                        .devis(a.getDevis())
                        .build())
                .collect(Collectors.toList());

        return ProjetResponseDTO.builder()
                .id(p.getId())
                .nom(p.getNom())
                .situation(p.getSituation() != null ? p.getSituation().name() : null)
                .maitreouvrage(p.getMaitreouvrage())
                .telephone(p.getTelephone())
                .email(p.getEmail())
                .chef(p.getChef())
                .bct(p.getBct())
                .bet(p.getBet())
                .lieu(p.getLieu())
                .typePersonne(p.getTypePersonne())
                .nomSociete(p.getNomSociete())
                .nomResponsable(p.getNomResponsable())
                .numeroSerie(p.getNumeroSerie())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .affaires(infos)
                .build();
    }

    AffaireDTO toAffaireDTO(Affaire a) {
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
                .etat(a.getEtat() != null ? a.getEtat() : "en_instance")
                .montant(a.getMontant())
                .build();
    }
}
