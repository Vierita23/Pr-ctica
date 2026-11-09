import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { App } from './app.component';
import { EmpleadoListaComponent } from './components/empleado-lista/empleado-lista.component';
import { EmpleadoFormComponent } from './components/empleado-form/empleado-form.component';

@NgModule({
  declarations: [App, EmpleadoListaComponent, EmpleadoFormComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
