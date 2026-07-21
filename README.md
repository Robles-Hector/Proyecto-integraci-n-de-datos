# F1 Historical DB

Aplicación web full-stack para consultar y administrar el historial de la Fórmula 1 (temporadas 2020-2026): pilotos, escuderías, circuitos, carreras y resultados. Proyecto desarrollado como trabajo integrador para la asignatura de Bases de Datos — Universidad de las Fuerzas Armadas ESPE, Sede Santo Domingo.

## Evolución del proyecto

En etapas anteriores del periodo académico, el frontend consumía la información desde un archivo `f1Data.json` local, simulando el comportamiento del sistema con datos estáticos. En esta etapa, ese consumo fue reemplazado por completo por peticiones HTTP hacia un backend real desarrollado en Spring Boot. Actualmente, todos los datos (pilotos, escuderías, circuitos, carreras y resultados) se consultan, registran, modifican y desactivan lógicamente desde una base de datos PostgreSQL, a través de servicios REST documentados con Swagger.

**Antes:** `Frontend → f1Data.json (datos simulados)`
**Ahora:** `Frontend → API REST Spring Boot → PostgreSQL`

## Stack tecnológico

**Frontend:** React, React Router, Leaflet (mapa OpenStreetMap)
**Backend:** Spring Boot, Spring Security, Spring Data JPA, JWT, BCrypt
**Base de datos:** PostgreSQL
**Documentación de API:** Swagger / OpenAPI
**Otros:** HikariCP (pool de conexiones), Maven

