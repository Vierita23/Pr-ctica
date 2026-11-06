package com.empresa.ejb;

import com.empresa.dao.UsuarioDAO;
import com.empresa.dto.UsuarioDTO;
import jakarta.ejb.Stateless;
import java.util.List;

@Stateless
public class UsuarioServiceEJB {
    public List<UsuarioDTO> procesarUsuarios() {
        // Aquí irían auditorías, firmas electrónicas, cálculos, etc.
        UsuarioDAO dao = new UsuarioDAO();
        return dao.obtenerTodos();
    }
}
