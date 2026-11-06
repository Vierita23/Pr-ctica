package com.empresa.service;

import com.empresa.entity.Categoria;
import com.empresa.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional
    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }
}
