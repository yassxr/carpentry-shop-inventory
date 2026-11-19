package com.pointage.controller;

import com.pointage.dto.AffaireDTO;
import com.pointage.dto.AffaireHistoryItemDTO;
import com.pointage.dto.AffaireRequestDTO;
import com.pointage.service.AffaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affaires")
@RequiredArgsConstructor
public class AffaireController {

    private final AffaireService service;

    @GetMapping
    public List<AffaireDTO> getAll() {
        return service.findAll();
    }

    @GetMapping("/unassigned")
    public List<AffaireDTO> getUnassigned() {
        return service.findUnassigned();
    }

    @PostMapping
    public AffaireDTO create(@RequestBody AffaireRequestDTO req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public AffaireDTO update(@PathVariable Long id, @RequestBody AffaireRequestDTO req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public List<AffaireHistoryItemDTO> getHistory(@PathVariable Long id) {
        return service.getHistory(id);
    }
}
