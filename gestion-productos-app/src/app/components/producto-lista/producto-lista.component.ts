import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-lista',
  standalone: false,
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.css'],
})
export class ProductoListaComponent implements OnInit {
  titulo = 'Listado de Productos en Inventario';
  productos: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe((datos) => {
      this.productos = datos;
    });
  }

  borrar(id: number | undefined): void {
    if (id) {
      this.productoService.eliminarProducto(id).subscribe(() => {
        this.cargarProductos();
      });
    }
  }
}
