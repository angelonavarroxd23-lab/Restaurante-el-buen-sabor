package com.restaurante.plato;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlatoRepository extends JpaRepository<Plato, Long> {

    List<Plato> findByCategoriaId(Long categoriaId);

    List<Plato> findByDisponibleTrue();

    @Query("SELECT p FROM Plato p WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Plato> buscarPorNombre(@Param("termino") String termino);
}
