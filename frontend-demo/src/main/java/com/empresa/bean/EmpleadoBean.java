package com.empresa.bean;

import com.empresa.model.Empleado;
import com.empresa.service.EmpleadoService;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;

import java.io.Serializable;
import java.util.List;

@Named("empleadoBean")
@RequestScoped
public class EmpleadoBean implements Serializable {

    private List<Empleado> lista;
    private Empleado nuevoEmpleado = new Empleado();
    private final EmpleadoService service = new EmpleadoService();

    @PostConstruct
    public void init() {
        lista = service.obtenerTodos();
    }

    public List<Empleado> getLista() { return lista; }

    public Empleado getNuevoEmpleado() { return nuevoEmpleado; }

    // Método de acción invocado por el botón de JSF
    public String agregar() {
        service.agregarEmpleado(nuevoEmpleado);
        nuevoEmpleado = new Empleado();
        return "empleados_jsf?faces-redirect=true";
    }
}
