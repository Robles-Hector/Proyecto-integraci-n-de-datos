package edu.espe.f1.controller;

import edu.espe.f1.entity.ChangeLog;
import edu.espe.f1.service.ChangeLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/change-logs")
@CrossOrigin(origins = "*")
public class ChangeLogController {

    @Autowired private ChangeLogService changeLogService;

    // GET /api/change-logs — solo ADMIN (la regla de seguridad se agrega abajo)
    @GetMapping
    public ResponseEntity<List<ChangeLog>> getAllLogs() {
        return ResponseEntity.ok(changeLogService.getAllLogs());
    }
}