package com.restaurante.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }

    @Transactional
    public Usuario crear(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya se encuentra registrado: " + usuario.getEmail());
        }
        if (usuario.getPassword() != null && !usuario.getPassword().startsWith("$2a$")) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Long id, Usuario datos) {
        Usuario existente = obtenerPorId(id);
        existente.setNombre(datos.getNombre());
        existente.setApellido(datos.getApellido());
        existente.setEmail(datos.getEmail());
        existente.setRol(datos.getRol());
        existente.setActivo(datos.getActivo());

        if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
            if (!datos.getPassword().startsWith("$2a$")) {
                existente.setPassword(passwordEncoder.encode(datos.getPassword()));
            } else {
                existente.setPassword(datos.getPassword());
            }
        }
        return usuarioRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Usuario existente = obtenerPorId(id);
        usuarioRepository.delete(existente);
    }
}
