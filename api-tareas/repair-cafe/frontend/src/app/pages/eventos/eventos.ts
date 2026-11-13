import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
}

@Component({
  selector: 'app-eventos',
  imports: [DatePipe, FormsModule],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];
  nombre = '';
  descripcion = '';
  ubicacion = '';
  fecha = '';
  horaInicio = '09:00';
  horaFin = '13:00';
  capacidad = 10;
  mensaje = '';
  error = '';

  constructor(
    readonly auth: AuthService,
    private http: HttpClient,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.http.get<Evento[]>(`${this.auth.api}/eventos`).subscribe((datos) => {
      this.eventos = datos;
      this.cambios.detectChanges();
    });
  }

  crear(): void {
    this.error = '';
    this.http.post(`${this.auth.api}/eventos`, {
      nombre: this.nombre,
      descripcion: this.descripcion,
      ubicacion: this.ubicacion,
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      capacidad: Number(this.capacidad),
    }).subscribe({
      next: () => {
        this.mensaje = 'Evento creado.';
        this.nombre = '';
        this.descripcion = '';
        this.ubicacion = '';
        this.cargar();
        this.cambios.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo crear el evento.';
        this.cambios.detectChanges();
      },
    });
  }

  eliminar(id: number): void {
    this.http.delete(`${this.auth.api}/eventos/${id}`).subscribe({
      next: () => this.cargar(),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo eliminar.';
        this.cambios.detectChanges();
      },
    });
  }

  hora(valor: string): string {
    return valor.slice(0, 5);
  }
}
