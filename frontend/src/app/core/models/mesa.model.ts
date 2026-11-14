export type EstadoMesa = 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA';

export interface Mesa {
  id?: number;
  numero: number;
  capacidad: number;
  ubicacion?: string;
  estado: EstadoMesa;
}
