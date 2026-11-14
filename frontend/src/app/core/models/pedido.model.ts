import { Mesa } from './mesa.model';
import { Usuario } from './usuario.model';
import { Plato } from './plato.model';

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';

export interface DetallePedido {
  id?: number;
  plato: Partial<Plato> & { id?: number; nombre?: string; precio?: number };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export interface Pedido {
  id?: number;
  mesa: Partial<Mesa> & { id?: number; numero?: number; ubicacion?: string };
  mesero?: Partial<Usuario>;
  estado: EstadoPedido;
  total: number;
  observaciones?: string;
  tipoComprobante?: string;
  serieNumero?: string;
  clienteDocumento?: string;
  metodoPago?: string;
  fechaCreacion?: string;
  fechaCierre?: string;
  detalles: DetallePedido[];
}
