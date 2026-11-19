package com.pointage.controller;

import com.pointage.dto.AffaireDTO;
import com.pointage.dto.AffaireRequestDTO;
import com.pointage.dto.ProjetRequestDTO;
import com.pointage.dto.ProjetResponseDTO;
import com.pointage.service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
public class ProjetController {

    private final ProjetService service;

    @GetMapping
    public List<ProjetResponseDTO> getAll() {
        return service.findAll();
    }

    @PostMapping
    public ProjetResponseDTO create(@RequestBody ProjetRequestDTO req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public ProjetResponseDTO update(@PathVariable Long id, @RequestBody ProjetRequestDTO req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projetId}/affaires")
    public AffaireDTO addAffaire(@PathVariable Long projetId, @RequestBody AffaireRequestDTO req) {
        return service.addAffaire(projetId, req);
    }

    @PostMapping("/{projetId}/affaires/{affaireId}")
    public AffaireDTO assignAffaire(@PathVariable Long projetId, @PathVariable Long affaireId) {
        return service.assignAffaire(projetId, affaireId);
    }
}
