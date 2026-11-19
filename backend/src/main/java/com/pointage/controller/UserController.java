package com.pointage.controller;

import com.pointage.dto.UserDTO;
import com.pointage.dto.UserRequestDTO;
import com.pointage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping
    public List<UserDTO> getAll() {
        return service.findAll();
    }

    @PostMapping
    public UserDTO create(@RequestBody UserRequestDTO req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public UserDTO update(@PathVariable Long id, @RequestBody UserRequestDTO req) {
        return service.update(id, req);
    }

    @PutMapping("/{id}/terminate")
    public UserDTO terminate(@PathVariable Long id) {
        return service.terminate(id);
    }
}
