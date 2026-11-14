package com.restaurante.plato;

import com.restaurante.categoria.Categoria;
import com.restaurante.categoria.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatoService {

    private final PlatoRepository platoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Plato> listarTodos() {
        return platoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Plato> listarPorCategoria(Long categoriaId) {
        return platoRepository.findByCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public Plato obtenerPorId(Long id) {
        return platoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado con ID: " + id));
    }

    @Transactional
    public Plato crear(Plato plato) {
        if (plato.getCategoria() != null && plato.getCategoria().getId() != null) {
            Categoria cat = categoriaRepository.findById(plato.getCategoria().getId())
                    .orElse(plato.getCategoria());
            plato.setCategoria(cat);
        }
        return platoRepository.save(plato);
    }

    @Transactional
    public Plato actualizar(Long id, Plato datos) {
        Plato existente = obtenerPorId(id);
        existente.setNombre(datos.getNombre());
        existente.setDescripcion(datos.getDescripcion());
        existente.setPrecio(datos.getPrecio());
        existente.setImagenUrl(datos.getImagenUrl());
        existente.setDisponible(datos.getDisponible());
        if (datos.getCategoria() != null && datos.getCategoria().getId() != null) {
            Categoria cat = categoriaRepository.findById(datos.getCategoria().getId())
                    .orElse(datos.getCategoria());
            existente.setCategoria(cat);
        }
        return platoRepository.save(existente);
    }

    @Transactional
    public Plato cambiarDisponibilidad(Long id, Boolean disponible) {
        Plato existente = obtenerPorId(id);
        existente.setDisponible(disponible);
        return platoRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Plato existente = obtenerPorId(id);
        platoRepository.delete(existente);
    }
}
