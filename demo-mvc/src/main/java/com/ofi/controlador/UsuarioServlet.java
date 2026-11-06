package com.ofi.controlador;

import com.ofi.dao.UsuarioDAO;
import com.ofi.modelo.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/usuarios")
public class UsuarioServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 1. Hablar con el Modelo (DAO) para obtener datos
        UsuarioDAO dao = new UsuarioDAO();
        List<Usuario> listaUsuarios = dao.obtenerUsuarios();

        // 2. Guardar los datos en el Request para enviarlos a la pantalla
        request.setAttribute("lista", listaUsuarios);

        // 3. Redirigir el tráfico hacia la Vista (el archivo JSP)
        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }
}
