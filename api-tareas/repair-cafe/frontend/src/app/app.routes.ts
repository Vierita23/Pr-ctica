import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { ShellComponent } from './layout/shell';
import { InicioComponent } from './pages/inicio/inicio';
import { EventosComponent } from './pages/eventos/eventos';
import { TicketsComponent } from './pages/tickets/tickets';
import { TicketNuevoComponent } from './pages/ticket-nuevo/ticket-nuevo';
import { ReparacionesComponent } from './pages/reparaciones/reparaciones';
import { PersonasComponent } from './pages/personas/personas';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: InicioComponent },
      { path: 'eventos', component: EventosComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'tickets/nuevo', component: TicketNuevoComponent },
      { path: 'reparaciones', component: ReparacionesComponent },
      { path: 'personas', component: PersonasComponent },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
