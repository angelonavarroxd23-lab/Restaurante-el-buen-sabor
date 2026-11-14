package com.restaurante.pedido;

import com.restaurante.mesa.Mesa;
import com.restaurante.mesa.MesaRepository;
import com.restaurante.plato.Plato;
import com.restaurante.plato.PlatoRepository;
import com.restaurante.usuario.Usuario;
import com.restaurante.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final MesaRepository mesaRepository;
    private final PlatoRepository platoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findByOrderByFechaCreacionDesc();
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorEstado(Pedido.EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Pedido obtenerActivoPorMesa(Long mesaId) {
        List<Pedido> pedidosMesa = pedidoRepository.findByMesaIdOrderByFechaCreacionDesc(mesaId);
        return pedidosMesa.stream()
                .filter(p -> p.getEstado() != Pedido.EstadoPedido.PAGADO
                          && p.getEstado() != Pedido.EstadoPedido.CANCELADO)
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public Pedido crear(Pedido pedido) {
        Mesa mesa = mesaRepository.findById(pedido.getMesa().getId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada con ID: " + pedido.getMesa().getId()));

        mesa.setEstado(Mesa.EstadoMesa.OCUPADA);
        mesaRepository.save(mesa);
        pedido.setMesa(mesa);

        Long meseroId = (pedido.getMesero() != null && pedido.getMesero().getId() != null)
                ? pedido.getMesero().getId() : 2L;
        Usuario mesero = usuarioRepository.findById(meseroId)
                .orElseGet(() -> usuarioRepository.findAll().stream().findFirst().orElse(null));
        pedido.setMesero(mesero);

        BigDecimal total = BigDecimal.ZERO;
        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                detalle.setPedido(pedido);
                if (detalle.getPlato() != null && detalle.getPlato().getId() != null) {
                    Plato plato = platoRepository.findById(detalle.getPlato().getId())
                            .orElseThrow(() -> new RuntimeException("Plato no encontrado"));
                    detalle.setPlato(plato);
                    if (detalle.getPrecioUnitario() == null) {
                        detalle.setPrecioUnitario(plato.getPrecio());
                    }
                }
                BigDecimal sub = detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad()));
                detalle.setSubtotal(sub);
                total = total.add(sub);
            }
        }
        pedido.setTotal(total);
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        pedido.setFechaCreacion(LocalDateTime.now());
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido actualizar(Long id, Pedido datos) {
        Pedido existente = obtenerPorId(id);
        if (datos.getObservaciones() != null) {
            existente.setObservaciones(datos.getObservaciones());
        }

        if (datos.getDetalles() != null && !datos.getDetalles().isEmpty()) {
            existente.getDetalles().clear();
            BigDecimal total = BigDecimal.ZERO;
            List<DetallePedido> nuevosDetalles = new ArrayList<>();
            for (DetallePedido d : datos.getDetalles()) {
                DetallePedido item = new DetallePedido();
                item.setPedido(existente);
                item.setCantidad(d.getCantidad());
                item.setNotas(d.getNotas());

                if (d.getPlato() != null && d.getPlato().getId() != null) {
                    Plato plato = platoRepository.findById(d.getPlato().getId())
                            .orElseThrow(() -> new RuntimeException("Plato no encontrado"));
                    item.setPlato(plato);
                    item.setPrecioUnitario(d.getPrecioUnitario() != null ? d.getPrecioUnitario() : plato.getPrecio());
                } else {
                    item.setPrecioUnitario(d.getPrecioUnitario());
                }

                BigDecimal sub = item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()));
                item.setSubtotal(sub);
                total = total.add(sub);
                nuevosDetalles.add(item);
            }
            existente.getDetalles().addAll(nuevosDetalles);
            existente.setTotal(total);
        }

        if (existente.getEstado() == Pedido.EstadoPedido.ENTREGADO || existente.getEstado() == Pedido.EstadoPedido.LISTO) {
            existente.setEstado(Pedido.EstadoPedido.PENDIENTE);
        }
        return pedidoRepository.save(existente);
    }

    @Transactional
    public Pedido cobrarPedido(Long id, Pedido datosCobro) {
        Pedido pedido = obtenerPorId(id);

        if (datosCobro != null && datosCobro.getDetalles() != null && !datosCobro.getDetalles().isEmpty()) {
            pedido = actualizar(id, datosCobro);
        }

        String tipo = (datosCobro != null && datosCobro.getTipoComprobante() != null)
                ? datosCobro.getTipoComprobante().toUpperCase() : "BOLETA";
        String cliente = (datosCobro != null && datosCobro.getClienteDocumento() != null && !datosCobro.getClienteDocumento().isBlank())
                ? datosCobro.getClienteDocumento() : "Cliente General";
        String metodo = (datosCobro != null && datosCobro.getMetodoPago() != null && !datosCobro.getMetodoPago().isBlank())
                ? datosCobro.getMetodoPago() : "Efectivo";

        pedido.setTipoComprobante(tipo);
        pedido.setClienteDocumento(cliente);
        pedido.setMetodoPago(metodo);

        if (pedido.getSerieNumero() == null || pedido.getSerieNumero().isBlank()) {
            String prefijo = "FACTURA".equals(tipo) ? "F001-" : "B001-";
            long base = "FACTURA".equals(tipo) ? 35L : 140L;
            pedido.setSerieNumero(prefijo + String.format("%06d", base + pedido.getId()));
        }

        pedido.setEstado(Pedido.EstadoPedido.PAGADO);
        pedido.setFechaCierre(LocalDateTime.now());

        Mesa mesa = pedido.getMesa();
        if (mesa != null) {
            mesa.setEstado(Mesa.EstadoMesa.DISPONIBLE);
            mesaRepository.save(mesa);
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido crearYCobrarDirecto(Pedido datos) {
        Pedido creado = crear(datos);
        return cobrarPedido(creado.getId(), datos);
    }

    @Transactional
    public Pedido actualizarEstado(Long id, Pedido.EstadoPedido nuevoEstado) {
        if (nuevoEstado == Pedido.EstadoPedido.PAGADO) {
            return cobrarPedido(id, null);
        }
        Pedido pedido = obtenerPorId(id);
        pedido.setEstado(nuevoEstado);

        if (nuevoEstado == Pedido.EstadoPedido.CANCELADO) {
            pedido.setFechaCierre(LocalDateTime.now());
            Mesa mesa = pedido.getMesa();
            if (mesa != null) {
                mesa.setEstado(Mesa.EstadoMesa.DISPONIBLE);
                mesaRepository.save(mesa);
            }
        }
        return pedidoRepository.save(pedido);
    }
}
