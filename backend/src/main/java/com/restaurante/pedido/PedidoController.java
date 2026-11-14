package com.restaurante.pedido;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<Pedido>> listar(@RequestParam(required = false) Pedido.EstadoPedido estado) {
        if (estado != null) {
            return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @GetMapping("/mesa/{mesaId}/activo")
    public ResponseEntity<Pedido> obtenerActivoPorMesa(@PathVariable Long mesaId) {
        Pedido activo = pedidoService.obtenerActivoPorMesa(mesaId);
        if (activo == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activo);
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(@Valid @RequestBody Pedido pedido) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crear(pedido));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizar(@PathVariable Long id, @Valid @RequestBody Pedido pedido) {
        return ResponseEntity.ok(pedidoService.actualizar(id, pedido));
    }

    @PostMapping("/{id}/cobrar")
    public ResponseEntity<Pedido> cobrar(@PathVariable Long id, @RequestBody(required = false) Pedido datosCobro) {
        return ResponseEntity.ok(pedidoService.cobrarPedido(id, datosCobro));
    }

    @PostMapping("/cobrar-directo")
    public ResponseEntity<Pedido> cobrarDirecto(@RequestBody Pedido datosCobro) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crearYCobrarDirecto(datosCobro));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Pedido.EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, estado));
    }
}
