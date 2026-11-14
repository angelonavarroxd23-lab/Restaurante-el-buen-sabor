export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface Plato {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  disponible: boolean;
  categoria: Categoria;
  createdAt?: string;
  updatedAt?: string;
}