## Estructura del repositorio
```
├── 📁 .github
│   └── 📁 modernize
│       └── 📁 java-upgrade
│           ├── 📁 hooks
│           │   ├── 📁 scripts
│           │   │   ├── 📄 recordToolUse.ps1
│           │   │   └── 📄 recordToolUse.sh
│           │   └── ⚙️ e2736fcc-115a-4d53-bfce-376e760f8a09.json
│           └── ⚙️ .gitignore
├── 📁 f1-historical-backend
│   ├── 📁 .github
│   │   └── 📁 modernize
│   │       └── 📁 java-upgrade
│   │           ├── 📁 20260713212210
│   │           │   ├── 📁 logs
│   │           │   └── 📝 plan.md
│   │           ├── 📁 hooks
│   │           │   └── 📁 scripts
│   │           │       ├── 📄 recordToolUse.ps1
│   │           │       └── 📄 recordToolUse.sh
│   │           └── ⚙️ .gitignore
│   ├── 📁 .mvn
│   │   └── 📁 wrapper
│   │       └── 📄 maven-wrapper.properties
│   ├── 📁 src
│   │   ├── 📁 main
│   │   │   ├── 📁 java
│   │   │   │   └── 📁 edu
│   │   │   │       └── 📁 espe
│   │   │   │           └── 📁 f1
│   │   │   │               ├── 📁 config
│   │   │   │               │   ├── ☕ DataInitializer.java
│   │   │   │               │   ├── ☕ JwtUtil.java
│   │   │   │               │   ├── ☕ OpenApiConfig.java
│   │   │   │               │   └── ☕ SecurityConfig.java
│   │   │   │               ├── 📁 controller
│   │   │   │               │   ├── ☕ AuthController.java
│   │   │   │               │   ├── ☕ ChangeLogController.java
│   │   │   │               │   ├── ☕ CircuitController.java
│   │   │   │               │   ├── ☕ DriverController.java
│   │   │   │               │   ├── ☕ RaceController.java
│   │   │   │               │   ├── ☕ RaceResultController.java
│   │   │   │               │   ├── ☕ SearchController.java
│   │   │   │               │   └── ☕ TeamController.java
│   │   │   │               ├── 📁 dto
│   │   │   │               │   ├── ☕ CircuitMapper.java
│   │   │   │               │   ├── ☕ CircuitResponseDTO.java
│   │   │   │               │   ├── ☕ CircuitSummaryDTO.java
│   │   │   │               │   ├── ☕ DriverMapper.java
│   │   │   │               │   ├── ☕ DriverResponseDTO.java
│   │   │   │               │   ├── ☕ DriverSummaryDTO.java
│   │   │   │               │   ├── ☕ ErrorResponseDTO.java
│   │   │   │               │   ├── ☕ RaceMapper.java
│   │   │   │               │   ├── ☕ RaceResponseDTO.java
│   │   │   │               │   ├── ☕ RaceResultMapper.java
│   │   │   │               │   ├── ☕ RaceResultResponseDTO.java
│   │   │   │               │   ├── ☕ TeamMapper.java
│   │   │   │               │   ├── ☕ TeamResponseDTO.java
│   │   │   │               │   └── ☕ TeamSummaryDTO.java
│   │   │   │               ├── 📁 entity
│   │   │   │               │   ├── ☕ ChangeLog.java
│   │   │   │               │   ├── ☕ Circuit.java
│   │   │   │               │   ├── ☕ Driver.java
│   │   │   │               │   ├── ☕ DriverTransfer.java
│   │   │   │               │   ├── ☕ Race.java
│   │   │   │               │   ├── ☕ RaceResult.java
│   │   │   │               │   ├── ☕ Role.java
│   │   │   │               │   ├── ☕ Team.java
│   │   │   │               │   └── ☕ User.java
│   │   │   │               ├── 📁 exception
│   │   │   │               │   └── ☕ GlobalExceptionHandler.java
│   │   │   │               ├── 📁 repository
│   │   │   │               │   ├── ☕ ChangeLogRepository.java
│   │   │   │               │   ├── ☕ CircuitRepository.java
│   │   │   │               │   ├── ☕ DriverRepository.java
│   │   │   │               │   ├── ☕ DriverTransferRepository.java
│   │   │   │               │   ├── ☕ RaceRepository.java
│   │   │   │               │   ├── ☕ RaceResultRepository.java
│   │   │   │               │   ├── ☕ RoleRepository.java
│   │   │   │               │   ├── ☕ TeamRepository.java
│   │   │   │               │   └── ☕ UserRepository.java
│   │   │   │               ├── 📁 service
│   │   │   │               │   ├── ☕ AuthService.java
│   │   │   │               │   ├── ☕ ChangeLogService.java
│   │   │   │               │   ├── ☕ CircuitService.java
│   │   │   │               │   ├── ☕ DriverService.java
│   │   │   │               │   ├── ☕ RaceResultService.java
│   │   │   │               │   ├── ☕ RaceService.java
│   │   │   │               │   ├── ☕ SearchService.java
│   │   │   │               │   └── ☕ TeamService.java
│   │   │   │               └── ☕ F1HistoricalBackendApplication.java
│   │   │   └── 📁 resources
│   │   │       ├── 📄 application.properties
│   │   │       └── ⚙️ f1Data.json
│   │   └── 📁 test
│   │       └── 📁 java
│   │           └── 📁 edu
│   │               └── 📁 espe
│   │                   └── 📁 f1
│   │                       └── ☕ F1HistoricalBackendApplicationTests.java
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitattributes
│   ├── ⚙️ .gitignore
│   ├── 📝 HELP.md
│   ├── 📄 mvnw
│   ├── 📄 mvnw.cmd
│   └── ⚙️ pom.xml
└── 📁 f1-history
    ├── 📁 public
    │   └── 🌐 index.html
    ├── 📁 src
    │   ├── 📁 components
    │   │   ├── 📁 layout
    │   │   │   └── 📄 Navbar.jsx
    │   │   └── 📁 pages
    │   │       ├── 📄 AdminPage.jsx
    │   │       ├── 📄 CircuitsMap.jsx
    │   │       ├── 📄 CircuitsPage.jsx
    │   │       ├── 📄 ComparatorPage.jsx
    │   │       ├── 📄 DashboardPage.jsx
    │   │       ├── 📄 DriversPage.jsx
    │   │       ├── 📄 HomePage.jsx
    │   │       ├── 📄 LoginPage.jsx
    │   │       ├── 📄 MisPostulacionesPage.jsx
    │   │       ├── 📄 PilotPage.jsx
    │   │       ├── 📄 PostularEquipoPage.jsx
    │   │       ├── 📄 RaceResultsPage.jsx
    │   │       ├── 📄 RacesPage.jsx
    │   │       ├── 📄 RegisterPage.jsx
    │   │       ├── 📄 SearchPage.jsx
    │   │       └── 📄 SeasonsPage.jsx
    │   ├── 📁 context
    │   │   └── 📄 AppContext.jsx
    │   ├── 📁 data
    │   │   └── ⚙️ f1Data.json
    │   ├── 📁 hooks
    │   │   └── 📄 useF1Data.js
    │   ├── 🎨 App.css
    │   ├── 📄 App.jsx
    │   └── 📄 index.js
    ├── 📝 README.md
    ├── ⚙️ package-lock.json
    └── ⚙️ package.json
```
## Funcionalidades principales

