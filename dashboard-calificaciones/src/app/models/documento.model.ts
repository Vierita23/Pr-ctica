export interface FilaCalificacion {
  etiqueta: string;
  notas: number[];
  promedio: number;
  formula: string;
}

export interface DocumentoPdf {
  id: string;
  nombre: string;
  paginas: number;
  texto: string;
  filas: FilaCalificacion[];
  promedioGeneral: number | null;
  notaMax: number | null;
  notaMin: number | null;
}
