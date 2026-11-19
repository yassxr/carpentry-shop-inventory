package com.pointage.controller;

import com.pointage.dto.PlageHoraireDTO;
import com.pointage.dto.PointageDetailDTO;
import com.pointage.dto.PointageMensuelDTO;
import com.pointage.dto.PointageRequestDTO;
import com.pointage.dto.PointageSummaryDTO;
import com.pointage.service.PointageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pointages")
@RequiredArgsConstructor
public class PointageController {

    private final PointageService service;

    @PostMapping
    public PointageDetailDTO save(@RequestBody PointageRequestDTO req) {
        return service.save(req);
    }

    @GetMapping("/date/{date}")
    public List<PointageSummaryDTO> getByDate(@PathVariable String date) {
        return service.getByDate(LocalDate.parse(date));
    }

    @GetMapping("/employe/{employeId}/date/{date}")
    public ResponseEntity<PointageDetailDTO> getByEmployeAndDate(
            @PathVariable Long employeId,
            @PathVariable String date) {
        PointageDetailDTO result = service.getByEmployeAndDate(employeId, LocalDate.parse(date));
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping("/range")
    public List<PointageSummaryDTO> getByRange(
            @RequestParam String debut,
            @RequestParam String fin) {
        return service.getByRange(LocalDate.parse(debut), LocalDate.parse(fin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employe/{employeId}/mois/{mois}")
    public List<PointageMensuelDTO> getMensuel(
            @PathVariable Long employeId,
            @PathVariable String mois) {
        return service.getMensuel(employeId, mois);
    }

    // ── Plages horaires sub-resource ───────────────────────────────────────────

    @GetMapping("/{pointageId}/plages-horaires")
    public List<PlageHoraireDTO> getPlages(
            @PathVariable Long pointageId,
            @RequestParam(required = false) String periode) {
        return service.getPlages(pointageId, periode);
    }

    @PostMapping("/{pointageId}/plages-horaires")
    public PlageHoraireDTO addPlage(
            @PathVariable Long pointageId,
            @RequestBody PlageHoraireDTO dto) {
        return service.addPlage(pointageId, dto);
    }

    @PutMapping("/{pointageId}/plages-horaires/{id}")
    public PlageHoraireDTO updatePlage(
            @PathVariable Long pointageId,
            @PathVariable Long id,
            @RequestBody PlageHoraireDTO dto) {
        return service.updatePlage(pointageId, id, dto);
    }

    @DeleteMapping("/{pointageId}/plages-horaires/{id}")
    public ResponseEntity<Void> deletePlage(
            @PathVariable Long pointageId,
            @PathVariable Long id) {
        service.deletePlage(pointageId, id);
        return ResponseEntity.noContent().build();
    }
}
