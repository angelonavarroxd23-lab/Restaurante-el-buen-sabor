package com.restaurante.pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByEstado(Pedido.EstadoPedido estado);

    List<Pedido> findByMesaIdOrderByFechaCreacionDesc(Long mesaId);

    List<Pedido> findByOrderByFechaCreacionDesc();
}
