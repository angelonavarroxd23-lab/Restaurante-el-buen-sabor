import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../layout/navbar.component';
import { PedidoService } from '../../core/services/pedido.service';
import { Pedido, EstadoPedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Caja, Facturación e Historial de Ventas</h1>
          <p class="text-sm text-slate-500 mt-0.5">Registro auditable de comprobantes emitidos, arqueo de pagos y órdenes en atención (MySQL 8)</p>
        </div>
        <button (click)="cargarPedidos()" 
                class="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3.5 py-2 rounded shadow-sm transition-colors">
          <span class="material-symbols-outlined text-sm">refresh</span>
          <span>Sincronizar Registros</span>
        </button>
      </div>

      <div class="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ventas Cerradas (Auditoría)</div>
          <div class="mt-1 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-slate-900">{{ pedidosPagados.length }}</span>
            <span class="text-xs text-emerald-700 font-medium">Comprobantes</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recaudación Total (Caja)</div>
          <div class="mt-1 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-emerald-700 font-mono">S/ {{ calcularTotalPagado() | number:'1.2-2' }}</span>
            <span class="text-xs text-slate-500 font-mono">IGV: S/ {{ (calcularTotalPagado() - (calcularTotalPagado() / 1.18)) | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cuentas en Atención</div>
          <div class="mt-1 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-blue-800">{{ pedidosEnAtencion.length }}</span>
            <span class="text-xs text-blue-700 font-medium">Mesas ocupadas</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Por Cobrar en Salón</div>
          <div class="mt-1 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-slate-900 font-mono">S/ {{ calcularTotalPorCobrar() | number:'1.2-2' }}</span>
            <span class="text-xs text-amber-700 font-medium">Pendiente</span>
          </div>
        </div>
      </div>

      <div *ngIf="mensajeAviso" 
           class="mt-4 px-4 py-2.5 rounded border bg-blue-50 border-blue-200 text-blue-900 text-xs font-medium flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="material-symbols-outlined text-base text-blue-700">check_circle</span>
          <span>{{ mensajeAviso }}</span>
        </div>
        <button (click)="mensajeAviso = ''" class="text-blue-700 hover:text-blue-900">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div class="mt-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center space-x-1.5 overflow-x-auto">
          <button (click)="estadoFiltro = 'PAGADO'"
                  [class]="estadoFiltro === 'PAGADO' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap">
            Historial de Ventas Cerradas ({{ pedidosPagados.length }})
          </button>
          <button (click)="estadoFiltro = 'ACTIVOS'"
                  [class]="estadoFiltro === 'ACTIVOS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap">
            Cuentas Activas por Cobrar ({{ pedidosEnAtencion.length }})
          </button>
          <button (click)="estadoFiltro = 'TODOS'"
                  [class]="estadoFiltro === 'TODOS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap">
            Auditoría Completa ({{ pedidos.length }})
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative">
            <span class="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2">search</span>
            <input type="text" [(ngModel)]="terminoBusqueda" placeholder="Buscar comprobante, cliente o mesa..."
                   class="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600" />
          </div>
          <select [(ngModel)]="metodoPagoFiltro"
                  class="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-600">
            <option value="TODOS">Todos los medios de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Yape / Plin">Yape / Plin</option>
            <option value="Tarjeta POS">Tarjeta POS</option>
          </select>
        </div>
      </div>

      <div class="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th class="py-3 px-4">Comprobante / Orden</th>
              <th class="py-3 px-4">Fecha / Hora Auditoría</th>
              <th class="py-3 px-4">Mesa y Operador</th>
              <th class="py-3 px-4">Cliente / Documento</th>
              <th class="py-3 px-4">Consumo</th>
              <th class="py-3 px-4 text-center">Medio Pago / Estado</th>
              <th class="py-3 px-4 text-right">Importe Total</th>
              <th class="py-3 px-4 text-right w-40">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let p of pedidosFiltrados" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4">
                <div *ngIf="p.serieNumero" class="font-mono text-xs font-bold text-blue-800">
                  {{ p.serieNumero }}
                </div>
                <div class="text-[11px] font-mono text-slate-500">
                  {{ p.tipoComprobante || 'ORDEN' }} #00{{ p.id }}
                </div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-600 font-mono">
                <div *ngIf="p.fechaCierre" class="font-medium text-slate-800">
                  Cierre: {{ p.fechaCierre | date:'dd/MM/yyyy HH:mm' }}
                </div>
                <div class="text-[11px] text-slate-400">
                  Apertura: {{ p.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900 text-xs">Mesa {{ p.mesa?.numero }}</div>
                <div class="text-[11px] text-slate-500">{{ p.mesa?.ubicacion || 'Salón' }} &bull; {{ p.mesero?.nombre || 'Carlos M.' }}</div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-700">
                {{ p.clienteDocumento || 'Cliente General' }}
              </td>
              <td class="py-3 px-4">
                <div class="text-xs text-slate-800 space-y-0.5">
                  <div *ngFor="let d of p.detalles">
                    <span class="font-mono font-semibold text-blue-800">{{ d.cantidad }}x</span> {{ d.plato?.nombre }}
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <span [class]="obtenerClaseBadge(p.estado)"
                      class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded border">
                  {{ p.estado }}
                </span>
                <div *ngIf="p.metodoPago && p.estado === 'PAGADO'" class="text-[11px] text-slate-600 font-medium mt-0.5">
                  {{ p.metodoPago }}
                </div>
              </td>
              <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">
                S/ {{ p.total | number:'1.2-2' }}
              </td>
              <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button *ngIf="p.estado !== 'PAGADO' && p.estado !== 'CANCELADO'"
                        (click)="abrirModalCobroCaja(p)"
                        class="text-xs bg-blue-700 hover:bg-blue-800 text-white font-medium px-2.5 py-1 rounded transition-colors">
                  Cobrar
                </button>
                <button *ngIf="p.estado !== 'PAGADO' && p.estado !== 'CANCELADO'"
                        (click)="anularPedido(p)"
                        class="text-xs bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-medium px-2.5 py-1 rounded transition-colors">
                  Anular
                </button>
                <button (click)="pedidoDetalle = p"
                        class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                  Comprobante
                </button>
                <button (click)="eliminarPedido(p)"
                        title="Eliminar registro"
                        class="text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium px-2 py-1 rounded transition-colors">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr *ngIf="pedidosFiltrados.length === 0">
              <td colspan="8" class="py-10 text-center text-slate-400 text-sm">
                No se encontraron registros con los criterios seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <div *ngIf="pedidoPorCobrar" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-base font-bold text-slate-900">Cerrar Venta y Emitir Comprobante</h2>
            <p class="text-xs text-slate-500">Orden #{{ pedidoPorCobrar.id }} &bull; Mesa {{ pedidoPorCobrar.mesa?.numero }}</p>
          </div>
          <button (click)="pedidoPorCobrar = null" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tipo de Comprobante</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" (click)="tipoComprobante = 'BOLETA'"
                      [class]="tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold' : 'bg-white border-slate-300 text-slate-700'"
                      class="py-2 px-3 rounded border text-center">
                Boleta de Venta
              </button>
              <button type="button" (click)="tipoComprobante = 'FACTURA'"
                      [class]="tipoComprobante === 'FACTURA' ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold' : 'bg-white border-slate-300 text-slate-700'"
                      class="py-2 px-3 rounded border text-center">
                Factura Electrónica
              </button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">
              {{ tipoComprobante === 'BOLETA' ? 'Cliente / DNI' : 'Razón Social / RUC *' }}
            </label>
            <input type="text" [(ngModel)]="clienteDocumento"
                   class="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Método de Pago</label>
            <select [(ngModel)]="metodoPago" class="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-blue-600">
              <option value="Efectivo">Efectivo (Soles)</option>
              <option value="Yape / Plin">Billetera Digital (Yape / Plin)</option>
              <option value="Tarjeta POS">Tarjeta de Crédito / Débito (POS)</option>
            </select>
          </div>

          <div class="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
            <span>Total a Cobrar:</span>
            <span class="font-mono text-blue-800">S/ {{ pedidoPorCobrar.total | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-200 flex justify-end space-x-2">
          <button (click)="pedidoPorCobrar = null"
                  class="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">
            Cancelar
          </button>
          <button (click)="ejecutarCobroCaja()"
                  class="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm">
            Confirmar Pago y Guardar Venta
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="pedidoDetalle" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-sm p-6 font-sans">
        <div class="text-center border-b border-dashed border-slate-300 pb-3">
          <div class="font-bold text-base text-slate-900">EL BUEN SABOR S.A.C.</div>
          <div class="text-[11px] text-slate-500">RUC: 20608945123 &bull; Lima, Perú</div>
          <div class="text-xs font-mono font-bold text-blue-800 mt-1">
            {{ pedidoDetalle.estado === 'PAGADO' ? (pedidoDetalle.tipoComprobante || 'BOLETA') + ' ELECTRÓNICA ' + (pedidoDetalle.serieNumero || '') : 'PRE-CUENTA DE MESA' }}
          </div>
          <div class="text-[11px] font-mono text-slate-500">Orden #00{{ pedidoDetalle.id }} &bull; Mesa {{ pedidoDetalle.mesa?.numero }}</div>
        </div>

        <div class="py-2.5 border-b border-dashed border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-400">Cliente:</span>
            <span class="font-medium text-slate-800">{{ pedidoDetalle.clienteDocumento || 'Cliente General' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Mesero:</span>
            <span class="font-medium text-slate-800">{{ pedidoDetalle.mesero?.nombre || 'Carlos Mendoza' }}</span>
          </div>
          <div *ngIf="pedidoDetalle.metodoPago" class="flex justify-between">
            <span class="text-slate-400">Medio de Pago:</span>
            <span class="font-semibold text-emerald-700">{{ pedidoDetalle.metodoPago }}</span>
          </div>
          <div *ngIf="pedidoDetalle.fechaCierre" class="flex justify-between">
            <span class="text-slate-400">Hora Cierre:</span>
            <span class="font-mono">{{ pedidoDetalle.fechaCierre | date:'dd/MM/yyyy HH:mm:ss' }}</span>
          </div>
        </div>

        <div class="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
          <div *ngFor="let d of pedidoDetalle.detalles" class="flex justify-between">
            <span>{{ d.cantidad }}x {{ d.plato?.nombre }}</span>
            <span class="font-mono">S/ {{ d.subtotal | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="py-2.5 space-y-1 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Op. Gravada:</span>
            <span class="font-mono">S/ {{ (pedidoDetalle.total / 1.18) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>IGV (18%):</span>
            <span class="font-mono">S/ {{ (pedidoDetalle.total - (pedidoDetalle.total / 1.18)) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>IMPORTE TOTAL:</span>
            <span class="font-mono">S/ {{ pedidoDetalle.total | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <button (click)="imprimirComprobante()"
                  class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded inline-flex items-center space-x-1">
            <span class="material-symbols-outlined text-sm">print</span>
            <span>Imprimir</span>
          </button>
          <button (click)="pedidoDetalle = null"
                  class="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);

  pedidos: Pedido[] = [];
  estadoFiltro: 'TODOS' | 'ACTIVOS' | 'PAGADO' = 'PAGADO';
  terminoBusqueda = '';
  metodoPagoFiltro = 'TODOS';

  pedidoDetalle: Pedido | null = null;
  pedidoPorCobrar: Pedido | null = null;
  tipoComprobante: 'BOLETA' | 'FACTURA' = 'BOLETA';
  clienteDocumento = 'Cliente General';
  metodoPago = 'Yape / Plin';
  mensajeAviso = '';

  get pedidosPagados(): Pedido[] {
    return this.pedidos.filter(p => p.estado === 'PAGADO');
  }

  get pedidosEnAtencion(): Pedido[] {
    return this.pedidos.filter(p => p.estado !== 'PAGADO' && p.estado !== 'CANCELADO');
  }

  get pedidosFiltrados(): Pedido[] {
    return this.pedidos.filter(p => {
      const coincideEstado =
        this.estadoFiltro === 'TODOS' ||
        (this.estadoFiltro === 'PAGADO' && p.estado === 'PAGADO') ||
        (this.estadoFiltro === 'ACTIVOS' && p.estado !== 'PAGADO' && p.estado !== 'CANCELADO');

      const coincideMetodo =
        this.metodoPagoFiltro === 'TODOS' || (p.metodoPago || '') === this.metodoPagoFiltro;

      const txt = this.terminoBusqueda.trim().toLowerCase();
      const coincideTxt =
        !txt ||
        (p.serieNumero || '').toLowerCase().includes(txt) ||
        (p.clienteDocumento || '').toLowerCase().includes(txt) ||
        `mesa ${p.mesa?.numero}`.includes(txt) ||
        `#${p.id}`.includes(txt);

      return coincideEstado && coincideMetodo && coincideTxt;
    });
  }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidoService.listarPedidos().subscribe({
      next: (data) => (this.pedidos = data)
    });
  }

  calcularTotalPorCobrar(): number {
    return this.pedidosEnAtencion.reduce((acc, p) => acc + Number(p.total || 0), 0);
  }

  calcularTotalPagado(): number {
    return this.pedidosPagados.reduce((acc, p) => acc + Number(p.total || 0), 0);
  }

  abrirModalCobroCaja(p: Pedido): void {
    this.pedidoPorCobrar = p;
    this.tipoComprobante = 'BOLETA';
    this.clienteDocumento = p.clienteDocumento || 'Cliente General';
    this.metodoPago = 'Yape / Plin';
  }

  ejecutarCobroCaja(): void {
    if (!this.pedidoPorCobrar || !this.pedidoPorCobrar.id) return;
    const id = this.pedidoPorCobrar.id;

    this.pedidoService.cobrarPedido(id, {
      tipoComprobante: this.tipoComprobante,
      clienteDocumento: this.clienteDocumento,
      metodoPago: this.metodoPago
    }).subscribe({
      next: (pagado) => {
        this.pedidoPorCobrar = null;
        this.pedidoDetalle = pagado;
        this.estadoFiltro = 'PAGADO';
        this.cargarPedidos();
        this.mensajeAviso = `Venta cerrada y guardada en auditoría con comprobante ${pagado.serieNumero} (Mesa ${pagado.mesa?.numero} liberada).`;
      },
      error: () => {
        this.pedidoPorCobrar = null;
        this.cargarPedidos();
      }
    });
  }

  imprimirComprobante(): void {
    window.print();
  }

  anularPedido(p: Pedido): void {
    if (!p.id) return;
    this.pedidoService.actualizarEstado(p.id, 'CANCELADO').subscribe({
      next: () => {
        this.cargarPedidos();
        this.mensajeAviso = `Pedido #${p.id} anulado correctamente y Mesa ${p.mesa?.numero} liberada a DISPONIBLE.`;
      }
    });
  }

  eliminarPedido(p: Pedido): void {
    if (!p.id) return;
    this.pedidoService.eliminarPedido(p.id).subscribe({
      next: () => {
        this.cargarPedidos();
        this.mensajeAviso = `Registro de pedido #${p.id} eliminado de la base de datos.`;
      }
    });
  }

  obtenerClaseBadge(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EN_PREPARACION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LISTO':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ENTREGADO':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'PAGADO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  }
}
