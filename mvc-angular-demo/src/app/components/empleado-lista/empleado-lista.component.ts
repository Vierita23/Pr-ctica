import { Component, OnInit } from '@angular/core';
import { Empleado } from '../../models/empleado.model';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-empleado-lista',
  standalone: false,
  templateUrl: './empleado-lista.component.html',
  styleUrls: ['./empleado-lista.component.css'],
})
export class EmpleadoListaComponent implements OnInit {
  titulo = 'Nómina de Empleados de la Empresa';
  listaEmpleados: Empleado[] = [];

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.empleadoService.getEmpleados().subscribe((data) => {
      this.listaEmpleados = data;
    });
  }

  borrarEmpleado(id: number | undefined): void {
    if (id) {
      this.empleadoService.eliminarEmpleado(id).subscribe(() => {
        this.cargarDatos();
      });
    }
  }
}
