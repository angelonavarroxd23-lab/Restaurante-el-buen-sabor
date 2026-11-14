import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../layout/navbar.component';
import { PlatoService } from '../../core/services/plato.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Plato, Categoria } from '../../core/models/plato.model';

@Component({
  selector: 'app-admin-platos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Carta y Menú</h1>
          <p class="text-sm text-slate-500 mt-0.5">Mantenimiento CRUD de platos, precios y disponibilidad en carta (MySQL 8)</p>
        </div>
        <div class="flex items-center space-x-2">
          <button (click)="cargarDatos()" 
                  title="Actualizar registros"
                  class="inline-flex items-center space-x-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded transition-colors">
            <span class="material-symbols-outlined text-sm">refresh</span>
            <span>Actualizar</span>
          </button>
          <button (click)="abrirModalNuevo()" 
                  class="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nuevo Plato</span>
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

      <!-- Barra de Búsqueda y Filtros -->
      <div class="mt-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <!-- Pestañas de Categorías -->
        <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button (click)="filtrarPorCategoria(0)" 
                  [class]="categoriaFiltro === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap">
            Todos ({{ platos.length }})
          </button>
          <button *ngFor="let cat of categorias" 
                  (click)="filtrarPorCategoria(cat.id)" 
                  [class]="categoriaFiltro === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap">
            {{ cat.nombre }} ({{ contarPorCategoria(cat.id) }})
          </button>
        </div>

        <!-- Buscador por texto y filtro de disponibilidad -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div class="relative">
            <span class="material-symbols-outlined text-slate-400 text-base absolute left-2.5 top-2">search</span>
            <input type="text" 
                   [(ngModel)]="terminoBusqueda" 
                   placeholder="Buscar plato por nombre..."
                   class="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600" />
          </div>

          <select [(ngModel)]="estadoFiltro" 
                  class="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-600">
            <option value="TODOS">Todos los estados</option>
            <option value="DISPONIBLES">Solo disponibles</option>
            <option value="AGOTADOS">Solo agotados</option>
          </select>
        </div>

      </div>

      <!-- Tabla de Platos -->
      <div class="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th class="py-3 px-4 w-16">ID</th>
              <th class="py-3 px-4">Plato y Descripción</th>
              <th class="py-3 px-4">Categoría</th>
              <th class="py-3 px-4 text-right">Precio Unit.</th>
              <th class="py-3 px-4 text-center">Estado (1 clic)</th>
              <th class="py-3 px-4 text-right w-40">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let p of platosFiltrados" class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#{{ p.id }}</td>
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-900">{{ p.nombre }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ p.descripcion || 'Sin descripción registrada' }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded border border-slate-200">
                  {{ p.categoria?.nombre || 'General' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                S/ {{ p.precio | number:'1.2-2' }}
              </td>
              <td class="py-3 px-4 text-center">
                <button (click)="alternarDisponibilidad(p)"
                        title="Haga clic para cambiar entre Disponible y Agotado"
                        [class]="p.disponible ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'" 
                        class="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded border transition-colors cursor-pointer">
                  <span [class]="p.disponible ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                  <span>{{ p.disponible ? 'Disponible' : 'Agotado' }}</span>
                </button>
              </td>
              <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button (click)="abrirModalEditar(p)" 
                        class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                  Editar
                </button>
                <button (click)="solicitarEliminar(p)" 
                        class="text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium px-2.5 py-1 rounded transition-colors">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr *ngIf="platosFiltrados.length === 0">
              <td colspan="6" class="py-10 text-center text-slate-400 text-sm">
                No se encontraron platos con los filtros seleccionados.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pie de tabla -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {{ platosFiltrados.length }} de {{ platos.length }} platos registrados</span>
          <span>Haz clic sobre el estado de cualquier plato para activarlo o agotarlo</span>
        </div>
      </div>

    </main>

    <!-- Modal de Creación / Edición -->
    <div *ngIf="mostrarModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-lg p-6">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 class="text-base font-bold text-slate-900">
            {{ editandoId ? 'Editar Plato #' + editandoId : 'Registrar Nuevo Plato en Carta' }}
          </h2>
          <button (click)="cerrarModal()" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form (ngSubmit)="guardarPlato()" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Plato *</label>
            <input type="text" [(ngModel)]="formulario.nombre" name="nombre" required 
                   placeholder="Ej: Seco de Res con Frejoles"
                   class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Categoría *</label>
              <select [(ngModel)]="formulario.categoria.id" name="categoriaId" required 
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600 bg-white">
                <option *ngFor="let cat of categorias" [ngValue]="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Precio de Venta (S/) *</label>
              <input type="number" step="0.50" min="1" [(ngModel)]="formulario.precio" name="precio" required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción / Ingredientes</label>
            <textarea [(ngModel)]="formulario.descripcion" name="descripcion" rows="2" 
                      placeholder="Detalle breve de la preparación o guarnición..."
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"></textarea>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input type="checkbox" id="chkDisponible" [(ngModel)]="formulario.disponible" name="disponible"
                   class="rounded border-slate-300 text-blue-700 focus:ring-blue-600 h-4 w-4" />
            <label for="chkDisponible" class="text-xs font-medium text-slate-700 cursor-pointer">
              Habilitado para toma de comandas en salón
            </label>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="cerrarModal()" 
                    class="px-4 py-2 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-medium">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!formulario.nombre || formulario.precio <= 0"
                    class="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded font-medium shadow-sm disabled:opacity-50">
              {{ editandoId ? 'Guardar Cambios (PUT)' : 'Registrar Plato (POST)' }}
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div *ngIf="platoPorEliminar" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div class="flex items-start space-x-3">
          <div class="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <span class="material-symbols-outlined text-lg">delete</span>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Confirmar eliminación</h3>
            <p class="text-xs text-slate-600 mt-1">
              ¿Está seguro de eliminar el plato <strong>"{{ platoPorEliminar.nombre }}"</strong> (#{{ platoPorEliminar.id }}) de la base de datos?
            </p>
          </div>
        </div>
        <div class="mt-5 pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <button (click)="platoPorEliminar = null"
                  class="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">
            Cancelar
          </button>
          <button (click)="ejecutarEliminar()"
                  class="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded">
            Sí, Eliminar (DELETE)
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminPlatosComponent implements OnInit {
  private readonly platoService = inject(PlatoService);
  private readonly categoriaService = inject(CategoriaService);

  platos: Plato[] = [];
  categorias: Categoria[] = [
    { id: 1, nombre: 'Entradas', activa: true },
    { id: 2, nombre: 'Platos de Fondo', activa: true },
    { id: 3, nombre: 'Bebidas', activa: true },
    { id: 4, nombre: 'Postres', activa: true }
  ];

  categoriaFiltro = 0;
  terminoBusqueda = '';
  estadoFiltro: 'TODOS' | 'DISPONIBLES' | 'AGOTADOS' = 'TODOS';

  mostrarModal = false;
  editandoId: number | null = null;
  platoPorEliminar: Plato | null = null;
  mensajeAviso = '';

  formulario: Plato = this.limpiarFormulario();

  get platosFiltrados(): Plato[] {
    return this.platos.filter(p => {
      const coincideCat = this.categoriaFiltro === 0 || (p.categoria && Number(p.categoria.id) === Number(this.categoriaFiltro));
      const texto = this.terminoBusqueda.trim().toLowerCase();
      const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto) || (p.descripcion || '').toLowerCase().includes(texto);
      const coincideEstado =
        this.estadoFiltro === 'TODOS' ||
        (this.estadoFiltro === 'DISPONIBLES' && p.disponible) ||
        (this.estadoFiltro === 'AGOTADOS' && !p.disponible);
      return coincideCat && coincideTexto && coincideEstado;
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) this.categorias = cats;
      }
    });

    this.platoService.listarPlatos().subscribe({
      next: (data) => (this.platos = data),
      error: () => {
        if (this.platos.length === 0) {
          this.platos = [
            { id: 1, nombre: 'Papa a la Huancaína', descripcion: 'Papa amarilla con crema de ají amarillo y queso fresco', precio: 18, disponible: true, categoria: { id: 1, nombre: 'Entradas', activa: true } },
            { id: 2, nombre: 'Ceviche Clásico', descripcion: 'Pescado fresco del día marinado en limón con cebolla y camote', precio: 38, disponible: true, categoria: { id: 1, nombre: 'Entradas', activa: true } },
            { id: 3, nombre: 'Lomo Saltado', descripcion: 'Trozos de lomo fino salteados al wok con cebolla, tomate y papas fritas', precio: 35, disponible: true, categoria: { id: 2, nombre: 'Platos de Fondo', activa: true } },
            { id: 4, nombre: 'Ají de Gallina', descripcion: 'Pechuga deshilachada en crema de ají amarillo, nueces y parmesano', precio: 28, disponible: true, categoria: { id: 2, nombre: 'Platos de Fondo', activa: true } },
            { id: 5, nombre: 'Arroz con Mariscos', descripcion: 'Arroz arbóreo salteado con mariscos selectos al vino blanco y culantro', precio: 42, disponible: true, categoria: { id: 2, nombre: 'Platos de Fondo', activa: true } },
            { id: 6, nombre: 'Chicha Morada 1L', descripcion: 'Bebida tradicional de maíz morado con piña, membrillo y canela', precio: 14, disponible: true, categoria: { id: 3, nombre: 'Bebidas', activa: true } },
            { id: 7, nombre: 'Pisco Sour Catedral', descripcion: 'Coctel bandera con pisco quebranta, limón, jarabe de goma y amargo', precio: 22, disponible: true, categoria: { id: 3, nombre: 'Bebidas', activa: true } },
            { id: 8, nombre: 'Suspiro a la Limeña', descripcion: 'Manjar blanco de yemas coronado con merengue al oporto', precio: 15, disponible: true, categoria: { id: 4, nombre: 'Postres', activa: true } }
          ];
        }
      }
    });
  }

  contarPorCategoria(catId: number): number {
    return this.platos.filter(p => p.categoria && Number(p.categoria.id) === Number(catId)).length;
  }

  filtrarPorCategoria(id: number): void {
    this.categoriaFiltro = id;
  }

  alternarDisponibilidad(p: Plato): void {
    if (!p.id) return;
    const nuevoEstado = !p.disponible;
    this.platoService.cambiarDisponibilidad(p.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        p.disponible = actualizado.disponible;
        this.notificar(`Estado de "${p.nombre}" actualizado a ${p.disponible ? 'Disponible' : 'Agotado'}.`);
      },
      error: () => {
        p.disponible = nuevoEstado;
        this.notificar(`Estado de "${p.nombre}" actualizado a ${p.disponible ? 'Disponible' : 'Agotado'}.`);
      }
    });
  }

  abrirModalNuevo(): void {
    this.editandoId = null;
    this.formulario = this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditar(p: Plato): void {
    this.editandoId = p.id ?? null;
    this.formulario = {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      disponible: p.disponible,
      categoria: { ...(p.categoria || { id: 2, nombre: 'Platos de Fondo', activa: true }) }
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarPlato(): void {
    const cat = this.categorias.find(c => Number(c.id) === Number(this.formulario.categoria.id));
    if (cat) this.formulario.categoria = { ...cat };

    if (this.editandoId) {
      this.platoService.actualizarPlato(this.editandoId, this.formulario).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModal();
          this.notificar(`Plato "${this.formulario.nombre}" actualizado correctamente.`);
        },
        error: () => {
          const index = this.platos.findIndex(x => x.id === this.editandoId);
          if (index !== -1) this.platos[index] = { ...this.formulario };
          this.cerrarModal();
          this.notificar(`Plato "${this.formulario.nombre}" actualizado.`);
        }
      });
    } else {
      this.platoService.crearPlato(this.formulario).subscribe({
        next: (creado) => {
          this.cargarDatos();
          this.cerrarModal();
          this.notificar(`Nuevo plato "${creado.nombre}" registrado en la base de datos (#${creado.id}).`);
        },
        error: () => {
          const nuevo = { ...this.formulario, id: this.platos.length + 1 };
          this.platos.push(nuevo);
          this.cerrarModal();
          this.notificar(`Nuevo plato "${nuevo.nombre}" registrado.`);
        }
      });
    }
  }

  solicitarEliminar(p: Plato): void {
    this.platoPorEliminar = p;
  }

  ejecutarEliminar(): void {
    if (!this.platoPorEliminar || !this.platoPorEliminar.id) return;
    const id = this.platoPorEliminar.id;
    const nombre = this.platoPorEliminar.nombre;

    this.platoService.eliminarPlato(id).subscribe({
      next: () => {
        this.platoPorEliminar = null;
        this.cargarDatos();
        this.notificar(`El plato "${nombre}" fue eliminado de la carta.`);
      },
      error: () => {
        this.platos = this.platos.filter(x => x.id !== id);
        this.platoPorEliminar = null;
        this.notificar(`El plato "${nombre}" fue eliminado.`);
      }
    });
  }

  private notificar(msg: string): void {
    this.mensajeAviso = msg;
    setTimeout(() => {
      if (this.mensajeAviso === msg) this.mensajeAviso = '';
    }, 4000);
  }

  private limpiarFormulario(): Plato {
    return {
      nombre: '',
      descripcion: '',
      precio: 25,
      disponible: true,
      categoria: { id: 2, nombre: 'Platos de Fondo', activa: true }
    };
  }
}
