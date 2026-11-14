package com.restaurante.mesa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;

    @Transactional(readOnly = true)
    public List<Mesa> listarTodas() {
        return mesaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Mesa> listarPorEstado(Mesa.EstadoMesa estado) {
        return mesaRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public Mesa obtenerPorId(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada con ID: " + id));
    }

    @Transactional
    public Mesa crear(Mesa mesa) {
        if (mesaRepository.existsByNumero(mesa.getNumero())) {
            throw new RuntimeException("Ya existe una mesa con el número: " + mesa.getNumero());
        }
        return mesaRepository.save(mesa);
    }

    @Transactional
    public Mesa actualizar(Long id, Mesa datos) {
        Mesa existente = obtenerPorId(id);
        existente.setNumero(datos.getNumero());
        existente.setCapacidad(datos.getCapacidad());
        existente.setUbicacion(datos.getUbicacion());
        existente.setEstado(datos.getEstado());
        return mesaRepository.save(existente);
    }

    @Transactional
    public Mesa cambiarEstado(Long id, Mesa.EstadoMesa nuevoEstado) {
        Mesa existente = obtenerPorId(id);
        existente.setEstado(nuevoEstado);
        return mesaRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Mesa existente = obtenerPorId(id);
        mesaRepository.delete(existente);
    }
}
