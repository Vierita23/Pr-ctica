package com.ofi.dao;

import com.ofi.modelo.Usuario;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {
    // Simula una consulta a base de datos
    public List<Usuario> obtenerUsuarios() {
        List<Usuario> lista = new ArrayList<>();
        lista.add(new Usuario(1, "Anita Pérez"));
        lista.add(new Usuario(2, "Carlos Gómez"));
        lista.add(new Usuario(4, "María Lugue"));
        return lista;
    }
}
