import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

interface Ticket {
  id: number;
  codigo: string;
  estado: string;
  aparato: string;
  categoria: string;
  marca: string;
  modelo: string;
  problema: string;
  evento: string;
  dueno: string;
  experto: string | null;
  asignacion_estado: string | null;
  historial?: { estado_nuevo: string; nota: string; autor: string }[];
}
interface Experto { id: number; nombre: string; especialidades: string; }

@Component({
  selector: 'app-tickets',
  imports: [FormsModule],
  templateUrl: './tickets.html',
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  expertos: Experto[] = [];
  busqueda = '';
  estado = '';
  expertoId = 0;
  error = '';
  abierto: Ticket | null = null;

  constructor(
    readonly auth: AuthService,
    private http: HttpClient,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
    if (this.auth.usuario()?.rol === 'administrador') {
      this.http.get<Experto[]>(`${this.auth.api}/expertos`).subscribe((datos) => {
        this.expertos = datos;
        this.expertoId = datos[0]?.id ?? 0;
        this.cambios.detectChanges();
      });
    }
  }

  get visibles(): Ticket[] {
    const texto = this.busqueda.toLowerCase();
    return this.tickets.filter((ticket) => {
      const coincide = `${ticket.codigo} ${ticket.aparato} ${ticket.dueno} ${ticket.categoria}`.toLowerCase().includes(texto);
      return coincide && (!this.estado || ticket.estado === this.estado);
    });
  }

  cargar(): void {
    this.http.get<Ticket[]>(`${this.auth.api}/tickets`).subscribe((datos) => {
      this.tickets = datos;
      this.cambios.detectChanges();
    });
  }

  ver(ticket: Ticket): void {
    this.http.get<Ticket>(`${this.auth.api}/tickets/${ticket.id}`).subscribe((datos) => {
      this.abierto = datos;
      this.cambios.detectChanges();
    });
  }

  emparejar(ticket: Ticket): void {
    this.http.post(`${this.auth.api}/tickets/${ticket.id}/emparejar`, {}).subscribe({
      next: () => this.cargar(),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo emparejar.';
        this.cambios.detectChanges();
      },
    });
  }

  asignar(ticket: Ticket): void {
    this.http.post(`${this.auth.api}/tickets/${ticket.id}/asignar`, { expertoId: Number(this.expertoId) }).subscribe({
      next: () => this.cargar(),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo asignar.';
        this.cambios.detectChanges();
      },
    });
  }
}
