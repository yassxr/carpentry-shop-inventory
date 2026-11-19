package com.pointage.controller;

import com.pointage.dto.AccompteDTO;
import com.pointage.dto.AccompteRequestDTO;
import com.pointage.service.AccompteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accomptes")
@RequiredArgsConstructor
public class AccompteController {

    private final AccompteService service;

    @GetMapping("/affaire/{affaireId}")
    public List<AccompteDTO> getByAffaire(@PathVariable Long affaireId) {
        return service.findByAffaireId(affaireId);
    }

    @PostMapping
    public AccompteDTO create(@RequestBody AccompteRequestDTO req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public AccompteDTO update(@PathVariable Long id, @RequestBody AccompteRequestDTO req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
