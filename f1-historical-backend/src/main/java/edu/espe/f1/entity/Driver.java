package edu.espe.f1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "drivers")
@Data
@EqualsAndHashCode(of = "id")   // 👈 agrega esto: equals/hashCode solo por id
@NoArgsConstructor
public class Driver {

    @Id
    private String id;

    @NotBlank(message = "El nombre del piloto es obligatorio")
    private String name;

    @NotBlank(message = "El slug es obligatorio")
    private String slug;

    @NotBlank(message = "La nacionalidad es obligatoria")
    private String nationality;

    @NotBlank(message = "La fecha de nacimiento es obligatoria")
    private String born;

    @Min(value = 1, message = "Número de piloto inválido")
    private int number;

    private int championships;
    private int wins;
    private int podiums;
    private int poles;
    private double points;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Borrado lógico — false = inactivo/eliminado
    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "seasons_data", columnDefinition = "TEXT")
    private String seasonsData;

    // Relación M:1 con Team
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    private Team currentTeam;

    // Relación M:N con Circuit
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
        name = "driver_circuits",
        joinColumns        = @JoinColumn(name = "driver_id"),
        inverseJoinColumns = @JoinColumn(name = "circuit_id")
    )
    private Set<Circuit> circuits = new HashSet<>();
}