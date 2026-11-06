<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Gestión de Empleados - JSP &amp; JSTL</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 30px; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        th { background-color: #0284c7; color: white; }
        .btn { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        input { padding: 8px 10px; margin: 6px 8px 6px 0; border: 1px solid #cbd5e1; border-radius: 6px; }
        a { color: #0284c7; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Listado de Empleados (Vista JSP + JSTL + EL)</h2>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Cargo</th>
                    <th>Salario</th>
                </tr>
            </thead>
            <tbody>
                <!-- Uso de JSTL y Expression Language sin código Java puro -->
                <c:forEach var="emp" items="${listaEmpleados}">
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.nombre}</td>
                        <td>${emp.cargo}</td>
                        <td>$${emp.salario}</td>
                    </tr>
                </c:forEach>
            </tbody>
        </table>

        <h3 style="margin-top: 30px;">Agregar Nuevo Empleado</h3>
        <form action="${pageContext.request.contextPath}/empleados" method="post">
            <input type="text" name="nombre" placeholder="Nombre completo" required>
            <input type="text" name="cargo" placeholder="Cargo" required>
            <input type="number" step="0.01" name="salario" placeholder="Salario" required>
            <button type="submit" class="btn">Guardar Empleado</button>
        </form>

        <p><a href="${pageContext.request.contextPath}/empleados_jsf.xhtml">Ver la misma lista con JSF / Facelets</a></p>
    </div>
</body>
</html>
