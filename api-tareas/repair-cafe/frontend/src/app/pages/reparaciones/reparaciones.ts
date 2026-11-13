import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

interface Ticket {
  id: number;
  codigo: string;
  aparato: string;
  problema: string;
  estado: string;
  asignacion_id: number;
  asignacion_estado: string;
}

@Component({
  selector: 'app-reparaciones',
  imports: [FormsModule],
  templateUrl: './reparaciones.html',
})
export class ReparacionesComponent implements OnInit {
  tickets: Ticket[] = [];
  estado = 'En reparación';
  observacion = '';
  resultado = '';
  disponible = true;
  cupoMaximo = 2;
  error = '';
  mensaje = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.http.get<Ticket[]>(`${this.auth.api}/tickets`).subscribe((datos) => {
      this.tickets = datos;
      this.cambios.detectChanges();
    });
  }

  responder(ticket: Ticket, decision: 'aceptada' | 'rechazada'): void {
    this.http.post(`${this.auth.api}/asignaciones/${ticket.asignacion_id}/responder`, {
      decision,
      observacion: this.observacion,
    }).subscribe({
      next: () => {
        this.mensaje = decision === 'aceptada' ? 'Reparación aceptada.' : 'Reparación rechazada.';
        this.cargar();
        this.cambios.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo responder.';
        this.cambios.detectChanges();
      },
    });
  }

  actualizar(ticket: Ticket): void {
    this.http.patch(`${this.auth.api}/tickets/${ticket.id}`, {
      estado: this.estado,
      observacion: this.observacion,
      resultado: this.resultado,
    }).subscribe({
      next: () => {
        this.mensaje = 'Estado actualizado.';
        this.cargar();
        this.cambios.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo actualizar.';
        this.cambios.detectChanges();
      },
    });
  }

  guardarCupo(): void {
    this.http.patch(`${this.auth.api}/expertos/me`, {
      disponible: this.disponible,
      cupoMaximo: Number(this.cupoMaximo),
    }).subscribe({
      next: () => {
        this.mensaje = 'Disponibilidad guardada.';
        this.cambios.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo guardar.';
        this.cambios.detectChanges();
      },
    });
  }
}
