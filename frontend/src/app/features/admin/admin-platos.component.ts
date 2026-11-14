import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../layout/navbar.component';
import { PlatoService } from '../../core/services/plato.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { MesaService } from '../../core/services/mesa.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Plato, Categoria } from '../../core/models/plato.model';
import { Mesa, EstadoMesa } from '../../core/models/mesa.model';
import { Usuario, RolUsuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-admin-platos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Carta, Mesas y Personal</h1>
          <p class="text-sm text-slate-500 mt-0.5">Administración de platos, categorías, mesas y usuarios del restaurante</p>
        </div>
        <div class="flex items-center space-x-2">
          <button (click)="cargarDatos()" 
                  class="inline-flex items-center space-x-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded transition-colors">
            <span class="material-symbols-outlined text-sm">refresh</span>
            <span>Actualizar</span>
          </button>
          <button *ngIf="seccionActiva === 'PLATOS'" (click)="abrirModalNuevoPlato()" 
                  class="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nuevo Plato</span>
          </button>
          <button *ngIf="seccionActiva === 'CATEGORIAS'" (click)="abrirModalNuevaCategoria()" 
                  class="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nueva Categoría</span>
          </button>
          <button *ngIf="seccionActiva === 'MESAS'" (click)="abrirModalNuevaMesa()" 
                  class="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nueva Mesa</span>
          </button>
          <button *ngIf="seccionActiva === 'USUARIOS'" (click)="abrirModalNuevoUsuario()" 
                  class="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded shadow-sm transition-colors">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <div class="mt-4 flex items-center space-x-2 border-b border-slate-200 overflow-x-auto">
        <button (click)="seccionActiva = 'PLATOS'"
                [class]="seccionActiva === 'PLATOS' ? 'border-b-2 border-blue-700 text-blue-800 font-semibold bg-blue-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                class="px-4 py-2.5 text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center space-x-1.5">
          <span class="material-symbols-outlined text-base">restaurant_menu</span>
          <span>Platos ({{ platos.length }})</span>
        </button>
        <button (click)="seccionActiva = 'CATEGORIAS'"
                [class]="seccionActiva === 'CATEGORIAS' ? 'border-b-2 border-blue-700 text-blue-800 font-semibold bg-blue-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                class="px-4 py-2.5 text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center space-x-1.5">
          <span class="material-symbols-outlined text-base">category</span>
          <span>Categorías ({{ categorias.length }})</span>
        </button>
        <button (click)="seccionActiva = 'MESAS'"
                [class]="seccionActiva === 'MESAS' ? 'border-b-2 border-blue-700 text-blue-800 font-semibold bg-blue-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                class="px-4 py-2.5 text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center space-x-1.5">
          <span class="material-symbols-outlined text-base">table_restaurant</span>
          <span>Mesas ({{ mesas.length }})</span>
        </button>
        <button (click)="seccionActiva = 'USUARIOS'"
                [class]="seccionActiva === 'USUARIOS' ? 'border-b-2 border-blue-700 text-blue-800 font-semibold bg-blue-50/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                class="px-4 py-2.5 text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center space-x-1.5">
          <span class="material-symbols-outlined text-base">group</span>
          <span>Usuarios ({{ usuarios.length }})</span>
        </button>
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

      <ng-container *ngIf="seccionActiva === 'PLATOS'">
        <div class="mt-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                          [class]="p.disponible ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'" 
                          class="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded border transition-colors cursor-pointer">
                    <span [class]="p.disponible ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                    <span>{{ p.disponible ? 'Disponible' : 'Agotado' }}</span>
                  </button>
                </td>
                <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button (click)="abrirModalEditarPlato(p)" 
                          class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Editar
                  </button>
                  <button (click)="solicitarEliminarPlato(p)" 
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
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {{ platosFiltrados.length }} de {{ platos.length }} platos registrados en tabla "plato"</span>
            
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="seccionActiva === 'CATEGORIAS'">
        <div class="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th class="py-3 px-4 w-16">ID</th>
                <th class="py-3 px-4">Nombre de Categoría</th>
                <th class="py-3 px-4">Descripción</th>
                <th class="py-3 px-4 text-center">Platos Asociados</th>
                <th class="py-3 px-4 text-center">Estado (1 clic)</th>
                <th class="py-3 px-4 text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let c of categorias" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-mono text-xs text-slate-500">#{{ c.id }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">{{ c.nombre }}</td>
                <td class="py-3 px-4 text-xs text-slate-600">{{ c.descripcion || 'Sin descripción' }}</td>
                <td class="py-3 px-4 text-center">
                  <span class="inline-block bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {{ contarPorCategoria(c.id) }} platos
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <button (click)="alternarEstadoCategoria(c)"
                          [class]="c.activa ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'"
                          class="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded border transition-colors cursor-pointer">
                    <span [class]="c.activa ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                    <span>{{ c.activa ? 'Activa' : 'Inactiva' }}</span>
                  </button>
                </td>
                <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button (click)="abrirModalEditarCategoria(c)" 
                          class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Editar
                  </button>
                  <button (click)="eliminarCategoria(c)" 
                          class="text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Total: {{ categorias.length }} categorías en tabla "categoria"</span>
            
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="seccionActiva === 'MESAS'">
        <div class="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th class="py-3 px-4 w-16">ID</th>
                <th class="py-3 px-4">N° de Mesa</th>
                <th class="py-3 px-4">Ubicación / Zona</th>
                <th class="py-3 px-4 text-center">Capacidad</th>
                <th class="py-3 px-4 text-center">Estado Actual</th>
                <th class="py-3 px-4 text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let m of mesas" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-mono text-xs text-slate-500">#{{ m.id }}</td>
                <td class="py-3 px-4 font-bold text-slate-900">Mesa {{ m.numero }}</td>
                <td class="py-3 px-4">
                  <span class="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded border border-slate-200">
                    {{ m.ubicacion || 'Salón Principal' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center text-xs font-medium text-slate-700">
                  {{ m.capacidad }} personas
                </td>
                <td class="py-3 px-4 text-center">
                  <span [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': m.estado === 'DISPONIBLE',
                    'bg-blue-50 text-blue-800 border-blue-200': m.estado === 'OCUPADA',
                    'bg-amber-50 text-amber-800 border-amber-200': m.estado === 'RESERVADA'
                  }" class="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded border">
                    {{ m.estado }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button (click)="abrirModalEditarMesa(m)" 
                          class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Editar
                  </button>
                  <button (click)="eliminarMesa(m)" 
                          class="text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Total: {{ mesas.length }} mesas registradas en tabla "mesa"</span>
            
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="seccionActiva === 'USUARIOS'">
        <div class="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th class="py-3 px-4 w-16">ID</th>
                <th class="py-3 px-4">Nombres y Apellidos</th>
                <th class="py-3 px-4">Correo Electrónico</th>
                <th class="py-3 px-4 text-center">Rol en el Sistema</th>
                <th class="py-3 px-4 text-center">Estado (1 clic)</th>
                <th class="py-3 px-4 text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of usuarios" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-mono text-xs text-slate-500">#{{ u.id }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">{{ u.nombre }} {{ u.apellido }}</td>
                <td class="py-3 px-4 font-mono text-xs text-slate-600">{{ u.email }}</td>
                <td class="py-3 px-4 text-center">
                  <span [ngClass]="{
                    'bg-slate-900 text-white border-slate-800': u.rol === 'ADMIN',
                    'bg-blue-50 text-blue-800 border-blue-200': u.rol === 'MESERO',
                    'bg-amber-50 text-amber-800 border-amber-200': u.rol === 'COCINERO',
                    'bg-emerald-50 text-emerald-800 border-emerald-200': u.rol === 'CAJERO'
                  }" class="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded border">
                    {{ u.rol }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <button (click)="alternarEstadoUsuario(u)"
                          [class]="u.activo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'"
                          class="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded border transition-colors cursor-pointer">
                    <span [class]="u.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                    <span>{{ u.activo !== false ? 'Activo' : 'Inactivo' }}</span>
                  </button>
                </td>
                <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button (click)="abrirModalEditarUsuario(u)" 
                          class="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Editar
                  </button>
                  <button (click)="eliminarUsuario(u)" 
                          class="text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium px-2.5 py-1 rounded transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>Total: {{ usuarios.length }} usuarios registrados en tabla "usuario"</span>
            
          </div>
        </div>
      </ng-container>

    </main>

    <div *ngIf="mostrarModalPlato" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-lg p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 class="text-base font-bold text-slate-900">
            {{ editandoPlatoId ? 'Editar Plato #' + editandoPlatoId : 'Registrar Nuevo Plato en Carta' }}
          </h2>
          <button (click)="mostrarModalPlato = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form (ngSubmit)="guardarPlato()" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Plato *</label>
            <input type="text" [(ngModel)]="formPlato.nombre" name="nombre" required 
                   placeholder="Ej: Seco de Res con Frejoles"
                   class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Categoría *</label>
              <select [(ngModel)]="formPlato.categoria.id" name="categoriaId" required 
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600 bg-white">
                <option *ngFor="let cat of categorias" [ngValue]="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Precio de Venta (S/) *</label>
              <input type="number" step="0.50" min="1" [(ngModel)]="formPlato.precio" name="precio" required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción / Ingredientes</label>
            <textarea [(ngModel)]="formPlato.descripcion" name="descripcion" rows="2" 
                      placeholder="Detalle breve de la preparación o guarnición..."
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"></textarea>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input type="checkbox" id="chkDisponible" [(ngModel)]="formPlato.disponible" name="disponible"
                   class="rounded border-slate-300 text-blue-700 focus:ring-blue-600 h-4 w-4" />
            <label for="chkDisponible" class="text-xs font-medium text-slate-700 cursor-pointer">
              Habilitado para toma de comandas en salón
            </label>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="mostrarModalPlato = false" 
                    class="px-4 py-2 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-medium">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!formPlato.nombre || formPlato.precio <= 0"
                    class="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded font-medium shadow-sm disabled:opacity-50">
              {{ editandoPlatoId ? 'Guardar Cambios' : 'Registrar Plato' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="mostrarModalCategoria" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 class="text-base font-bold text-slate-900">
            {{ editandoCategoriaId ? 'Editar Categoría #' + editandoCategoriaId : 'Registrar Nueva Categoría' }}
          </h2>
          <button (click)="mostrarModalCategoria = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form (ngSubmit)="guardarCategoria()" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Categoría *</label>
            <input type="text" [(ngModel)]="formCategoria.nombre" name="catNombre" required 
                   placeholder="Ej: Parrillas / Sopas"
                   class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea [(ngModel)]="formCategoria.descripcion" name="catDescripcion" rows="2" 
                      placeholder="Descripción de los platos que agrupa..."
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"></textarea>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input type="checkbox" id="chkCatActiva" [(ngModel)]="formCategoria.activa" name="catActiva"
                   class="rounded border-slate-300 text-blue-700 focus:ring-blue-600 h-4 w-4" />
            <label for="chkCatActiva" class="text-xs font-medium text-slate-700 cursor-pointer">
              Categoría activa en el menú
            </label>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="mostrarModalCategoria = false" 
                    class="px-4 py-2 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-medium">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!formCategoria.nombre"
                    class="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded font-medium shadow-sm disabled:opacity-50">
              {{ editandoCategoriaId ? 'Guardar Cambios' : 'Registrar Categoría' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="mostrarModalMesa" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 class="text-base font-bold text-slate-900">
            {{ editandoMesaId ? 'Editar Mesa #' + formMesa.numero : 'Registrar Nueva Mesa' }}
          </h2>
          <button (click)="mostrarModalMesa = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form (ngSubmit)="guardarMesa()" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Número de Mesa *</label>
              <input type="number" min="1" [(ngModel)]="formMesa.numero" name="mesaNumero" required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Capacidad (Personas) *</label>
              <input type="number" min="1" max="20" [(ngModel)]="formMesa.capacidad" name="mesaCapacidad" required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Ubicación / Zona *</label>
            <select [(ngModel)]="formMesa.ubicacion" name="mesaUbicacion" required
                    class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-600">
              <option value="Salón Principal">Salón Principal</option>
              <option value="Terraza">Terraza</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Estado Operativo *</label>
            <select [(ngModel)]="formMesa.estado" name="mesaEstado" required
                    class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-600">
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="OCUPADA">OCUPADA</option>
              <option value="RESERVADA">RESERVADA</option>
            </select>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="mostrarModalMesa = false" 
                    class="px-4 py-2 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-medium">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="formMesa.numero <= 0 || formMesa.capacidad <= 0"
                    class="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded font-medium shadow-sm disabled:opacity-50">
              {{ editandoMesaId ? 'Guardar Cambios' : 'Registrar Mesa' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="mostrarModalUsuario" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-lg p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 class="text-base font-bold text-slate-900">
            {{ editandoUsuarioId ? 'Editar Usuario #' + editandoUsuarioId : 'Registrar Nuevo Empleado / Usuario' }}
          </h2>
          <button (click)="mostrarModalUsuario = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form (ngSubmit)="guardarUsuario()" class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
              <input type="text" [(ngModel)]="formUsuario.nombre" name="usuNombre" required 
                     placeholder="Ej: Luis"
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
              <input type="text" [(ngModel)]="formUsuario.apellido" name="usuApellido" required 
                     placeholder="Ej: Torres"
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
              <input type="email" [(ngModel)]="formUsuario.email" name="usuEmail" required 
                     placeholder="ltorres@elbuensabor.pe"
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Rol en el Sistema *</label>
              <select [(ngModel)]="formUsuario.rol" name="usuRol" required
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-600">
                <option value="ADMIN">ADMIN (Administrador)</option>
                <option value="MESERO">MESERO (Salón y Comandas)</option>
                <option value="COCINERO">COCINERO (Cocina KDS)</option>
                <option value="CAJERO">CAJERO (Caja y Facturación)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              {{ editandoUsuarioId ? 'Nueva Contraseña (dejar vacío para mantener la actual)' : 'Contraseña de Acceso *' }}
            </label>
            <input type="password" [(ngModel)]="formUsuario.password" name="usuPassword" 
                   placeholder="Por defecto: password123"
                   class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input type="checkbox" id="chkUsuActivo" [(ngModel)]="formUsuario.activo" name="usuActivo"
                   class="rounded border-slate-300 text-blue-700 focus:ring-blue-600 h-4 w-4" />
            <label for="chkUsuActivo" class="text-xs font-medium text-slate-700 cursor-pointer">
              Cuenta habilitada para iniciar sesión
            </label>
          </div>

          <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="mostrarModalUsuario = false" 
                    class="px-4 py-2 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded font-medium">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!formUsuario.nombre || !formUsuario.apellido || !formUsuario.email"
                    class="px-4 py-2 text-xs text-white bg-blue-700 hover:bg-blue-800 rounded font-medium shadow-sm disabled:opacity-50">
              {{ editandoUsuarioId ? 'Guardar Cambios' : 'Registrar Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
          <button (click)="ejecutarEliminarPlato()"
                  class="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded">
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminPlatosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platoService = inject(PlatoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly mesaService = inject(MesaService);
  private readonly usuarioService = inject(UsuarioService);

  seccionActiva: 'PLATOS' | 'CATEGORIAS' | 'MESAS' | 'USUARIOS' = 'PLATOS';

  platos: Plato[] = [];
  categorias: Categoria[] = [
    { id: 1, nombre: 'Entradas', descripcion: 'Platos de entrada y piqueos', activa: true },
    { id: 2, nombre: 'Platos de Fondo', descripcion: 'Especialidades principales de la casa', activa: true },
    { id: 3, nombre: 'Bebidas', descripcion: 'Refrescos naturales, gaseosas y coctelería', activa: true },
    { id: 4, nombre: 'Postres', descripcion: 'Dulces tradicionales peruanos', activa: true }
  ];
  mesas: Mesa[] = [];
  usuarios: Usuario[] = [];

  categoriaFiltro = 0;
  terminoBusqueda = '';
  estadoFiltro: 'TODOS' | 'DISPONIBLES' | 'AGOTADOS' = 'TODOS';
  mensajeAviso = '';

  mostrarModalPlato = false;
  editandoPlatoId: number | null = null;
  platoPorEliminar: Plato | null = null;
  formPlato: Plato = this.limpiarFormPlato();

  mostrarModalCategoria = false;
  editandoCategoriaId: number | null = null;
  formCategoria: Categoria = { id: 0, nombre: '', descripcion: '', activa: true };

  mostrarModalMesa = false;
  editandoMesaId: number | null = null;
  formMesa: Mesa = { numero: 11, capacidad: 4, ubicacion: 'Salón Principal', estado: 'DISPONIBLE' };

  mostrarModalUsuario = false;
  editandoUsuarioId: number | null = null;
  formUsuario: Usuario = { nombre: '', apellido: '', email: '', password: 'password123', rol: 'MESERO', activo: true };

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
    const seccionRuta = this.route.snapshot.data['seccion'] as 'PLATOS' | 'CATEGORIAS' | 'MESAS' | 'USUARIOS' | undefined;
    if (seccionRuta) {
      this.seccionActiva = seccionRuta;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) this.categorias = cats;
      }
    });

    this.platoService.listarPlatos().subscribe({
      next: (data) => (this.platos = data)
    });

    this.mesaService.listarMesas().subscribe({
      next: (data) => (this.mesas = data.sort((a, b) => a.numero - b.numero))
    });

    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => (this.usuarios = data)
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
      }
    });
  }

  abrirModalNuevoPlato(): void {
    this.editandoPlatoId = null;
    this.formPlato = this.limpiarFormPlato();
    this.mostrarModalPlato = true;
  }

  abrirModalEditarPlato(p: Plato): void {
    this.editandoPlatoId = p.id ?? null;
    this.formPlato = {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      disponible: p.disponible,
      categoria: { ...(p.categoria || this.categorias[0] || { id: 1, nombre: 'Entradas', activa: true }) }
    };
    this.mostrarModalPlato = true;
  }

  guardarPlato(): void {
    const cat = this.categorias.find(c => Number(c.id) === Number(this.formPlato.categoria.id));
    if (cat) this.formPlato.categoria = { ...cat };

    if (this.editandoPlatoId) {
      this.platoService.actualizarPlato(this.editandoPlatoId, this.formPlato).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarModalPlato = false;
          this.notificar(`Plato "${this.formPlato.nombre}" actualizado correctamente.`);
        }
      });
    } else {
      this.platoService.crearPlato(this.formPlato).subscribe({
        next: (creado) => {
          this.cargarDatos();
          this.mostrarModalPlato = false;
          this.notificar(`Nuevo plato "${creado.nombre}" registrado (#${creado.id}).`);
        }
      });
    }
  }

  solicitarEliminarPlato(p: Plato): void {
    this.platoPorEliminar = p;
  }

  ejecutarEliminarPlato(): void {
    if (!this.platoPorEliminar || !this.platoPorEliminar.id) return;
    const id = this.platoPorEliminar.id;
    const nombre = this.platoPorEliminar.nombre;

    this.platoService.eliminarPlato(id).subscribe({
      next: () => {
        this.platoPorEliminar = null;
        this.cargarDatos();
        this.notificar(`El plato "${nombre}" fue eliminado de la carta.`);
      }
    });
  }

  abrirModalNuevaCategoria(): void {
    this.editandoCategoriaId = null;
    this.formCategoria = { id: 0, nombre: '', descripcion: '', activa: true };
    this.mostrarModalCategoria = true;
  }

  abrirModalEditarCategoria(c: Categoria): void {
    this.editandoCategoriaId = c.id;
    this.formCategoria = { ...c };
    this.mostrarModalCategoria = true;
  }

  guardarCategoria(): void {
    if (this.editandoCategoriaId) {
      this.categoriaService.actualizarCategoria(this.editandoCategoriaId, this.formCategoria).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarModalCategoria = false;
          this.notificar(`Categoría "${this.formCategoria.nombre}" actualizada.`);
        }
      });
    } else {
      this.categoriaService.crearCategoria({
        nombre: this.formCategoria.nombre,
        descripcion: this.formCategoria.descripcion,
        activa: this.formCategoria.activa
      }).subscribe({
        next: (creada) => {
          this.cargarDatos();
          this.mostrarModalCategoria = false;
          this.notificar(`Nueva categoría "${creada.nombre}" registrada (#${creada.id}).`);
        }
      });
    }
  }

  alternarEstadoCategoria(c: Categoria): void {
    const actualizado = { ...c, activa: !c.activa };
    this.categoriaService.actualizarCategoria(c.id, actualizado).subscribe({
      next: (res) => {
        c.activa = res.activa;
        this.notificar(`Categoría "${c.nombre}" cambiada a ${c.activa ? 'Activa' : 'Inactiva'}.`);
      }
    });
  }

  eliminarCategoria(c: Categoria): void {
    this.categoriaService.eliminarCategoria(c.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificar(`Categoría "${c.nombre}" eliminada correctamente.`);
      }
    });
  }

  abrirModalNuevaMesa(): void {
    this.editandoMesaId = null;
    const maxNum = this.mesas.reduce((max, m) => (m.numero > max ? m.numero : max), 0);
    this.formMesa = {
      numero: maxNum + 1,
      capacidad: 4,
      ubicacion: 'Salón Principal',
      estado: 'DISPONIBLE'
    };
    this.mostrarModalMesa = true;
  }

  abrirModalEditarMesa(m: Mesa): void {
    this.editandoMesaId = m.id ?? null;
    this.formMesa = { ...m };
    this.mostrarModalMesa = true;
  }

  guardarMesa(): void {
    if (this.editandoMesaId) {
      this.mesaService.actualizarMesa(this.editandoMesaId, this.formMesa).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarModalMesa = false;
          this.notificar(`Mesa ${this.formMesa.numero} actualizada correctamente.`);
        }
      });
    } else {
      this.mesaService.crearMesa(this.formMesa).subscribe({
        next: (creada) => {
          this.cargarDatos();
          this.mostrarModalMesa = false;
          this.notificar(`Nueva Mesa ${creada.numero} registrada en ${creada.ubicacion}.`);
        }
      });
    }
  }

  eliminarMesa(m: Mesa): void {
    if (!m.id) return;
    this.mesaService.eliminarMesa(m.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificar(`Mesa ${m.numero} eliminada de la base de datos.`);
      }
    });
  }

  abrirModalNuevoUsuario(): void {
    this.editandoUsuarioId = null;
    this.formUsuario = {
      nombre: '',
      apellido: '',
      email: '',
      password: 'password123',
      rol: 'MESERO',
      activo: true
    };
    this.mostrarModalUsuario = true;
  }

  abrirModalEditarUsuario(u: Usuario): void {
    this.editandoUsuarioId = u.id ?? null;
    this.formUsuario = {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: '',
      rol: u.rol,
      activo: u.activo !== false
    };
    this.mostrarModalUsuario = true;
  }

  guardarUsuario(): void {
    if (this.editandoUsuarioId) {
      this.usuarioService.actualizarUsuario(this.editandoUsuarioId, this.formUsuario).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarModalUsuario = false;
          this.notificar(`Datos del usuario "${this.formUsuario.nombre} ${this.formUsuario.apellido}" actualizados.`);
        }
      });
    } else {
      this.usuarioService.crearUsuario(this.formUsuario).subscribe({
        next: (creado) => {
          this.cargarDatos();
          this.mostrarModalUsuario = false;
          this.notificar(`Nuevo usuario "${creado.nombre} ${creado.apellido}" (${creado.rol}) registrado.`);
        }
      });
    }
  }

  alternarEstadoUsuario(u: Usuario): void {
    if (!u.id) return;
    const actualizado: Usuario = { ...u, activo: !(u.activo !== false), password: '' };
    this.usuarioService.actualizarUsuario(u.id, actualizado).subscribe({
      next: (res) => {
        u.activo = res.activo;
        this.notificar(`Estado de "${u.nombre} ${u.apellido}" cambiado a ${u.activo ? 'Activo' : 'Inactivo'}.`);
      }
    });
  }

  eliminarUsuario(u: Usuario): void {
    if (!u.id) return;
    this.usuarioService.eliminarUsuario(u.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificar(`Usuario "${u.nombre} ${u.apellido}" eliminado.`);
      }
    });
  }

  private notificar(msg: string): void {
    this.mensajeAviso = msg;
    setTimeout(() => {
      if (this.mensajeAviso === msg) this.mensajeAviso = '';
    }, 4000);
  }

  private limpiarFormPlato(): Plato {
    return {
      nombre: '',
      descripcion: '',
      precio: 25,
      disponible: true,
      categoria: this.categorias[0] ? { ...this.categorias[0] } : { id: 2, nombre: 'Platos de Fondo', activa: true }
    };
  }
}
