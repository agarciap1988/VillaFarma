package com.villafarma.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.villafarma.dto.request.UserRegisterRequestDTO;
import com.villafarma.dto.response.UserProfileDTO;
import com.villafarma.model.Role;
import com.villafarma.model.User;
import com.villafarma.repository.RoleRepository;
import com.villafarma.repository.UserRepository;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public List<User> listAll() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestBody UserRegisterRequestDTO req) {
        if (userRepository.existsByDni(req.getDni())) {
            return ResponseEntity.badRequest().body(Map.of("message", "DNI ya registrado"));
        }
        if (req.getEmail() != null && userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email ya registrado"));
        }
        User u = new User();
        u.setDni(req.getDni());
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setBirthDate(req.getBirthDate());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        Role roleUser = roleRepository.findByName("ROLE_USER").orElse(null);
        if (roleUser != null) {
            u.getRoles().add(roleUser);
        }
        userRepository.save(u);
        return ResponseEntity.status(201).body(Map.of("message", "Usuario registrado"));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getLoggedInUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Acceso denegado. Se requiere un token JWT válido.");
        }
        String userIdentifier = authentication.getName();
        User user = userRepository.findByDni(userIdentifier)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuario autenticado no encontrado con DNI/Username: " + userIdentifier
        ));

        UserProfileDTO profileDto = mapUserToProfileDto(user);

        return ResponseEntity.ok(profileDto);
    }

    private UserProfileDTO mapUserToProfileDto(User user) {
        UserProfileDTO userProfileDTO = new UserProfileDTO();
        userProfileDTO.setDni(user.getDni());
        userProfileDTO.setEmail(user.getEmail());
        userProfileDTO.setFirstName(user.getFirstName());
        userProfileDTO.setLastName(user.getLastName());
        userProfileDTO.setPhone(user.getPhone());
        userProfileDTO.setBirthDate(user.getBirthDate());
        return userProfileDTO;
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UpdateRequest req, Authentication auth) {
        
        // Obtener el usuario autenticado desde el token
        User user = userRepository.findByDni(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        String currentEmail = user.getEmail();
        String newEmail = req.getEmail();
        
        if(newEmail != null && !newEmail.isBlank()){
            if(!newEmail.equalsIgnoreCase(currentEmail)){
                if(userRepository.existsByEmail(newEmail)){
                    return ResponseEntity.badRequest().body(Map.of("message","Email ya registrado por otro usuario"));
                }
                user.setEmail(newEmail);
            }
        }

        // Actualizar los campos permitidos

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.setPhone(req.getPhone());
        }

        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            user.setFirstName(req.getFirstName());
        }

        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            user.setLastName(req.getLastName());
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Datos actualizados correctamente"));
    }
    
    public static class UpdateRequest {

        private String firstName;
        private String lastName;
        private String email;
        private String phone;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }
}
