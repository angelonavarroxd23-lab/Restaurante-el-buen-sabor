package com.restaurante.pedido;

import com.restaurante.mesa.Mesa;
import com.restaurante.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Pedido {

    public enum EstadoPedido { PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, PAGADO, CANCELADO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mesero_id", nullable = false)
    private Usuario mesero;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "tipo_comprobante", length = 20)
    private String tipoComprobante;

    @Column(name = "serie_numero", length = 30)
    private String serieNumero;

    @Column(name = "cliente_documento", length = 150)
    private String clienteDocumento;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Builder.Default
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Builder.Default
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DetallePedido> detalles = new ArrayList<>();
}
