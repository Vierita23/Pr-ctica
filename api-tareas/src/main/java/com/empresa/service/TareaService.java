package com.empresa.service;

import com.empresa.entity.Tarea;
import com.empresa.repository.TareaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    @Autowired
    private TareaRepository tareaRepository;

    @Transactional(readOnly = true)
    public List<Tarea> obtenerTodas() {
        return tareaRepository.findAll();
    }

    @Transactional
    public Tarea guardar(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    @Transactional(readOnly = true)
    public Optional<Tarea> obtenerPorId(Long id) {
        return tareaRepository.findById(id);
    }

    @Transactional
    public void eliminar(Long id) {
        tareaRepository.deleteById(id);
    }
}
