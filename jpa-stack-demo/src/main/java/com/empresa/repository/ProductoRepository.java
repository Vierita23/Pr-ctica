package com.empresa.repository;

import com.empresa.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT p FROM Producto p WHERE p.precio >= :precioMin ORDER BY p.precio ASC")
    List<Producto> buscarPorPrecioMinimo(@Param("precioMin") Double precioMin);
}
