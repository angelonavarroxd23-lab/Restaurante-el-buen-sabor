package com.restaurante.mesa;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mesa")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Mesa {

    public enum EstadoMesa { DISPONIBLE, OCUPADA, RESERVADA }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(length = 100)
    private String ubicacion;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMesa estado = EstadoMesa.DISPONIBLE;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
