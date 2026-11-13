import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Arranca la aplicación inyectando el componente principal
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
