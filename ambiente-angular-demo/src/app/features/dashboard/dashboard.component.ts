import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  titulo: string = 'Panel de Control del Ambiente Angular';
  modulos: string[] = ['Core Module', 'Shared Module', 'Feature Modules', 'Environments'];
  entorno: string = environment.nombreEntorno;
  apiUrl: string = environment.apiUrl;
}
