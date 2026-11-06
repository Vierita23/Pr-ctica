package com.example.jakarta;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/saludo")
public class SaludoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("text/html;charset=UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Proyecto Jakarta EE - Saludo</title>");
            out.println("<style>");
            out.println("body { font-family: Arial, sans-serif; background-color: #f4f4f9; text-align: center; margin-top: 50px; }");
            out.println(".card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: inline-block; }");
            out.println("h1 { color: #007bb6; }");
            out.println("p { color: #333; font-size: 18px; }");
            out.println("</style>");
            out.println("</head>");
            out.println("<body>");
            out.println("<div class='card'>");
            out.println("<h1>¡Hola desde Jakarta EE 10!</h1>");
            out.println("<p>El servidor Apache Tomcat y el proyecto Maven están funcionando correctamente.</p>");
            out.println("</div>");
            out.println("</body>");
            out.println("</html>");
        }
    }
}
