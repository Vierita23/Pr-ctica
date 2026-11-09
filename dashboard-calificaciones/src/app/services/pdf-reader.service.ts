import { Injectable } from '@angular/core';
import { DocumentoPdf, FilaCalificacion } from '../models/documento.model';

interface LectorPdf {
  getDocument: (params: { data: Uint8Array; standardFontDataUrl: string }) => {
    promise: Promise<{
      numPages: number;
      getPage: (numero: number) => Promise<{
        getTextContent: () => Promise<{ items: TextoPdf[] }>;
      }>;
    }>;
  };
  GlobalWorkerOptions: { workerSrc: string };
}

interface TextoPdf {
  str: string;
  transform: number[];
}

@Injectable({
  providedIn: 'root',
})
export class PdfReaderService {
  async leer(file: File): Promise<DocumentoPdf> {
    const lector = await this.lector();
    const datos = new Uint8Array(await file.arrayBuffer());
    const pdf = await lector.getDocument({
      data: datos,
      standardFontDataUrl: new URL('standard_fonts/', document.baseURI).href,
    }).promise;
    const lineas: string[] = [];

    for (let numero = 1; numero <= pdf.numPages; numero++) {
      const pagina = await pdf.getPage(numero);
      const contenido = await pagina.getTextContent();
      lineas.push(...this.agruparLineas(contenido.items as TextoPdf[]));
    }

    const texto = lineas.join('\n');
    const filas = this.filasDesdeTexto(texto);
    const notas = filas.flatMap((fila) => fila.notas);

    return {
      id: crypto.randomUUID(),
      nombre: file.name,
      paginas: pdf.numPages,
      texto,
      filas,
      promedioGeneral: notas.length ? this.promedio(notas) : null,
      notaMax: notas.length ? Math.max(...notas) : null,
      notaMin: notas.length ? Math.min(...notas) : null,
    };
  }

  private async lector(): Promise<LectorPdf> {
    const url = new URL('pdfjs/pdf.min.mjs', document.baseURI).href;
    // Vite rewrites import() and that breaks the PDF worker. A native import keeps the file untouched.
    const importar = new Function('u', 'return import(u)') as (u: string) => Promise<LectorPdf>;
    const pdfjs = await importar(url);
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs/pdf.worker.min.mjs', document.baseURI).href;
    return pdfjs;
  }

  private agruparLineas(items: TextoPdf[]): string[] {
    const grupos: { y: number; partes: { x: number; str: string }[] }[] = [];

    for (const item of items) {
      if (!item.str?.trim()) {
        continue;
      }
      const x = item.transform[4];
      const y = item.transform[5];
      let grupo = grupos.find((actual) => Math.abs(actual.y - y) < 4);
      if (!grupo) {
        grupo = { y, partes: [] };
        grupos.push(grupo);
      }
      grupo.partes.push({ x, str: item.str });
    }

    return grupos
      .sort((a, b) => b.y - a.y)
      .map((grupo) =>
        grupo.partes
          .sort((a, b) => a.x - b.x)
          .map((parte) => parte.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter((linea) => linea.length > 0);
  }

  private filasDesdeTexto(texto: string): FilaCalificacion[] {
    const filas: FilaCalificacion[] = [];

    for (const linea of texto.split('\n')) {
      const tokens = linea.trim().split(/\s+/).filter(Boolean);
      const numeros: number[] = [];
      const palabras: string[] = [];

      for (const token of tokens) {
        const normalizado = token.replace(',', '.');
        if (/^-?\d+(\.\d+)?$/.test(normalizado)) {
          numeros.push(Number(normalizado));
        } else {
          palabras.push(token);
        }
      }

      if (numeros.length < 2) {
        continue;
      }

      const esEncabezado =
        /parcial|estudiante|nombre|materia|promedio|curso|reporte|calificacion/i.test(linea) &&
        numeros.every((numero) => Number.isInteger(numero) && numero >= 0 && numero <= 12);
      if (esEncabezado) {
        continue;
      }

      const etiqueta = palabras.length ? palabras.join(' ') : String(numeros[0]);
      const notas = palabras.length ? numeros : numeros.slice(1);
      if (!notas.length) {
        continue;
      }

      const promedio = this.promedio(notas);
      filas.push({
        etiqueta,
        notas,
        promedio,
        formula: `(${notas.join(' + ')}) / ${notas.length} = ${promedio.toFixed(2)}`,
      });
    }

    return filas;
  }

  private promedio(notas: number[]): number {
    return notas.reduce((total, nota) => total + nota, 0) / notas.length;
  }
}
