package com.empresa.controller;

import com.empresa.ejb.UsuarioServiceEJB;
import com.empresa.dto.UsuarioDTO;
import jakarta.ejb.EJB;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/app")
public class MainController extends HttpServlet {

    // Inyección de Dependencias. El contenedor inyecta el EJB automáticamente.
    @EJB
    private UsuarioServiceEJB usuarioService;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Llama al EJB (Capa de Negocio)
        List<UsuarioDTO> lista = usuarioService.procesarUsuarios();

        // 2. Envía los datos a la Vista (MVC)
        request.setAttribute("usuarios", lista);
        request.getRequestDispatcher("/vista.jsp").forward(request, response);
    }
}
