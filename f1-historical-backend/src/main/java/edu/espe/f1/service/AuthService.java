package edu.espe.f1.service;

import edu.espe.f1.config.JwtUtil;
import edu.espe.f1.entity.Role;
import edu.espe.f1.entity.User;
import edu.espe.f1.repository.RoleRepository;
import edu.espe.f1.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    // ── REGISTRO ─────────────────────────────────────────────────
    public Map<String, Object> register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "El usuario '" + username + "' ya existe");
        }

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Rol ROLE_USER no encontrado — reinicia el backend"));

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.getRoles().add(userRole);
        userRepository.save(user);

        List<String> roles = List.of("ROLE_USER");
        String token = jwtUtil.generateToken(username, roles);

        return Map.of(
            "token",    token,
            "username", username,
            "roles",    roles
        );
    }

    // ── LOGIN ─────────────────────────────────────────────────────
    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Usuario o contraseña incorrectos"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Cuenta desactivada — contacta al administrador");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Usuario o contraseña incorrectos");
        }

        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name())
            .collect(Collectors.toList());

        String token = jwtUtil.generateToken(username, roles);

        return Map.of(
            "token",    token,
            "username", username,
            "roles",    roles
        );
    }

    // ── VALIDAR TOKEN ─────────────────────────────────────────────
    public Map<String, Object> validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido o expirado");
        }
        String username = jwtUtil.extractUsername(token);
        List<String> roles = jwtUtil.extractRoles(token);
        return Map.of("username", username, "roles", roles);
    }

    // ── OBTENER USUARIO ACTUAL ──────────────────────────────────
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado en el contexto actual"));
    }
}