<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.ofi.modelo.Usuario" %>
<html>
<head>
    <title>Lista de Usuarios MVC</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 50%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
    </style>
</head>
<body>
    <h2>Usuarios del Sistema (Patrón MVC)</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
        </tr>
        <%
            // Recuperar la lista que envió el Servlet (Controlador)
            List<Usuario> usuarios = (List<Usuario>) request.getAttribute("lista");
            if (usuarios != null) {
                for (Usuario u : usuarios) {
        %>
        <tr>
            <td><%= u.getId() %></td>
            <td><%= u.getNombre() %></td>
        </tr>
        <%
                }
            } else {
        %>
        <tr><td colspan="2">No hay datos. Ingresa desde /usuarios</td></tr>
        <% } %>
    </table>
</body>
</html>
