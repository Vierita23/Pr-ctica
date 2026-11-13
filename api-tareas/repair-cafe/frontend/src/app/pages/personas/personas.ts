import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-personas',
  imports: [DatePipe],
  templateUrl: './personas.html',
})
export class PersonasComponent implements OnInit {
  usuarios: { id: number; nombre: string; correo: string; rol: string; creado_en: string }[] = [];
  expertos: { id: number; nombre: string; disponible: boolean; cupo_maximo: number; carga: number; especialidades: string }[] = [];
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.http.get<PersonasComponent['usuarios']>(`${this.auth.api}/usuarios`).subscribe((datos) => {
      this.usuarios = datos;
      this.cambios.detectChanges();
    });
    this.http.get<PersonasComponent['expertos']>(`${this.auth.api}/expertos`).subscribe((datos) => {
      this.expertos = datos;
      this.cambios.detectChanges();
    });
  }

  eliminar(id: number): void {
    this.http.delete(`${this.auth.api}/usuarios/${id}`).subscribe({
      next: () => this.cargar(),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo eliminar.';
        this.cambios.detectChanges();
      },
    });
  }
}
