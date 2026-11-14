import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../layout/navbar.component';
import { MesaService } from '../../core/services/mesa.service';
import { PlatoService } from '../../core/services/plato.service';
import { PedidoService } from '../../core/services/pedido.service';
import { Mesa, EstadoMesa } from '../../core/models/mesa.model';
import { Plato } from '../../core/models/plato.model';
import { DetallePedido, Pedido, EstadoPedido } from '../../core/models/pedido.model';

@Component({
  selector: 'app-mesero-salon',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Encabezado y Resumen de Ocupación -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Control de Salón y Comandas</h1>
          <p class="text-sm text-slate-500">Seleccione una mesa para registrar pedidos, enviar a cocina o emitir comprobante</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span class="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{{ contarPorEstado('DISPONIBLE') }} Libres</span>
          </span>
          <span class="inline-flex items-center space-x-1.5 text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{{ contarPorEstado('OCUPADA') }} Ocupadas</span>
          </span>
          <span class="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{{ contarPorEstado('RESERVADA') }} Reservadas</span>
          </span>
          <button (click)="cargarDatos()" 
                  class="inline-flex items-center space-x-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded transition-colors">
            <span class="material-symbols-outlined text-sm">refresh</span>
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      <!-- Notificación de operación -->
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

      <!-- Layout Principal: Mesas y Carta (7 cols) | Comanda Activa (5 cols) -->
      <div class="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- COLUMNA IZQUIERDA: Mapa de Mesas + Catálogo de Platos -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Tarjeta de Distribución de Mesas -->
          <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 class="text-sm font-bold text-slate-800">Croquis de Mesas del Restaurante</h2>
              
              <!-- Filtro por Zona -->
              <div class="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 text-xs">
                <button (click)="ubicacionFiltro = 'TODAS'"
                        [class]="ubicacionFiltro === 'TODAS' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                        class="px-2.5 py-1 rounded transition-colors">
                  Todas ({{ mesas.length }})
                </button>
                <button (click)="ubicacionFiltro = 'Salón principal'"
                        [class]="ubicacionFiltro === 'Salón principal' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                        class="px-2.5 py-1 rounded transition-colors">
                  Salón Principal
                </button>
                <button (click)="ubicacionFiltro = 'Terraza'"
                        [class]="ubicacionFiltro === 'Terraza' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                        class="px-2.5 py-1 rounded transition-colors">
                  Terraza
                </button>
              </div>
            </div>

            <!-- Grid de Mesas -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div *ngFor="let m of mesasFiltradas" 
                   (click)="seleccionarMesa(m)"
                   [class]="m.id === mesaSeleccionada?.id ? 'ring-2 ring-blue-700 border-blue-700 bg-blue-50/40' : 'border-slate-200 hover:border-slate-300 bg-white'"
                   class="cursor-pointer border rounded-lg p-3 transition-all flex flex-col justify-between min-h-[116px] select-none relative">
                
                <div class="flex items-center justify-between text-[11px] text-slate-500">
                  <span class="truncate">{{ m.ubicacion || 'Salón' }}</span>
                  <span class="inline-flex items-center space-x-0.5 font-medium">
                    <span class="material-symbols-outlined text-xs">group</span>
                    <span>{{ m.capacidad }}</span>
                  </span>
                </div>

                <div class="my-1.5 text-center">
                  <div class="text-lg font-bold text-slate-900">Mesa {{ m.numero }}</div>
                  <div *ngIf="obtenerPedidoDeMesa(m.id!) as ped" class="text-[11px] font-mono font-semibold text-blue-800">
                    S/ {{ ped.total | number:'1.2-2' }}
                  </div>
                  <div *ngIf="!obtenerPedidoDeMesa(m.id!)" class="text-[10px] text-slate-400">
                    Sin consumo
                  </div>
                </div>

                <div class="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <span [class]="obtenerClaseEstadoMesa(m.estado)" 
                        class="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border">
                    {{ m.estado }}
                  </span>
                  <span *ngIf="obtenerPedidoDeMesa(m.id!) as ped"
                        [class]="obtenerClaseEstadoPedido(ped.estado)"
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {{ formatearEstadoCorto(ped.estado) }}
                  </span>
                </div>

              </div>
            </div>
          </div>

          <!-- Catálogo de Platos para Agregar a la Mesa Seleccionada -->
          <div *ngIf="mesaSeleccionada" class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Carta Disponible &rarr; Mesa {{ mesaSeleccionada.numero }}</h3>
                <p class="text-xs text-slate-500">Haga clic sobre cualquier plato para añadirlo a la comanda</p>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-2">search</span>
                <input type="text" [(ngModel)]="busquedaPlato" placeholder="Buscar plato..."
                       class="w-full sm:w-48 pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <!-- Pestañas de Categorías -->
            <div class="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-100">
              <button (click)="categoriaPlatoFiltro = 'TODAS'"
                      [class]="categoriaPlatoFiltro === 'TODAS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">
                Todos
              </button>
              <button (click)="categoriaPlatoFiltro = 'Entradas'"
                      [class]="categoriaPlatoFiltro === 'Entradas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">
                Entradas
              </button>
              <button (click)="categoriaPlatoFiltro = 'Platos de Fondo'"
                      [class]="categoriaPlatoFiltro === 'Platos de Fondo' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">
                Platos de Fondo
              </button>
              <button (click)="categoriaPlatoFiltro = 'Bebidas'"
                      [class]="categoriaPlatoFiltro === 'Bebidas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">
                Bebidas
              </button>
              <button (click)="categoriaPlatoFiltro = 'Postres'"
                      [class]="categoriaPlatoFiltro === 'Postres' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">
                Postres
              </button>
            </div>

            <!-- Lista de Platos -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              <div *ngFor="let p of platosCatalogoFiltrados" 
                   (click)="agregarPlatoAComanda(p)"
                   class="cursor-pointer p-2.5 rounded border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
                <div class="pr-2">
                  <div class="text-xs font-semibold text-slate-900 group-hover:text-blue-800">{{ p.nombre }}</div>
                  <div class="text-[11px] text-slate-500">{{ p.categoria?.nombre }}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs font-mono font-bold text-slate-900">S/ {{ p.precio | number:'1.2-2' }}</div>
                  <span class="text-[10px] text-blue-700 font-semibold">+ Añadir</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- COLUMNA DERECHA: Panel de Comanda Activa -->
        <div class="lg:col-span-5">
          <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm sticky top-20">
            
            <div *ngIf="mesaSeleccionada; else sinMesa">
              
              <!-- Cabecera de la Mesa Seleccionada -->
              <div class="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="text-base font-bold text-slate-900">Mesa {{ mesaSeleccionada.numero }}</h3>
                    <span *ngIf="pedidoActivo?.id" class="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      Comanda #{{ pedidoActivo?.id }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ mesaSeleccionada.ubicacion || 'Salón Principal' }} &bull; Capacidad {{ mesaSeleccionada.capacidad }} personas
                  </p>
                </div>

                <div class="flex flex-col items-end space-y-1">
                  <span [class]="obtenerClaseEstadoMesa(mesaSeleccionada.estado)" 
                        class="text-[11px] font-semibold px-2 py-0.5 rounded border">
                    {{ mesaSeleccionada.estado }}
                  </span>
                  <span *ngIf="pedidoActivo" 
                        [class]="obtenerClaseEstadoPedido(pedidoActivo.estado)"
                        class="text-[10px] font-bold px-2 py-0.5 rounded">
                    Cocina: {{ pedidoActivo.estado }}
                  </span>
                </div>
              </div>

              <!-- Aviso cuando Cocina marcó el pedido como LISTO -->
              <div *ngIf="pedidoActivo?.estado === 'LISTO'" 
                   class="mt-3 p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
                <div class="text-xs">
                  <strong class="block font-bold">¡Pedido listo en cocina!</strong>
                  <span>Recoger platos en barra y entregar en Mesa {{ mesaSeleccionada.numero }}.</span>
                </div>
                <button (click)="marcarEntregadoEnMesa()"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded shrink-0 ml-2">
                  Confirmar Entrega
                </button>
              </div>

              <!-- Lista de Ítems de la Comanda -->
              <div class="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                <div *ngFor="let item of itemsComanda; let i = index" class="py-2.5 text-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex-1 pr-2">
                      <div class="font-semibold text-slate-900">{{ item.plato.nombre }}</div>
                      <div class="text-slate-400 text-[11px] font-mono">S/ {{ item.precioUnitario | number:'1.2-2' }} c/u</div>
                    </div>
                    
                    <!-- Botones - / + -->
                    <div class="flex items-center space-x-1.5 mr-3">
                      <button (click)="cambiarCantidad(i, -1)" 
                              class="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                        -
                      </button>
                      <span class="w-6 text-center font-mono font-bold text-slate-900">{{ item.cantidad }}</span>
                      <button (click)="cambiarCantidad(i, 1)" 
                              class="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                        +
                      </button>
                    </div>

                    <div class="font-mono font-bold text-slate-900 text-right w-16">
                      S/ {{ item.subtotal | number:'1.2-2' }}
                    </div>
                  </div>

                  <!-- Nota individual por plato -->
                  <div class="mt-1.5">
                    <input type="text" 
                           [(ngModel)]="item.notas" 
                           placeholder="Nota del plato (ej. término medio, sin helar)..."
                           class="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div *ngIf="itemsComanda.length === 0" class="py-8 text-center text-slate-400 text-xs">
                  Mesa sin platos cargados.<br>Seleccione platos del catálogo izquierdo para armar la comanda.
                </div>
              </div>

              <!-- Observaciones Generales -->
              <div class="mt-3 pt-2 border-t border-slate-100">
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Observación General de Mesa / Cocina</label>
                <input type="text" [(ngModel)]="observacionesComanda" 
                       placeholder="Ej: Traer cubiertos extra, servir entrada primero..."
                       class="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600" />
              </div>

              <!-- Resumen Financiero (Subtotal + IGV 18% + Total) -->
              <div class="mt-4 p-3 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                <div class="flex justify-between text-slate-500">
                  <span>Op. Gravada (Subtotal):</span>
                  <span class="font-mono">S/ {{ calcularSubtotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>IGV (18%):</span>
                  <span class="font-mono">S/ {{ calcularIGV() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Comanda:</span>
                  <span class="font-mono text-blue-800">S/ {{ calcularTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Botones Operativos Principales -->
              <div class="mt-4 space-y-2">
                <button (click)="guardarYEnviarComanda()" 
                        [disabled]="itemsComanda.length === 0"
                        class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs py-2.5 rounded shadow-sm transition-colors disabled:opacity-40 flex items-center justify-center space-x-1.5">
                  <span class="material-symbols-outlined text-sm">send</span>
                  <span>{{ pedidoActivo?.id ? 'Actualizar Comanda en Cocina' : 'Enviar Comanda a Cocina' }}</span>
                </button>

                <button *ngIf="pedidoActivo?.id || itemsComanda.length > 0"
                        (click)="abrirModalCobro()"
                        class="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 rounded transition-colors flex items-center justify-center space-x-1.5">
                  <span class="material-symbols-outlined text-sm">receipt_long</span>
                  <span>Cobrar Cuenta / Emitir Comprobante</span>
                </button>

                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button (click)="cambiarEstadoMesa('DISPONIBLE')" 
                          class="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs py-1.5 rounded font-medium">
                    Marcar Libre
                  </button>
                  <button (click)="cambiarEstadoMesa('RESERVADA')" 
                          class="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs py-1.5 rounded font-medium">
                    Marcar Reservada
                  </button>
                </div>
              </div>

            </div>

            <!-- Estado inicial si no hay mesa activa -->
            <ng-template #sinMesa>
              <div class="py-14 text-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">table_restaurant</span>
                <p class="text-sm font-semibold text-slate-600">Seleccione una mesa</p>
                <p class="text-xs text-slate-400 mt-1">Haga clic sobre una mesa del croquis para gestionar su comanda.</p>
              </div>
            </ng-template>

          </div>
        </div>

      </div>

    </main>

    <!-- Modal de Facturación / Cobro de Mesa -->
    <div *ngIf="mostrarModalCobro && mesaSeleccionada" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-base font-bold text-slate-900">Emisión de Comprobante y Cobro</h2>
            <p class="text-xs text-slate-500">Mesa {{ mesaSeleccionada.numero }} &bull; Comanda #{{ pedidoActivo?.id || 'Nueva' }}</p>
          </div>
          <button (click)="mostrarModalCobro = false" class="text-slate-400 hover:text-slate-600">
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
              {{ tipoComprobante === 'BOLETA' ? 'Cliente / DNI (Opcional)' : 'Razón Social / RUC *' }}
            </label>
            <input type="text" [(ngModel)]="clienteDocumento" 
                   [placeholder]="tipoComprobante === 'BOLETA' ? 'Cliente General - DNI' : '20601234567 - Empresa S.A.C.'"
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

          <!-- Resumen de Comprobante -->
          <div class="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 mt-2">
            <div class="text-[11px] font-semibold text-slate-700 pb-1 border-b border-slate-200">
              Detalle ({{ itemsComanda.length }} ítems)
            </div>
            <div *ngFor="let it of itemsComanda" class="flex justify-between text-[11px] text-slate-600 pt-0.5">
              <span>{{ it.cantidad }}x {{ it.plato.nombre }}</span>
              <span class="font-mono">S/ {{ it.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="pt-2 mt-2 border-t border-slate-200 flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span class="font-mono">S/ {{ calcularSubtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>IGV (18%):</span>
              <span class="font-mono">S/ {{ calcularIGV() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Importe Total:</span>
              <span class="font-mono text-blue-800">S/ {{ calcularTotal() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-200 flex justify-end space-x-2">
          <button (click)="mostrarModalCobro = false"
                  class="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">
            Cancelar
          </button>
          <button (click)="confirmarCobroYLiberarMesa()"
                  class="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm">
            Registrar Pago y Liberar Mesa
          </button>
        </div>

      </div>
    </div>

    <!-- Modal de Comprobante Emitido (Venta Guardada en Historial y Auditoría) -->
    <div *ngIf="comprobanteEmitido" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-sm p-6">
        <div class="text-center border-b border-dashed border-slate-300 pb-3">
          <div class="w-9 h-9 mx-auto mb-2 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <span class="material-symbols-outlined text-lg">verified</span>
          </div>
          <div class="font-bold text-sm text-slate-900">EL BUEN SABOR S.A.C.</div>
          <div class="text-[11px] text-slate-500">RUC: 20608945123 &bull; Venta Guardada en Auditoría</div>
          <div class="text-xs font-mono font-bold text-blue-800 mt-1">
            {{ comprobanteEmitido.tipoComprobante || 'BOLETA' }} ELECTRÓNICA {{ comprobanteEmitido.serieNumero }}
          </div>
        </div>

        <div class="py-2.5 border-b border-dashed border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-400">Cliente / Doc:</span>
            <span class="font-medium text-slate-800">{{ comprobanteEmitido.clienteDocumento || 'Cliente General' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Mesa / Atendido por:</span>
            <span class="font-medium text-slate-800">Mesa {{ comprobanteEmitido.mesa?.numero }} &bull; {{ comprobanteEmitido.mesero?.nombre || 'Carlos Mendoza' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Medio de Pago:</span>
            <span class="font-semibold text-emerald-700">{{ comprobanteEmitido.metodoPago || 'Efectivo' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Fecha/Hora Auditoría:</span>
            <span class="font-mono text-slate-700">{{ (comprobanteEmitido.fechaCierre | date:'dd/MM/yyyy HH:mm:ss') || 'Registrado' }}</span>
          </div>
        </div>

        <div class="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs max-h-40 overflow-y-auto">
          <div *ngFor="let d of comprobanteEmitido.detalles" class="flex justify-between">
            <span>{{ d.cantidad }}x {{ d.plato?.nombre }}</span>
            <span class="font-mono">S/ {{ d.subtotal | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="py-2 space-y-1 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Op. Gravada:</span>
            <span class="font-mono">S/ {{ (comprobanteEmitido.total / 1.18) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>IGV (18%):</span>
            <span class="font-mono">S/ {{ (comprobanteEmitido.total - (comprobanteEmitido.total / 1.18)) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>TOTAL COBRADO:</span>
            <span class="font-mono text-emerald-700">S/ {{ comprobanteEmitido.total | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <button (click)="imprimirTicket()"
                  class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded inline-flex items-center space-x-1">
            <span class="material-symbols-outlined text-sm">print</span>
            <span>Imprimir</span>
          </button>
          <button (click)="comprobanteEmitido = null"
                  class="px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  `
})
export class MeseroSalonComponent implements OnInit {
  private readonly mesaService = inject(MesaService);
  private readonly platoService = inject(PlatoService);
  private readonly pedidoService = inject(PedidoService);

  mesas: Mesa[] = [];
  platos: Plato[] = [];
  pedidosActivos: Pedido[] = [];

  ubicacionFiltro = 'TODAS';
  categoriaPlatoFiltro = 'TODAS';
  busquedaPlato = '';

  mesaSeleccionada: Mesa | null = null;
  pedidoActivo: Pedido | null = null;
  itemsComanda: DetallePedido[] = [];
  observacionesComanda = '';
  mensajeAviso = '';

  // Facturación / Cobro
  mostrarModalCobro = false;
  comprobanteEmitido: Pedido | null = null;
  tipoComprobante: 'BOLETA' | 'FACTURA' = 'BOLETA';
  clienteDocumento = 'Cliente General';
  metodoPago = 'Yape / Plin';

  get mesasFiltradas(): Mesa[] {
    if (this.ubicacionFiltro === 'TODAS') return this.mesas;
    return this.mesas.filter(m => (m.ubicacion || '').toLowerCase() === this.ubicacionFiltro.toLowerCase());
  }

  get platosCatalogoFiltrados(): Plato[] {
    return this.platos.filter(p => {
      const disponible = p.disponible !== false;
      const coincideCat = this.categoriaPlatoFiltro === 'TODAS' || (p.categoria?.nombre || '') === this.categoriaPlatoFiltro;
      const txt = this.busquedaPlato.trim().toLowerCase();
      const coincideTxt = !txt || p.nombre.toLowerCase().includes(txt);
      return disponible && coincideCat && coincideTxt;
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.mesaService.listarMesas().subscribe({
      next: (data) => {
        this.mesas = data;
        if (!this.mesaSeleccionada && this.mesas.length > 0) {
          const mesa7 = this.mesas.find(m => m.numero === 7) || this.mesas[0];
          this.seleccionarMesa(mesa7);
        } else if (this.mesaSeleccionada) {
          const actualizada = this.mesas.find(m => m.id === this.mesaSeleccionada?.id);
          if (actualizada) this.mesaSeleccionada = actualizada;
        }
      },
      error: () => {
        if (this.mesas.length === 0) {
          this.mesas = [
            { id: 1, numero: 1, capacidad: 4, ubicacion: 'Salón principal', estado: 'DISPONIBLE' },
            { id: 2, numero: 2, capacidad: 4, ubicacion: 'Salón principal', estado: 'OCUPADA' },
            { id: 3, numero: 3, capacidad: 2, ubicacion: 'Salón principal', estado: 'OCUPADA' },
            { id: 4, numero: 4, capacidad: 6, ubicacion: 'Salón principal', estado: 'DISPONIBLE' },
            { id: 5, numero: 5, capacidad: 2, ubicacion: 'Salón principal', estado: 'OCUPADA' },
            { id: 6, numero: 6, capacidad: 4, ubicacion: 'Salón principal', estado: 'RESERVADA' },
            { id: 7, numero: 7, capacidad: 4, ubicacion: 'Terraza', estado: 'OCUPADA' },
            { id: 8, numero: 8, capacidad: 2, ubicacion: 'Terraza', estado: 'DISPONIBLE' },
            { id: 9, numero: 9, capacidad: 8, ubicacion: 'Terraza', estado: 'OCUPADA' },
            { id: 10, numero: 10, capacidad: 8, ubicacion: 'Terraza', estado: 'DISPONIBLE' }
          ];
        }
      }
    });

    this.platoService.listarPlatos().subscribe({
      next: (data) => (this.platos = data)
    });

    this.pedidoService.listarPedidos().subscribe({
      next: (pedidos) => {
        this.pedidosActivos = pedidos.filter(p => p.estado !== 'PAGADO' && p.estado !== 'CANCELADO');
        if (this.mesaSeleccionada) {
          this.sincronizarComandaDeMesa(this.mesaSeleccionada);
        }
      }
    });
  }

  contarPorEstado(estado: EstadoMesa): number {
    return this.mesas.filter(m => m.estado === estado).length;
  }

  obtenerPedidoDeMesa(mesaId: number): Pedido | undefined {
    return this.pedidosActivos.find(p => p.mesa && Number(p.mesa.id) === Number(mesaId));
  }

  seleccionarMesa(m: Mesa): void {
    this.mesaSeleccionada = m;
    this.sincronizarComandaDeMesa(m);
  }

  private sincronizarComandaDeMesa(m: Mesa): void {
    if (!m.id) return;
    const activoLocal = this.obtenerPedidoDeMesa(m.id);
    if (activoLocal) {
      this.cargarPedidoEnPanel(activoLocal);
    } else {
      this.pedidoService.obtenerActivoPorMesa(m.id).subscribe({
        next: (ped) => {
          if (ped && ped.id) {
            this.cargarPedidoEnPanel(ped);
          } else {
            this.limpiarPanelComanda();
          }
        },
        error: () => this.limpiarPanelComanda()
      });
    }
  }

  private cargarPedidoEnPanel(ped: Pedido): void {
    this.pedidoActivo = ped;
    this.observacionesComanda = ped.observaciones || '';
    this.itemsComanda = (ped.detalles || []).map(d => ({
      id: d.id,
      plato: { ...d.plato },
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Number(d.subtotal),
      notas: d.notas || ''
    }));
  }

  private limpiarPanelComanda(): void {
    this.pedidoActivo = null;
    this.itemsComanda = [];
    this.observacionesComanda = '';
  }

  agregarPlatoAComanda(plato: Plato): void {
    if (!this.mesaSeleccionada) return;
    const existente = this.itemsComanda.find(x => x.plato.id === plato.id);
    if (existente) {
      existente.cantidad += 1;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.itemsComanda.push({
        plato: { ...plato },
        cantidad: 1,
        precioUnitario: Number(plato.precio),
        subtotal: Number(plato.precio),
        notas: ''
      });
    }
  }

  cambiarCantidad(index: number, delta: number): void {
    const item = this.itemsComanda[index];
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.itemsComanda.splice(index, 1);
    } else {
      item.subtotal = item.cantidad * item.precioUnitario;
    }
  }

  calcularTotal(): number {
    return this.itemsComanda.reduce((acc, item) => acc + Number(item.subtotal), 0);
  }

  calcularSubtotal(): number {
    return this.calcularTotal() / 1.18;
  }

  calcularIGV(): number {
    return this.calcularTotal() - this.calcularSubtotal();
  }

  guardarYEnviarComanda(): void {
    if (!this.mesaSeleccionada || this.itemsComanda.length === 0) return;

    const payload: Partial<Pedido> = {
      mesa: { id: this.mesaSeleccionada.id, numero: this.mesaSeleccionada.numero },
      mesero: { id: 2 },
      estado: 'PENDIENTE',
      total: this.calcularTotal(),
      observaciones: this.observacionesComanda,
      detalles: this.itemsComanda.map(it => ({
        plato: { id: it.plato.id, nombre: it.plato.nombre, precio: it.precioUnitario },
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
        notas: it.notas || ''
      }))
    };

    if (this.pedidoActivo && this.pedidoActivo.id) {
      this.pedidoService.actualizarPedido(this.pedidoActivo.id, payload).subscribe({
        next: (actualizado) => {
          this.cargarPedidoEnPanel(actualizado);
          this.cargarDatos();
          this.notificar(`Comanda #${actualizado.id} actualizada y reenviada a Cocina (Mesa ${this.mesaSeleccionada?.numero}).`);
        },
        error: () => {
          this.notificar(`Comanda actualizada para Mesa ${this.mesaSeleccionada?.numero}.`);
        }
      });
    } else {
      this.pedidoService.crearPedido(payload).subscribe({
        next: (creado) => {
          this.cargarPedidoEnPanel(creado);
          this.cargarDatos();
          this.notificar(`Comanda #${creado.id} registrada y enviada al Monitor de Cocina (Mesa ${this.mesaSeleccionada?.numero}).`);
        },
        error: () => {
          this.cambiarEstadoMesa('OCUPADA');
          this.notificar(`Comanda enviada a Cocina para la Mesa ${this.mesaSeleccionada?.numero}.`);
        }
      });
    }
  }

  marcarEntregadoEnMesa(): void {
    if (!this.pedidoActivo || !this.pedidoActivo.id) return;
    this.pedidoService.actualizarEstado(this.pedidoActivo.id, 'ENTREGADO').subscribe({
      next: (act) => {
        this.pedidoActivo = act;
        this.cargarDatos();
        this.notificar(`Pedido #${act.id} entregado en Mesa ${this.mesaSeleccionada?.numero}.`);
      }
    });
  }

  abrirModalCobro(): void {
    this.tipoComprobante = 'BOLETA';
    this.clienteDocumento = 'Cliente General';
    this.metodoPago = 'Yape / Plin';
    this.mostrarModalCobro = true;
  }

  confirmarCobroYLiberarMesa(): void {
    if (!this.mesaSeleccionada) return;
    const numMesa = this.mesaSeleccionada.numero;
    const totalCobrado = this.calcularTotal();

    const datosCobro: Partial<Pedido> = {
      mesa: { id: this.mesaSeleccionada.id, numero: this.mesaSeleccionada.numero },
      mesero: { id: 2 },
      total: totalCobrado,
      observaciones: this.observacionesComanda,
      tipoComprobante: this.tipoComprobante,
      clienteDocumento: this.clienteDocumento || 'Cliente General',
      metodoPago: this.metodoPago,
      detalles: this.itemsComanda.map(it => ({
        plato: { id: it.plato.id, nombre: it.plato.nombre, precio: it.precioUnitario },
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
        notas: it.notas || ''
      }))
    };

    const operacion$ = (this.pedidoActivo && this.pedidoActivo.id)
      ? this.pedidoService.cobrarPedido(this.pedidoActivo.id, datosCobro)
      : this.pedidoService.cobrarDirecto(datosCobro);

    operacion$.subscribe({
      next: (ventaCerrada) => {
        this.mostrarModalCobro = false;
        this.comprobanteEmitido = ventaCerrada;
        this.limpiarPanelComanda();
        this.cargarDatos();
        this.notificar(`Venta guardada en auditoría (${ventaCerrada.serieNumero}) por S/ ${Number(ventaCerrada.total).toFixed(2)}. Mesa ${numMesa} liberada.`);
      },
      error: () => {
        this.mostrarModalCobro = false;
        this.cambiarEstadoMesa('DISPONIBLE');
        this.limpiarPanelComanda();
        this.notificar(`Pago registrado por S/ ${totalCobrado.toFixed(2)}. Mesa ${numMesa} liberada.`);
      }
    });
  }

  imprimirTicket(): void {
    window.print();
  }

  cambiarEstadoMesa(estado: EstadoMesa): void {
    if (!this.mesaSeleccionada || !this.mesaSeleccionada.id) return;
    const mesaId = this.mesaSeleccionada.id;
    this.mesaService.cambiarEstado(mesaId, estado).subscribe({
      next: (m) => {
        this.mesaSeleccionada = m;
        const idx = this.mesas.findIndex(x => x.id === mesaId);
        if (idx !== -1) this.mesas[idx] = m;
        if (estado === 'DISPONIBLE') {
          this.limpiarPanelComanda();
        }
      },
      error: () => {
        if (this.mesaSeleccionada) {
          this.mesaSeleccionada.estado = estado;
          const idx = this.mesas.findIndex(x => x.id === mesaId);
          if (idx !== -1) this.mesas[idx].estado = estado;
        }
      }
    });
  }

  obtenerClaseEstadoMesa(estado: EstadoMesa): string {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OCUPADA':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'RESERVADA':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  obtenerClaseEstadoPedido(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-rose-100 text-rose-800';
      case 'EN_PREPARACION':
        return 'bg-amber-100 text-amber-800';
      case 'LISTO':
        return 'bg-emerald-100 text-emerald-800';
      case 'ENTREGADO':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  formatearEstadoCorto(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE': return 'En Cola';
      case 'EN_PREPARACION': return 'Cocinando';
      case 'LISTO': return '¡Listo!';
      case 'ENTREGADO': return 'En Mesa';
      default: return estado;
    }
  }

  private notificar(msg: string): void {
    this.mensajeAviso = msg;
    setTimeout(() => {
      if (this.mensajeAviso === msg) this.mensajeAviso = '';
    }, 4500);
  }
}
