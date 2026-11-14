package com.restaurante.plato;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/platos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PlatoController {

    private final PlatoService platoService;

    @GetMapping
    public ResponseEntity<List<Plato>> index() {
        return ResponseEntity.ok(platoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plato> show(@PathVariable Long id) {
        return ResponseEntity.ok(platoService.obtenerPorId(id));
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<Plato>> byCategoria(@PathVariable Long id) {
        return ResponseEntity.ok(platoService.listarPorCategoria(id));
    }

    @PostMapping
    public ResponseEntity<Plato> create(@Valid @RequestBody Plato plato) {
        Plato nuevo = platoService.crear(plato);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plato> update(@PathVariable Long id, @Valid @RequestBody Plato plato) {
        return ResponseEntity.ok(platoService.actualizar(id, plato));
    }

    @PatchMapping("/{id}/disponibilidad")
    public ResponseEntity<Plato> toggleDisponibilidad(@PathVariable Long id, @RequestParam Boolean disponible) {
        return ResponseEntity.ok(platoService.cambiarDisponibilidad(id, disponible));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        platoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
