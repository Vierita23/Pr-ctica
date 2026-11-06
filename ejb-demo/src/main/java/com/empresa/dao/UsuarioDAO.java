package com.empresa.dao;

import com.empresa.dto.UsuarioDTO;
import java.util.Arrays;
import java.util.List;

public class UsuarioDAO {
    public List<UsuarioDTO> obtenerTodos() {
        // Simulando un 'SELECT * FROM Usuarios' en SQL
        return Arrays.asList(
                new UsuarioDTO("Esteban", "Administrador"),
                new UsuarioDTO("Carlos", "Usuario Final")
        );
    }
}
