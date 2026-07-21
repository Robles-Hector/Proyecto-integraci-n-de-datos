package edu.espe.f1.controller;

import edu.espe.f1.service.AuthService;
import edu.espe.f1.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired private SearchService searchService;
    @Autowired private AuthService   authService;

    // GET /api/search?q=verstappen&type=drivers
    // type es opcional: drivers | teams | circuits | races | (vacío = todos)
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(required = false) String type,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String username = "anónimo";
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Object u = authService.validateToken(authHeader.substring(7)).get("username");
                if (u != null) username = u.toString();
            } catch (Exception ignored) {
                // token inválido/expirado — se registra como anónimo, no bloquea la búsqueda
            }
        }

        return ResponseEntity.ok(searchService.search(q, type, username));
    }
}