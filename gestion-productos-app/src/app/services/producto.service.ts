import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private productos: Producto[] = [
    { id: 1, nombre: 'Laptop Gamer', precio: 1200, categoria: 'Tecnología', disponible: true },
    { id: 2, nombre: 'Teclado Mecánico', precio: 85, categoria: 'Accesorios', disponible: true },
    { id: 3, nombre: 'Monitor 4K', precio: 350, categoria: 'Tecnología', disponible: false },
  ];

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return of(this.productos);
  }

  agregarProducto(producto: Producto): Observable<Producto> {
    producto.id = this.productos.length + 1;
    this.productos.push(producto);
    return of(producto);
  }

  eliminarProducto(id: number): Observable<boolean> {
    this.productos = this.productos.filter((p) => p.id !== id);
    return of(true);
  }
}
