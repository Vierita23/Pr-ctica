<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.empresa.dto.UsuarioDTO" %>
<html>
<head><title>Arquitectura Empresarial con EJB</title></head>
<body style="font-family: Arial;">
<h2>Lista procesada por un EJB Stateless</h2>
<table border="1" cellpadding="8" style="border-collapse: collapse;">
    <tr style="background-color: #19de3a; color: white;">
        <th>Nombre</th>
        <th>Rol Asignado</th>
    </tr>
    <%
        List<UsuarioDTO> usuarios = (List<UsuarioDTO>) request.getAttribute("usuarios");
        if (usuarios != null) {
            for (UsuarioDTO u : usuarios) {
    %>
    <tr>
        <td><%= u.getNombre() %></td>
        <td><%= u.getRol() %></td>
    </tr>
    <%
            }
        }
    %>
</table>
</body>
</html>
