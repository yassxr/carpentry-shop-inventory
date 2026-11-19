package com.pointage.controller;

import com.pointage.dto.AffaireDTO;
import com.pointage.model.Employe;
import com.pointage.service.EmployeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final EmployeService service;

    @GetMapping
    public List<Employe> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Employe create(@RequestBody Employe employe) {
        return service.create(employe);
    }

    @PutMapping("/{id}")
    public Employe update(@PathVariable Long id, @RequestBody Employe employe) {
        return service.update(id, employe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/affaires")
    public List<AffaireDTO> getAffairesTravaillees(@PathVariable Long id) {
        return service.getAffairesTravaillees(id);
    }
}
