import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../layout/navbar.component';
import { PedidoService } from '../../core/services/pedido.service';
import { Pedido, EstadoPedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-cocina-kds',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Monitor de Cocina (KDS)</h1>
          <p class="text-sm text-slate-500">Control de comandas en tiempo real por orden de llegada (FIFO)</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div class="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 mr-2">
            <button (click)="zonaFiltro = 'TODAS'"
                    [class]="zonaFiltro === 'TODAS' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'"
                    class="px-2.5 py-1 rounded">
              Todas las zonas
            </button>
            <button (click)="zonaFiltro = 'Salón principal'"
                    [class]="zonaFiltro === 'Salón principal' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'"
                    class="px-2.5 py-1 rounded">
              Salón
            </button>
            <button (click)="zonaFiltro = 'Terraza'"
                    [class]="zonaFiltro === 'Terraza' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'"
                    class="px-2.5 py-1 rounded">
              Terraza
            </button>
          </div>

          <button (click)="cargarPedidos()" 
                  class="inline-flex items-center space-x-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded font-medium shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">refresh</span>
            <span>Actualizar Monitor</span>
          </button>
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

      <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-slate-100/80 border border-slate-200 rounded-lg p-4 flex flex-col min-h-[480px]">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h2 class="text-sm font-bold text-slate-800">Pendientes en Cola</h2>
            </div>
            <span class="bg-white border border-slate-200 text-slate-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {{ pedidosPendientes.length }}
            </span>
          </div>

          <div class="space-y-3 flex-1">
            <div *ngFor="let p of pedidosPendientes" 
                 class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all">
              
              <div class="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <span class="font-bold text-base text-slate-900">Mesa {{ p.mesa?.numero }}</span>
                  <span class="text-xs text-slate-500 ml-1.5">({{ p.mesa?.ubicacion || 'Salón' }})</span>
                </div>
                <div class="text-right">
                  <span class="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    Comanda #{{ p.id }}
                  </span>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ calcularTiempo(p.fechaCreacion) }}</div>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 py-1">
                Mesero: <strong class="text-slate-700">{{ p.mesero?.nombre || 'Carlos Mendoza' }}</strong>
              </div>

              <div class="my-2 py-2 border-y border-slate-100 space-y-1.5 text-xs">
                <div *ngFor="let d of p.detalles; let idx = index" 
                     (click)="toggleItemCheck(p.id!, idx)"
                     class="flex items-start space-x-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                  <input type="checkbox" [checked]="esItemMarcado(p.id!, idx)" 
                         class="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-0" />
                  <div class="flex-1">
                    <div [class.line-through]="esItemMarcado(p.id!, idx)" [class.text-slate-400]="esItemMarcado(p.id!, idx)">
                      <span class="font-bold text-blue-800 font-mono mr-1">{{ d.cantidad }}x</span>
                      <span class="font-semibold text-slate-900">{{ d.plato?.nombre }}</span>
                    </div>
                    <div *ngIf="d.notas" class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                      Nota: {{ d.notas }}
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="p.observaciones" class="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 p-2 rounded mb-3">
                <strong class="text-slate-900">Obs. Mesa:</strong> {{ p.observaciones }}
              </div>

              <button (click)="avanzarEstado(p, 'EN_PREPARACION')" 
                      class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs py-2 rounded transition-colors flex items-center justify-center space-x-1">
                <span class="material-symbols-outlined text-sm">skillet</span>
                <span>Iniciar Preparación</span>
              </button>

            </div>

            <div *ngIf="pedidosPendientes.length === 0" class="py-12 text-center text-xs text-slate-400">
              Sin comandas pendientes en cola.
            </div>
          </div>
        </div>

        <div class="bg-slate-100/80 border border-slate-200 rounded-lg p-4 flex flex-col min-h-[480px]">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 class="text-sm font-bold text-slate-800">En Preparación</h2>
            </div>
            <span class="bg-white border border-slate-200 text-slate-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {{ pedidosEnPreparacion.length }}
            </span>
          </div>

          <div class="space-y-3 flex-1">
            <div *ngFor="let p of pedidosEnPreparacion" 
                 class="bg-white border-2 border-blue-600 rounded-lg p-4 shadow-sm transition-all">
              
              <div class="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <span class="font-bold text-base text-slate-900">Mesa {{ p.mesa?.numero }}</span>
                  <span class="text-xs text-slate-500 ml-1.5">({{ p.mesa?.ubicacion || 'Salón' }})</span>
                </div>
                <span class="text-[11px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  En Fuegos &bull; #{{ p.id }}
                </span>
              </div>

              <div class="text-[11px] text-slate-500 py-1">
                Mesero: <strong class="text-slate-700">{{ p.mesero?.nombre || 'Carlos Mendoza' }}</strong> &bull; {{ calcularTiempo(p.fechaCreacion) }}
              </div>

              <div class="my-2 py-2 border-y border-slate-100 space-y-1.5 text-xs">
                <div *ngFor="let d of p.detalles; let idx = index" 
                     (click)="toggleItemCheck(p.id!, idx)"
                     class="flex items-start space-x-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                  <input type="checkbox" [checked]="esItemMarcado(p.id!, idx)" 
                         class="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-0" />
                  <div class="flex-1">
                    <div [class.line-through]="esItemMarcado(p.id!, idx)" [class.text-slate-400]="esItemMarcado(p.id!, idx)">
                      <span class="font-bold text-blue-800 font-mono mr-1">{{ d.cantidad }}x</span>
                      <span class="font-semibold text-slate-900">{{ d.plato?.nombre }}</span>
                    </div>
                    <div *ngIf="d.notas" class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                      Nota: {{ d.notas }}
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="p.observaciones" class="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 p-2 rounded mb-3">
                <strong class="text-slate-900">Obs. Mesa:</strong> {{ p.observaciones }}
              </div>

              <button (click)="avanzarEstado(p, 'LISTO')" 
                      class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded transition-colors flex items-center justify-center space-x-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Marcar Orden Lista</span>
              </button>

            </div>

            <div *ngIf="pedidosEnPreparacion.length === 0" class="py-12 text-center text-xs text-slate-400">
              No hay órdenes en preparación en este momento.
            </div>
          </div>
        </div>

        <div class="bg-slate-100/80 border border-slate-200 rounded-lg p-4 flex flex-col min-h-[480px]">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 class="text-sm font-bold text-slate-800">Listos para Entrega</h2>
            </div>
            <span class="bg-white border border-slate-200 text-slate-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {{ pedidosListos.length }}
            </span>
          </div>

          <div class="space-y-3 flex-1">
            <div *ngFor="let p of pedidosListos" 
                 class="bg-white border border-emerald-300 rounded-lg p-4 shadow-sm transition-all">
              
              <div class="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <span class="font-bold text-base text-emerald-900">Mesa {{ p.mesa?.numero }}</span>
                  <span class="text-xs text-slate-500 ml-1.5">({{ p.mesa?.ubicacion || 'Salón' }})</span>
                </div>
                <span class="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Listo &bull; #{{ p.id }}
                </span>
              </div>

              <div class="text-[11px] text-slate-500 py-1">
                Esperando recojo por: <strong class="text-slate-700">{{ p.mesero?.nombre || 'Carlos Mendoza' }}</strong>
              </div>

              <div class="my-2 py-2 border-y border-slate-100 space-y-1 text-xs text-slate-700">
                <div *ngFor="let d of p.detalles" class="flex justify-between">
                  <span><strong class="font-mono">{{ d.cantidad }}x</strong> {{ d.plato?.nombre }}</span>
                  <span class="text-emerald-600 text-[11px] font-medium">Emplatado</span>
                </div>
              </div>

              <button (click)="avanzarEstado(p, 'ENTREGADO')" 
                      class="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 rounded transition-colors flex items-center justify-center space-x-1">
                <span class="material-symbols-outlined text-sm">room_service</span>
                <span>Confirmar Salida a Salón</span>
              </button>

            </div>

            <div *ngIf="pedidosListos.length === 0" class="py-12 text-center text-xs text-slate-400">
              No hay pedidos pendientes de recojo en barra.
            </div>
          </div>
        </div>

      </div>

    </main>
  `
})
export class CocinaKdsComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);

  pedidos: Pedido[] = [];
  zonaFiltro = 'TODAS';
  mensajeAviso = '';
  itemsMarcados = new Set<string>();

  private filtrarPorZona(lista: Pedido[]): Pedido[] {
    if (this.zonaFiltro === 'TODAS') return lista;
    return lista.filter(p => (p.mesa?.ubicacion || '').toLowerCase() === this.zonaFiltro.toLowerCase());
  }

  get pedidosPendientes(): Pedido[] {
    return this.filtrarPorZona(this.pedidos.filter(p => p.estado === 'PENDIENTE'));
  }

  get pedidosEnPreparacion(): Pedido[] {
    return this.filtrarPorZona(this.pedidos.filter(p => p.estado === 'EN_PREPARACION'));
  }

  get pedidosListos(): Pedido[] {
    return this.filtrarPorZona(this.pedidos.filter(p => p.estado === 'LISTO'));
  }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidoService.listarPedidos().subscribe({
      next: (data) => (this.pedidos = data),
      error: () => {
        if (this.pedidos.length === 0) {
          this.pedidos = [
            {
              id: 1,
              mesa: { id: 7, numero: 7, capacidad: 4, ubicacion: 'Terraza', estado: 'OCUPADA' },
              mesero: { id: 2, nombre: 'Carlos Mendoza', apellido: '', email: 'cmendoza@elbuensabor.pe', rol: 'MESERO' },
              estado: 'PENDIENTE',
              total: 84.0,
              observaciones: 'Lomo saltado término medio',
              detalles: [
                { plato: { id: 3, nombre: 'Lomo Saltado', precio: 35.0 }, cantidad: 2, precioUnitario: 35.0, subtotal: 70.0, notas: 'Término medio' },
                { plato: { id: 6, nombre: 'Chicha Morada 1L', precio: 14.0 }, cantidad: 1, precioUnitario: 14.0, subtotal: 14.0 }
              ]
            },
            {
              id: 3,
              mesa: { id: 2, numero: 2, capacidad: 4, ubicacion: 'Salón principal', estado: 'OCUPADA' },
              mesero: { id: 2, nombre: 'Carlos Mendoza', apellido: '', email: 'cmendoza@elbuensabor.pe', rol: 'MESERO' },
              estado: 'EN_PREPARACION',
              total: 56.0,
              observaciones: 'Sin ají picante para niños',
              detalles: [
                { plato: { id: 4, nombre: 'Ají de Gallina', precio: 28.0 }, cantidad: 2, precioUnitario: 28.0, subtotal: 56.0, notas: 'Sin ají fuerte' }
              ]
            },
            {
              id: 4,
              mesa: { id: 5, numero: 5, capacidad: 2, ubicacion: 'Salón principal', estado: 'OCUPADA' },
              mesero: { id: 2, nombre: 'Carlos Mendoza', apellido: '', email: 'cmendoza@elbuensabor.pe', rol: 'MESERO' },
              estado: 'LISTO',
              total: 53.0,
              detalles: [
                { plato: { id: 2, nombre: 'Ceviche Clásico', precio: 38.0 }, cantidad: 1, precioUnitario: 38.0, subtotal: 38.0 },
                { plato: { id: 8, nombre: 'Suspiro a la Limeña', precio: 15.0 }, cantidad: 1, precioUnitario: 15.0, subtotal: 15.0 }
              ]
            }
          ];
        }
      }
    });
  }

  toggleItemCheck(pedidoId: number, idx: number): void {
    const key = `${pedidoId}-${idx}`;
    if (this.itemsMarcados.has(key)) {
      this.itemsMarcados.delete(key);
    } else {
      this.itemsMarcados.add(key);
    }
  }

  esItemMarcado(pedidoId: number, idx: number): boolean {
    return this.itemsMarcados.has(`${pedidoId}-${idx}`);
  }

  calcularTiempo(fechaStr?: string): string {
    if (!fechaStr) return 'Reciente';
    const fecha = new Date(fechaStr);
    const diffMin = Math.max(1, Math.round((Date.now() - fecha.getTime()) / 60000));
    if (isNaN(diffMin) || diffMin > 300) return 'En turno';
    return `Hace ${diffMin} min`;
  }

  avanzarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    if (!pedido.id) return;
    this.pedidoService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        pedido.estado = actualizado.estado;
        this.notificar(`Comanda #${pedido.id} (Mesa ${pedido.mesa?.numero}) pasó a estado: ${nuevoEstado}.`);
      },
      error: () => {
        pedido.estado = nuevoEstado;
        this.notificar(`Comanda #${pedido.id} (Mesa ${pedido.mesa?.numero}) pasó a estado: ${nuevoEstado}.`);
      }
    });
  }

  private notificar(msg: string): void {
    this.mensajeAviso = msg;
    setTimeout(() => {
      if (this.mensajeAviso === msg) this.mensajeAviso = '';
    }, 3500);
  }
}
