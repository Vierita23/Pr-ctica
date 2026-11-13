package com.empresa.controller;

import com.empresa.entity.Tarea;
import com.empresa.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    @Autowired
    private TareaService tareaService;

    @GetMapping
    public List<Tarea> obtenerTodas() {
        return tareaService.obtenerTodas();
    }

    @PostMapping
    public Tarea guardar(@RequestBody Tarea tarea) {
        return tareaService.guardar(tarea);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerPorId(@PathVariable Long id) {
        return tareaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (tareaService.obtenerPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        tareaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
