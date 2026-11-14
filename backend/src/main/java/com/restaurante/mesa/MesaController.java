package com.restaurante.mesa;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public ResponseEntity<List<Mesa>> listar(@RequestParam(required = false) Mesa.EstadoMesa estado) {
        if (estado != null) {
            return ResponseEntity.ok(mesaService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(mesaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mesa> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Mesa> crear(@Valid @RequestBody Mesa mesa) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.crear(mesa));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mesa> actualizar(@PathVariable Long id, @Valid @RequestBody Mesa mesa) {
        return ResponseEntity.ok(mesaService.actualizar(id, mesa));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Mesa> cambiarEstado(@PathVariable Long id, @RequestParam Mesa.EstadoMesa estado) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mesaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
