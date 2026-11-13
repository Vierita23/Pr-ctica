import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ticket-nuevo',
  imports: [FormsModule],
  templateUrl: './ticket-nuevo.html',
})
export class TicketNuevoComponent implements OnInit {
  nombre = '';
  categoria = '';
  marca = '';
  modelo = '';
  problema = '';
  eventoId = 0;
  foto: File | null = null;
  categorias: { id: number; nombre: string }[] = [];
  eventos: { id: number; nombre: string }[] = [];
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.http.get<{ id: number; nombre: string }[]>(`${this.auth.api}/especialidades`).subscribe((datos) => {
      this.categorias = datos;
      this.categoria = datos[0]?.nombre ?? '';
      this.cambios.detectChanges();
    });
    this.http.get<{ id: number; nombre: string }[]>(`${this.auth.api}/eventos`).subscribe((datos) => {
      this.eventos = datos;
      this.eventoId = datos[0]?.id ?? 0;
      this.cambios.detectChanges();
    });
  }

  elegirFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.foto = input.files?.[0] ?? null;
  }

  enviar(): void {
    this.error = '';
    if (!this.nombre.trim() || !this.marca.trim() || !this.modelo.trim() || this.problema.trim().length < 5 || !this.eventoId) {
      this.error = 'Completa el aparato, la marca, el modelo, el problema y el evento.';
      return;
    }
    const datos = new FormData();
    datos.set('nombre', this.nombre);
    datos.set('categoria', this.categoria);
    datos.set('marca', this.marca);
    datos.set('modelo', this.modelo);
    datos.set('problema', this.problema);
    datos.set('eventoId', String(this.eventoId));
    if (this.foto) {
      datos.set('foto', this.foto);
    }
    this.http.post(`${this.auth.api}/tickets`, datos).subscribe({
      next: () => void this.router.navigate(['/tickets']),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo crear el ticket.';
        this.cambios.detectChanges();
      },
    });
  }
}
