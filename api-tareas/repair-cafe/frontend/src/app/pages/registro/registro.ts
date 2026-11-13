import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface Especialidad { id: number; nombre: string; }

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent implements OnInit {
  nombre = '';
  correo = '';
  password = '';
  rol = 'usuario';
  cupoMaximo = 3;
  especialidades: Especialidad[] = [];
  elegidas: number[] = [];
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private cambios: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.http.get<Especialidad[]>('http://127.0.0.1:3000/api/especialidades').subscribe({
      next: (lista) => {
        this.especialidades = lista;
        this.cambios.detectChanges();
      },
      error: () => {
        this.error = 'No pude cargar las especialidades.';
        this.cambios.detectChanges();
      },
    });
  }

  cambiarEspecialidad(id: number, marcado: boolean): void {
    this.elegidas = marcado ? [...this.elegidas, id] : this.elegidas.filter((item) => item !== id);
  }

  crear(): void {
    this.error = '';
    if (this.nombre.trim().length < 3 || this.password.length < 6 || !this.correo.includes('@')) {
      this.error = 'Revisa el nombre, el correo y usa al menos 6 caracteres en la contraseña.';
      return;
    }
    this.auth.registro({
      nombre: this.nombre,
      correo: this.correo,
      password: this.password,
      rol: this.rol,
      cupoMaximo: this.cupoMaximo,
      especialidades: this.elegidas,
    }).subscribe({
      next: () => void this.router.navigate(['/inicio']),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo crear la cuenta.';
      },
    });
  }
}
