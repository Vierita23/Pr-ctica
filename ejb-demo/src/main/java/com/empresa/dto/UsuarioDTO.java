package com.empresa.dto;

public class UsuarioDTO {
    private String nombre;
    private String rol;

    public UsuarioDTO(String nombre, String rol) {
        this.nombre = nombre;
        this.rol = rol;
    }

    public String getNombre() { return nombre; }
    public String getRol() { return rol; }
}
