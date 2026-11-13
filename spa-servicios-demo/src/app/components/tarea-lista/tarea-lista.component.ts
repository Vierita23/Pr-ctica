import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarea } from '../../models/tarea.model';
import { TareaService } from '../../services/tarea.service';

@Component({
  selector: 'app-tarea-lista',
  standalone: false,
  templateUrl: './tarea-lista.component.html',
  styleUrls: ['./tarea-lista.component.css'],
})
export class TareaListaComponent implements OnInit {
  tareas$!: Observable<Tarea[]>;

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.tareas$ = this.tareaService.getTareas();
  }

  eliminar(id: number | undefined): void {
    if (id) {
      this.tareaService.eliminarTarea(id).subscribe(() => {
        this.cargarTareas();
      });
    }
  }
}
