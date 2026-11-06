package com.empresa.service;

import com.empresa.entity.Categoria;
import com.empresa.entity.Producto;
import com.empresa.repository.CategoriaRepository;
import com.empresa.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Transactional
    public Producto guardar(Producto producto) {
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(producto.getCategoria().getId())
                    .orElseThrow(() -> new IllegalArgumentException("No existe la categoría " + producto.getCategoria().getId()));
            producto.setCategoria(categoria);
        }
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarPorPrecioMinimo(Double precioMin) {
        return productoRepository.buscarPorPrecioMinimo(precioMin);
    }
}
