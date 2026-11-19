package com.pointage.service;

import com.pointage.dto.AffaireDTO;
import com.pointage.model.Employe;
import com.pointage.repository.EmployeRepository;
import com.pointage.repository.PlageHoraireRepository;
import com.pointage.repository.PointageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository repo;
    private final PlageHoraireRepository plageHoraireRepository;
    private final PointageRepository pointageRepository;

    public List<Employe> findAll() {
        return repo.findAll();
    }

    public Employe create(Employe employe) {
        return repo.save(employe);
    }

    public Employe update(Long id, Employe data) {
        Employe employe = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        employe.setNom(data.getNom());
        employe.setPrenom(data.getPrenom());
        employe.setPoste(data.getPoste());
        employe.setTypeEmploye(data.getTypeEmploye());
        employe.setDateNaissance(data.getDateNaissance());
        employe.setTarifHoraire(data.getTarifHoraire());
        employe.setNumeroCnss(data.getNumeroCnss());
        employe.setTelephone(data.getTelephone());
        if (data.getPhoto() != null) employe.setPhoto(data.getPhoto());
        if (data.getActif() != null) employe.setActif(data.getActif());
        if (data.getStatut() != null) employe.setStatut(data.getStatut());
        employe.setSituationFamiliale(data.getSituationFamiliale());
        employe.setNombreEnfants(data.getNombreEnfants());
        employe.setAdresse(data.getAdresse());
        employe.setEmail(data.getEmail());
        employe.setQualificationProfessionnelle(data.getQualificationProfessionnelle());
        employe.setQualificationAutre(data.getQualificationAutre());
        employe.setDiplome(data.getDiplome());
        employe.setDiplomeAutre(data.getDiplomeAutre());
        employe.setDateObtentionDiplome(data.getDateObtentionDiplome());
        employe.setTelephoneSte(data.getTelephoneSte());
        employe.setFonction(data.getFonction());
        employe.setFonctionAutre(data.getFonctionAutre());
        employe.setNombreJoursConge(data.getNombreJoursConge());
        employe.setNombreJoursAbsence(data.getNombreJoursAbsence());
        employe.setNombreJoursMaladie(data.getNombreJoursMaladie());
        employe.setNumeroCin(data.getNumeroCin());
        employe.setNumeroMatricule(data.getNumeroMatricule());
        employe.setDateEmbauche(data.getDateEmbauche());
        employe.setSalaireMensuel(data.getSalaireMensuel());
        return repo.save(employe);
    }

    @Transactional
    public void delete(Long id) {
        pointageRepository.findByEmployeId(id)
                .forEach(p -> pointageRepository.deleteById(p.getId()));
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AffaireDTO> getAffairesTravaillees(Long id) {
        return plageHoraireRepository.findDistinctAffairesByEmployeId(id).stream()
                .map(a -> AffaireDTO.builder()
                        .id(a.getId())
                        .nom(a.getNom())
                        .numeroAffaire(a.getNumeroAffaire())
                        .devis(a.getDevis())
                        .projetId(a.getProjet() != null ? a.getProjet().getId() : null)
                        .projetNom(a.getProjet() != null ? a.getProjet().getNom() : null)
                        .projetNumeroSerie(a.getProjet() != null ? a.getProjet().getNumeroSerie() : null)
                        .build())
                .collect(Collectors.toList());
    }
}
