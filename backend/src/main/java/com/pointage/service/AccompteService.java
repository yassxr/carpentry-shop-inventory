package com.pointage.service;

import com.pointage.dto.AccompteDTO;
import com.pointage.dto.AccompteRequestDTO;
import com.pointage.model.Accompte;
import com.pointage.model.Affaire;
import com.pointage.repository.AccompteRepository;
import com.pointage.repository.AffaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccompteService {

    private final AccompteRepository repo;
    private final AffaireRepository affaireRepo;

    private static final DateTimeFormatter DATE_FMT  = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter SAVED_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @Transactional(readOnly = true)
    public List<AccompteDTO> findByAffaireId(Long affaireId) {
        return repo.findByAffaireId(affaireId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AccompteDTO create(AccompteRequestDTO req) {
        Affaire affaire = affaireRepo.findById(req.getAffaireId())
                .orElseThrow(() -> new RuntimeException("Affaire introuvable: " + req.getAffaireId()));
        Accompte a = new Accompte();
        a.setAffaire(affaire);
        applyFields(a, req);
        return toDTO(repo.save(a));
    }

    public AccompteDTO update(Long id, AccompteRequestDTO req) {
        Accompte a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Accompte introuvable: " + id));
        applyFields(a, req);
        return toDTO(repo.save(a));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private void applyFields(Accompte a, AccompteRequestDTO req) {
        a.setModePaiement(req.getModePaiement());
        a.setReference("espece".equals(req.getModePaiement()) ? null : req.getReference());
        a.setDate(LocalDate.parse(req.getDate(), DATE_FMT));
        a.setMontant(req.getMontant());
    }

    private AccompteDTO toDTO(Accompte a) {
        return AccompteDTO.builder()
                .id(a.getId())
                .affaireId(a.getAffaire().getId())
                .modePaiement(a.getModePaiement())
                .reference(a.getReference())
                .date(a.getDate() != null ? a.getDate().format(DATE_FMT) : null)
                .montant(a.getMontant())
                .savedAt(a.getSavedAt() != null ? a.getSavedAt().format(SAVED_FMT) : null)
                .build();
    }
}
