package com.pointage.service;

import com.pointage.dto.PlageHoraireDTO;
import com.pointage.dto.PointageDetailDTO;
import com.pointage.dto.PointageMensuelDTO;
import com.pointage.dto.PointageRequestDTO;
import com.pointage.dto.PointageSummaryDTO;
import com.pointage.model.Employe;
import com.pointage.model.PlageHoraire;
import com.pointage.model.Pointage;
import com.pointage.repository.AffaireRepository;
import com.pointage.repository.EmployeRepository;
import com.pointage.repository.PlageHoraireRepository;
import com.pointage.repository.PointageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PointageService {

    private final PointageRepository pointageRepository;
    private final EmployeRepository employeRepository;
    private final AffaireRepository affaireRepository;
    private final PlageHoraireRepository plageHoraireRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public PointageDetailDTO save(PointageRequestDTO req) {
        LocalDate date = LocalDate.parse(req.getDatePointage());
        Employe employe = employeRepository.findById(req.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + req.getEmployeId()));

        Pointage pointage = pointageRepository
                .findByEmployeIdAndDatePointage(req.getEmployeId(), date)
                .orElse(new Pointage());

        pointage.setDatePointage(date);
        pointage.setEmploye(employe);

        pointage.setMatinHeureEntree(parseTime(req.getMatinHeureEntree()));
        pointage.setMatinHeureSortie(parseTime(req.getMatinHeureSortie()));

        pointage.setApresMidiHeureEntree(parseTime(req.getApresMidiHeureEntree()));
        pointage.setApresMidiHeureSortie(parseTime(req.getApresMidiHeureSortie()));

        // Replace plages: clear existing, add new ones
        pointage.getPlagesHoraires().clear();
        pointage = pointageRepository.save(pointage);

        if (req.getPlagesHoraires() != null) {
            for (PlageHoraireDTO dto : req.getPlagesHoraires()) {
                PlageHoraire ph = new PlageHoraire();
                ph.setPointage(pointage);
                if (dto.getAffaireId() != null) {
                    ph.setAffaire(affaireRepository.findById(dto.getAffaireId()).orElse(null));
                }
                ph.setHeureDebut(parseDateTime(dto.getHeureDebut()));
                ph.setHeureFin(parseDateTime(dto.getHeureFin()));
                ph.setCommentaire(dto.getCommentaire());
                ph.setPeriode(dto.getPeriode());
                ph.setLieuTravailType(dto.getLieuTravailType());
                pointage.getPlagesHoraires().add(ph);
            }
        }

        pointage = pointageRepository.save(pointage);
        return toDetailDTO(pointage);
    }

    @Transactional(readOnly = true)
    public List<PointageSummaryDTO> getByDate(LocalDate date) {
        return pointageRepository.findByDatePointage(date).stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PointageDetailDTO getByEmployeAndDate(Long employeId, LocalDate date) {
        return pointageRepository.findByEmployeIdAndDatePointage(employeId, date)
                .map(this::toDetailDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PointageSummaryDTO> getByRange(LocalDate debut, LocalDate fin) {
        return pointageRepository.findByDateRange(debut, fin).stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        pointageRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PointageMensuelDTO> getMensuel(Long employeId, String mois) {
        LocalDate debut = LocalDate.parse(mois + "-01");
        LocalDate fin = debut.withDayOfMonth(debut.lengthOfMonth());

        Map<LocalDate, Pointage> map = pointageRepository
                .findMensuel(employeId, debut, fin)
                .stream()
                .collect(Collectors.toMap(Pointage::getDatePointage, p -> p));

        Map<DayOfWeek, String> JOURS = Map.of(
                DayOfWeek.MONDAY, "Lun", DayOfWeek.TUESDAY, "Mar",
                DayOfWeek.WEDNESDAY, "Mer", DayOfWeek.THURSDAY, "Jeu",
                DayOfWeek.FRIDAY, "Ven", DayOfWeek.SATURDAY, "Sam",
                DayOfWeek.SUNDAY, "Dim"
        );

        List<PointageMensuelDTO> result = new ArrayList<>();
        for (LocalDate d = debut; !d.isAfter(fin); d = d.plusDays(1)) {
            Pointage p = map.get(d);
            DayOfWeek dow = d.getDayOfWeek();
            boolean isWeekend = dow == DayOfWeek.SUNDAY;
            boolean isSamedi = dow == DayOfWeek.SATURDAY;

            double hMatin = computeHours(
                    p != null ? p.getMatinHeureEntree() : null,
                    p != null ? p.getMatinHeureSortie() : null);
            double hAM = computeHours(
                    p != null ? p.getApresMidiHeureEntree() : null,
                    p != null ? p.getApresMidiHeureSortie() : null);
            double hTrav = hMatin + hAM;
            double hRegl = isWeekend ? 0.0 : isSamedi ? 4.0 : 8.0;
            double hSupp = Math.max(0.0, hTrav - hRegl);

            result.add(PointageMensuelDTO.builder()
                    .date(d.toString())
                    .jourSemaine(JOURS.get(dow))
                    .weekend(isWeekend)
                    .samedi(isSamedi)
                    .pointageId(p != null ? p.getId() : null)
                    .matinHeureEntree(p != null ? formatTime(p.getMatinHeureEntree()) : null)
                    .matinHeureSortie(p != null ? formatTime(p.getMatinHeureSortie()) : null)
                    .apresMidiHeureEntree(p != null ? formatTime(p.getApresMidiHeureEntree()) : null)
                    .apresMidiHeureSortie(p != null ? formatTime(p.getApresMidiHeureSortie()) : null)
                    .heuresTravaillees(hTrav)
                    .heuresReglementaires(hRegl)
                    .heuresSupplementaires(hSupp)
                    .build());
        }
        return result;
    }

    private double computeHours(LocalTime entree, LocalTime sortie) {
        if (entree == null || sortie == null) return 0.0;
        long minutes = Duration.between(entree, sortie).toMinutes();
        return minutes > 0 ? minutes / 60.0 : 0.0;
    }

    @Transactional(readOnly = true)
    public List<PlageHoraireDTO> getPlages(Long pointageId, String periode) {
        List<PlageHoraire> list = (periode != null && !periode.isBlank())
                ? plageHoraireRepository.findByPointageIdAndPeriode(pointageId, periode)
                : plageHoraireRepository.findByPointageId(pointageId);
        return list.stream().map(this::toPlageDTO).collect(Collectors.toList());
    }

    public PlageHoraireDTO addPlage(Long pointageId, PlageHoraireDTO dto) {
        Pointage pointage = pointageRepository.findById(pointageId)
                .orElseThrow(() -> new RuntimeException("Pointage introuvable: " + pointageId));
        PlageHoraire ph = new PlageHoraire();
        ph.setPointage(pointage);
        if (dto.getAffaireId() != null) {
            ph.setAffaire(affaireRepository.findById(dto.getAffaireId()).orElse(null));
        }
        ph.setHeureDebut(parseDateTime(dto.getHeureDebut()));
        ph.setHeureFin(parseDateTime(dto.getHeureFin()));
        ph.setCommentaire(dto.getCommentaire());
        ph.setPeriode(dto.getPeriode());
        ph.setLieuTravailType(dto.getLieuTravailType());
        return toPlageDTO(plageHoraireRepository.save(ph));
    }

    public PlageHoraireDTO updatePlage(Long pointageId, Long plageId, PlageHoraireDTO dto) {
        PlageHoraire ph = plageHoraireRepository.findById(plageId)
                .orElseThrow(() -> new RuntimeException("Plage introuvable: " + plageId));
        if (dto.getAffaireId() != null) {
            ph.setAffaire(affaireRepository.findById(dto.getAffaireId()).orElse(null));
        }
        ph.setHeureDebut(parseDateTime(dto.getHeureDebut()));
        ph.setHeureFin(parseDateTime(dto.getHeureFin()));
        ph.setCommentaire(dto.getCommentaire());
        ph.setLieuTravailType(dto.getLieuTravailType());
        return toPlageDTO(plageHoraireRepository.save(ph));
    }

    public void deletePlage(Long pointageId, Long plageId) {
        plageHoraireRepository.deleteById(plageId);
    }

    // ── Mapping helpers ────────────────────────────────────────────────────────

    private PointageDetailDTO toDetailDTO(Pointage p) {
        return PointageDetailDTO.builder()
                .id(p.getId())
                .datePointage(p.getDatePointage() != null ? p.getDatePointage().toString() : null)
                .employeId(p.getEmploye() != null ? p.getEmploye().getId() : null)
                .matinHeureEntree(formatTime(p.getMatinHeureEntree()))
                .matinHeureSortie(formatTime(p.getMatinHeureSortie()))
                .apresMidiHeureEntree(formatTime(p.getApresMidiHeureEntree()))
                .apresMidiHeureSortie(formatTime(p.getApresMidiHeureSortie()))
                .plagesHoraires(p.getPlagesHoraires().stream().map(this::toPlageDTO).collect(Collectors.toList()))
                .build();
    }

    private PointageSummaryDTO toSummaryDTO(Pointage p) {
        return PointageSummaryDTO.builder()
                .id(p.getId())
                .employeNomComplet(p.getEmploye().getPrenom() + " " + p.getEmploye().getNom())
                .matinHeureEntree(formatTime(p.getMatinHeureEntree()))
                .matinHeureSortie(formatTime(p.getMatinHeureSortie()))
                .apresMidiHeureEntree(formatTime(p.getApresMidiHeureEntree()))
                .apresMidiHeureSortie(formatTime(p.getApresMidiHeureSortie()))
                .build();
    }

    private PlageHoraireDTO toPlageDTO(PlageHoraire ph) {
        return PlageHoraireDTO.builder()
                .id(ph.getId())
                .affaireId(ph.getAffaire() != null ? ph.getAffaire().getId() : null)
                .heureDebut(ph.getHeureDebut() != null ? ph.getHeureDebut().format(TIME_FMT) : null)
                .heureFin(ph.getHeureFin() != null ? ph.getHeureFin().format(TIME_FMT) : null)
                .commentaire(ph.getCommentaire())
                .periode(ph.getPeriode())
                .lieuTravailType(ph.getLieuTravailType())
                .build();
    }

    // ── Parse helpers ──────────────────────────────────────────────────────────

    private LocalTime parseTime(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalTime.parse(s);
    }

    private LocalDateTime parseDateTime(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalDateTime.parse(s);
    }

    private String formatTime(LocalTime t) {
        return t != null ? t.format(TIME_FMT) : null;
    }
}
