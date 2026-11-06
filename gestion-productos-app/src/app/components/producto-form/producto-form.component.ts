import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: false,
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css'],
})
export class ProductoFormComponent {
  nuevoProducto: Producto = {
    nombre: '',
    precio: 0,
    categoria: 'General',
    disponible: true,
  };

  constructor(
    private productoService: ProductoService,
    private router: Router,
  ) {}

  guardar(): void {
    if (this.nuevoProducto.nombre.trim() !== '') {
      this.productoService.agregarProducto(this.nuevoProducto).subscribe(() => {
        this.router.navigate(['/productos']);
      });
    }
  }
}
