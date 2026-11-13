import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  correo = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cambios: ChangeDetectorRef,
  ) {}

  entrar(): void {
    this.error = '';
    if (!this.correo.trim() || !this.password) {
      this.error = 'Escribe el correo y la contraseña.';
      return;
    }
    this.auth.login(this.correo, this.password).subscribe({
      next: () => void this.router.navigate(['/inicio']),
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.mensaje ?? 'No se pudo iniciar sesión.';
        this.cambios.detectChanges();
      },
    });
  }
}
