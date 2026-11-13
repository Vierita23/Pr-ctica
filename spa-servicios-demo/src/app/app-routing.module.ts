import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TareaListaComponent } from './components/tarea-lista/tarea-lista.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/tareas', pathMatch: 'full' },
  { path: 'tareas', component: TareaListaComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/tareas' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
