import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root',
})
export class TareaService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/todos';

  private tareasMemoria: Tarea[] = [
    { id: 1, titulo: 'Diseñar Arquitectura SPA', descripcion: 'Definir rutas y servicios', completada: true, prioridad: 'Alta' },
    { id: 2, titulo: 'Integrar HttpClient', descripcion: 'Conectar con API REST y RxJS', completada: false, prioridad: 'Alta' },
  ];

  constructor(private http: HttpClient) {}

  getTareas(): Observable<Tarea[]> {
    return this.http.get(this.apiUrl).pipe(
      retry(1),
      map(() => this.tareasMemoria),
      catchError((error: HttpErrorResponse) => this.manejarError(error)),
    );
  }

  agregarTarea(tarea: Tarea): Observable<Tarea> {
    tarea.id = this.tareasMemoria.length + 1;
    this.tareasMemoria.push(tarea);
    return of(tarea);
  }

  eliminarTarea(id: number): Observable<boolean> {
    this.tareasMemoria = this.tareasMemoria.filter((tarea) => tarea.id !== id);
    return of(true);
  }

  private manejarError(error: HttpErrorResponse): Observable<Tarea[]> {
    console.error('Error en la comunicación HTTP:', error.message);
    return of(this.tareasMemoria);
  }
}
