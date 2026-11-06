import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { App } from './app.component';
import { ProductoListaComponent } from './components/producto-lista/producto-lista.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';

@NgModule({
  declarations: [App, ProductoListaComponent, ProductoFormComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