- Autenticación con JWT, roles múltiples por usuario (`ADMIN` / `USER`)
- Rutas protegidas según rol, tanto en frontend como en backend
- CRUD completo de pilotos, escuderías, carreras y resultados de carrera
- Eliminación lógica en todas las entidades (campo `active`/`status`, según la tabla)
- Paginación en Carreras, Temporadas e Historial de cambios
- Búsqueda general con filtros por categoría (pilotos, escuderías, circuitos, carreras)
- Historial de auditoría de cambios (creaciones, ediciones, eliminaciones y búsquedas), visible solo para administradores
- Mapa interactivo de circuitos con OpenStreetMap
- Proceso transaccional (`@Transactional`) al registrar resultados de carrera, actualizando estadísticas del piloto en la misma operación
- Validaciones de negocio: colores de escudería únicos, números de piloto sin duplicar, número "1" reservado para el campeón vigente, edad mínima de 18 años
- Manejo centralizado de errores con formato JSON uniforme (`GlobalExceptionHandler`), incluyendo validaciones de campos, conflictos de base de datos y errores 500 controlados
- Documentación interactiva de la API vía Swagger/OpenAPI, con soporte de autenticación JWT integrado (botón "Authorize")

## Requisitos previos

- Java 21
- Node.js y npm
- PostgreSQL 14+
- Maven (o usar el wrapper `./mvnw` incluido)

## Configuración del backend

1. Entra a la carpeta `f1-historical-backend/`.
2. Crea la base de datos en PostgreSQL:
```sql
   CREATE DATABASE f1_historical_db;
```
3. Crea un archivo `.env` en la raíz de `f1-historical-backend/` (mismo nivel que `pom.xml`), usando `.env.example` como plantilla:

DB_URL=jdbc:postgresql://localhost:5432/f1_historical_db
DB_USERNAME=f1_app
DB_PASSWORD=tu_contraseña
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_admin

4. Ejecuta:
```bash
   ./mvnw spring-boot:run
```
5. El backend queda disponible en `http://localhost:8082`.
6. Documentación de la API (Swagger): `http://localhost:8082/swagger-ui/index.html`

## Configuración del frontend

1. Entra a la carpeta `f1-history/`.
2. Instala dependencias:
```bash
   npm install
```
3. Ejecuta:
```bash
   npm start
```
4. La app queda disponible en `http://localhost:3000`.

## Roles del sistema

- **USER:** puede consultar toda la información pública, postular una nueva escudería, y ver el estado de sus postulaciones.
- **ADMIN:** además de lo anterior, puede aprobar/rechazar postulaciones, gestionar transferencias de pilotos, crear/editar carreras y resultados, y ver el historial de auditoría del sistema.

## Autor

Héctor — ESPE Sede Santo Domingo
