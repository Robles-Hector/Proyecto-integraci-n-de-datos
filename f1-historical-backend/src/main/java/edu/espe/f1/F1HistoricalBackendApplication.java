package edu.espe.f1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class F1HistoricalBackendApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(F1HistoricalBackendApplication.class, args);
    }

    private static void loadEnvFile() {
        try (BufferedReader reader = new BufferedReader(new FileReader(".env"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                int idx = line.indexOf('=');
                if (idx == -1) continue;

                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                System.setProperty(key, value);
            }
            System.out.println("✅ Variables de entorno cargadas desde .env");
        } catch (IOException e) {
            System.out.println("⚠️ No se encontró archivo .env en la raíz del proyecto — verifica su ubicación");
        }
    }
}