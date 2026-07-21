package edu.espe.f1.service;

import edu.espe.f1.entity.ChangeLog;
import edu.espe.f1.repository.ChangeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChangeLogService {

    @Autowired private ChangeLogRepository changeLogRepository;

    // Se llama desde cualquier otro service para registrar una acción
    public void log(String action, String entityType, String entityId, String performedBy, String details) {
        ChangeLog entry = new ChangeLog(action, entityType, entityId,
            performedBy != null ? performedBy : "anónimo", details);
        changeLogRepository.save(entry);
    }

    public List<ChangeLog> getAllLogs() {
        return changeLogRepository.findAllByOrderByCreatedAtDesc();
    }
}