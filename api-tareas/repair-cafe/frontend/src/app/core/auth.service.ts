import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: 'administrador' | 'usuario' | 'experto';
  expertoId: number | null;
}

interface Sesion {
  token: string;
  usuario: UsuarioSesion;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly api = 'http://127.0.0.1:3000/api';
  private sesion = signal<UsuarioSesion | null>(this.leer());
  readonly usuario = this.sesion.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(correo: string, password: string) {
    return this.http.post<Sesion>(`${this.api}/auth/login`, { correo, password }).pipe(
      tap((sesion) => this.guardar(sesion)),
    );
  }

  registro(datos: object) {
    return this.http.post<Sesion>(`${this.api}/auth/registro`, datos).pipe(
      tap((sesion) => this.guardar(sesion)),
    );
  }

  salir(): void {
    localStorage.removeItem('repaircafe-token');
    localStorage.removeItem('repaircafe-sesion');
    this.sesion.set(null);
    void this.router.navigate(['/login']);
  }

  private guardar(sesion: Sesion): void {
    localStorage.setItem('repaircafe-token', sesion.token);
    localStorage.setItem('repaircafe-sesion', JSON.stringify(sesion.usuario));
    this.sesion.set(sesion.usuario);
  }

  private leer(): UsuarioSesion | null {
    const texto = localStorage.getItem('repaircafe-sesion');
    return texto ? (JSON.parse(texto) as UsuarioSesion) : null;
  }
}
