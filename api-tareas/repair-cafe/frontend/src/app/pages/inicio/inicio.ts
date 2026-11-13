import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

interface Resumen {
  usuarios: number;
  eventos: number;
  pendientes: number;
  reparadas: number;
  expertos: number;
  porcentajeExito: number;
  porEstado: { estado: string; total: number }[];
}

@Component({
  selector: 'app-inicio',
  imports: [DatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit {
  resumen: Resumen | null = null;
  eventos: { nombre: string; fecha: string; ubicacion: string; hora_inicio: string }[] = [];

  constructor(
    readonly auth: AuthService,
    private http: HttpClient,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.auth.usuario()?.rol === 'administrador') {
      this.http.get<Resumen>(`${this.auth.api}/dashboard`).subscribe((datos) => {
        this.resumen = datos;
        this.cambios.detectChanges();
      });
    }
    this.http.get<InicioComponent['eventos']>(`${this.auth.api}/eventos`).subscribe((datos) => {
      this.eventos = datos;
      this.cambios.detectChanges();
    });
  }

  hora(valor: string): string {
    return valor.slice(0, 5);
  }
}
