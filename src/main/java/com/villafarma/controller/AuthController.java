package com.villafarma.controller;

import com.villafarma.repository.UserRepository;
import com.villafarma.config.JwtUtil;
import com.villafarma.model.Role;
import com.villafarma.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8484")
public class AuthController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getDni(), req.getPassword()));
        String token = jwtUtil.generateToken(req.getDni());
        User user = userRepository.findByDni(req.getDni())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        String fullName = user.getFirstName() + " " + user.getLastName();
        return ResponseEntity.ok(Map.of("token", token, "tokenType", "Bearer", "userLogged", fullName));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        // Obtener usuario autenticado a partir del token
        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Armar respuesta (sin enviar datos sensibles como el hash de la contraseña)
        Map<String, Object> userData = Map.of(
                "dni", user.getDni(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "birthDate", user.getBirthDate(),
                "roles", user.getRoles().stream().map(Role::getName).toList()
        );

        return ResponseEntity.ok(userData);
    }

    public static class LoginRequest {

        private String dni;
        private String password;

        public String getDni() {
            return dni;
        }

        public void setDni(String dni) {
            this.dni = dni;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    
}
