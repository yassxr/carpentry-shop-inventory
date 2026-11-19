package com.pointage.service;

import com.pointage.dto.LoginResponseDTO;
import com.pointage.dto.UserDTO;
import com.pointage.dto.UserRequestDTO;
import com.pointage.model.AppUser;
import com.pointage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public LoginResponseDTO login(String username, String password) {
        AppUser u = repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Identifiants incorrects"));
        if (!Boolean.TRUE.equals(u.getActive()))
            throw new RuntimeException("Compte désactivé");
        if (!encoder.matches(password, u.getPassword()))
            throw new RuntimeException("Identifiants incorrects");
        return new LoginResponseDTO(u.getId(), u.getUsername(), u.getRole());
    }

    public UserDTO create(UserRequestDTO req) {
        if (repo.findByUsername(req.getUsername()).isPresent())
            throw new RuntimeException("Nom d'utilisateur déjà utilisé");
        AppUser u = new AppUser();
        u.setUsername(req.getUsername());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole("mod");
        u.setActive(true);
        return toDTO(repo.save(u));
    }

    public UserDTO update(Long id, UserRequestDTO req) {
        AppUser u = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id));
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            repo.findByUsername(req.getUsername()).ifPresent(existing -> {
                if (!existing.getId().equals(id))
                    throw new RuntimeException("Nom d'utilisateur déjà utilisé");
            });
            u.setUsername(req.getUsername());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(encoder.encode(req.getPassword()));
        }
        return toDTO(repo.save(u));
    }

    public UserDTO terminate(Long id) {
        AppUser u = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + id));
        u.setActive(false);
        u.setPassword(encoder.encode(UUID.randomUUID().toString()));
        return toDTO(repo.save(u));
    }

    public boolean hasAdmin() {
        return repo.existsByRole("admin");
    }

    public void createAdmin(String username, String password) {
        AppUser u = new AppUser();
        u.setUsername(username);
        u.setPassword(encoder.encode(password));
        u.setRole("admin");
        u.setActive(true);
        repo.save(u);
    }

    private UserDTO toDTO(AppUser u) {
        return UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .role(u.getRole())
                .active(u.getActive())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : null)
                .build();
    }
}
