package com.empresa.controller;

import com.empresa.model.Empleado;
import com.empresa.service.EmpleadoService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/empleados")
public class EmpleadoServlet extends HttpServlet {

    private final EmpleadoService service = new EmpleadoService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Obtener datos mediante el Helper / Servicio
        List<Empleado> lista = service.obtenerTodos();

        // 2. Adjuntar los datos al ámbito del Request
        request.setAttribute("listaEmpleados", lista);

        // 3. Despachar el control hacia la Vista JSP
        request.getRequestDispatcher("/empleados.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String nombre = request.getParameter("nombre");
        String cargo = request.getParameter("cargo");
        double salario = Double.parseDouble(request.getParameter("salario"));

        service.agregarEmpleado(new Empleado(0, nombre, cargo, salario));

        // Redirección POST-Redirect-GET para evitar duplicar registros
        response.sendRedirect(request.getContextPath() + "/empleados");
    }
}
