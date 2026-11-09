import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { DocumentoPdf } from './models/documento.model';
import { PdfReaderService } from './services/pdf-reader.service';

@Component({
  selector: 'app-root',
  imports: [DecimalPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  documentos = signal<DocumentoPdf[]>([]);
  seleccionado = signal<DocumentoPdf | null>(null);
  leyendo = signal(false);
  error = signal('');

  constructor(private pdfReader: PdfReaderService) {}

  async alElegir(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    if (input.files) {
      await this.procesarArchivos(input.files);
    }
    input.value = '';
  }

  async soltar(evento: DragEvent): Promise<void> {
    evento.preventDefault();
    if (evento.dataTransfer?.files) {
      await this.procesarArchivos(evento.dataTransfer.files);
    }
  }

  async cargarEjemplo(ruta: string, nombre: string): Promise<void> {
    this.error.set('');
    this.leyendo.set(true);
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) {
        throw new Error('No se pudo abrir el ejemplo');
      }
      const archivo = new File([await respuesta.blob()], nombre, { type: 'application/pdf' });
      await this.agregar(archivo);
    } catch {
      this.error.set('No pude leer el PDF de ejemplo.');
    } finally {
      this.leyendo.set(false);
    }
  }

  elegir(documento: DocumentoPdf): void {
    this.seleccionado.set(documento);
  }

  columnas(documento: DocumentoPdf): number[] {
    const cantidad = Math.max(0, ...documento.filas.map((fila) => fila.notas.length));
    return Array.from({ length: cantidad }, (_, indice) => indice);
  }

  escala(documento: DocumentoPdf): number {
    const notas = documento.filas.flatMap((fila) => fila.notas);
    return Math.max(10, ...notas, 0);
  }

  linea(documento: DocumentoPdf): string {
    return documento.filas
      .map((fila, indice) => `${this.cx(indice, documento.filas.length)},${this.cy(fila.promedio, this.escala(documento))}`)
      .join(' ');
  }

  cx(indice: number, total: number): number {
    if (total <= 1) {
      return 320;
    }
    return 56 + (indice * 520) / (total - 1);
  }

  cy(valor: number, maximo: number): number {
    const arriba = 28;
    const abajo = 190;
    return abajo - (valor / maximo) * (abajo - arriba);
  }

  private async procesarArchivos(archivos: FileList): Promise<void> {
    this.error.set('');
    this.leyendo.set(true);
    try {
      for (const archivo of Array.from(archivos)) {
        if (!archivo.name.toLowerCase().endsWith('.pdf')) {
          this.error.set('Solo puedo leer archivos PDF.');
          continue;
        }
        await this.agregar(archivo);
      }
    } catch {
      this.error.set('No pude leer ese PDF. Prueba con un PDF que tenga texto, no una foto escaneada.');
    } finally {
      this.leyendo.set(false);
    }
  }

  private async agregar(archivo: File): Promise<void> {
    const documento = await this.pdfReader.leer(archivo);
    this.documentos.update((lista) => [documento, ...lista]);
    this.seleccionado.set(documento);
  }
}
