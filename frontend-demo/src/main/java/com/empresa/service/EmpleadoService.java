package com.empresa.service;

import com.empresa.model.Empleado;

import java.util.ArrayList;
import java.util.List;

public class EmpleadoService {

    private static final List<Empleado> baseDatos = new ArrayList<>();

    static {
        baseDatos.add(new Empleado(1, "Laura Martínez", "Arquitecta de Software", 4500.00));
        baseDatos.add(new Empleado(2, "Carlos Mendoza", "Desarrollador Senior Java", 3200.00));
        baseDatos.add(new Empleado(3, "Elena Gómez", "Líder de Proyecto UX/UI", 3800.00));
    }

    public List<Empleado> obtenerTodos() {
        return baseDatos;
    }

    public void agregarEmpleado(Empleado emp) {
        emp.setId(baseDatos.size() + 1);
        baseDatos.add(emp);
    }
}
