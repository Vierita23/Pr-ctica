import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Empleado } from '../models/empleado.model';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private empleados: Empleado[] = [
    { id: 1, nombre: 'Ana Gómez', cargo: 'Desarrolladora Senior', departamento: 'Tecnología', salario: 3500 },
    { id: 2, nombre: 'Carlos Ruiz', cargo: 'Analista de Datos', departamento: 'Sistemas', salario: 2800 },
    { id: 3, nombre: 'María Fernández', cargo: 'Diseñadora UX/UI', departamento: 'Diseño', salario: 2600 },
  ];

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return of(this.empleados);
  }

  agregarEmpleado(nuevo: Empleado): Observable<Empleado> {
    nuevo.id = this.empleados.length + 1;
    this.empleados.push(nuevo);
    return of(nuevo);
  }

  eliminarEmpleado(id: number): Observable<boolean> {
    this.empleados = this.empleados.filter((empleado) => empleado.id !== id);
    return of(true);
  }
}
