<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Portal de Gestión de Empleados</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 40px; }
        .card { background: white; max-width: 640px; padding: 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        a { display: inline-block; margin: 8px 12px 0 0; color: white; background: #0284c7; text-decoration: none; padding: 10px 16px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Portal de Gestión de Empleados</h1>
        <p>Misma información, dos formas de construir la capa de presentación.</p>
        <a href="${pageContext.request.contextPath}/empleados">MVC con JSP + JSTL</a>
        <a href="${pageContext.request.contextPath}/empleados_jsf.xhtml">JSF + Facelets</a>
    </div>
</body>
</html>
