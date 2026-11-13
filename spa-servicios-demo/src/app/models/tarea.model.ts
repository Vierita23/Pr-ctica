export interface Tarea {
  id?: number;
  titulo: string;
  descripcion: string;
  completada: boolean;
  prioridad: 'Alta' | 'Media' | 'Baja';
}
