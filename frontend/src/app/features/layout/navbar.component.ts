import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded bg-blue-700 flex items-center justify-center text-white border border-blue-600">
              <span class="material-symbols-outlined text-lg">restaurant</span>
            </div>
            <div>
              <span class="font-bold text-base tracking-tight text-white">El Buen Sabor</span>
              <span class="text-xs text-slate-400 ml-2 hidden lg:inline">| Sistema de Gestión</span>
            </div>
          </div>

          <nav class="flex items-center space-x-1 overflow-x-auto">
            <a routerLink="/admin/platos" 
               routerLinkActive="bg-blue-800 text-white font-medium border-blue-700" 
               class="px-3 py-1.5 rounded text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent transition-colors whitespace-nowrap">
              Administración
            </a>
            <a routerLink="/mesero/salon" 
               routerLinkActive="bg-blue-800 text-white font-medium border-blue-700" 
               class="px-3 py-1.5 rounded text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent transition-colors whitespace-nowrap">
              Salón y Comandas
            </a>
            <a routerLink="/cocina/kds" 
               routerLinkActive="bg-blue-800 text-white font-medium border-blue-700" 
               class="px-3 py-1.5 rounded text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent transition-colors whitespace-nowrap">
              Cocina (KDS)
            </a>
            <a routerLink="/admin/pedidos" 
               routerLinkActive="bg-blue-800 text-white font-medium border-blue-700" 
               class="px-3 py-1.5 rounded text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent transition-colors whitespace-nowrap">
              Caja y Pedidos
            </a>
          </nav>

          <div class="flex items-center space-x-3">
            <div class="hidden md:flex flex-col text-right">
              <span class="text-xs font-semibold text-white leading-tight">
                {{ authService.currentUser()?.nombre || 'Administrador' }}
              </span>
              <span class="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                Perfil: {{ authService.currentUser()?.rol || 'ADMIN' }}
              </span>
            </div>
            <button (click)="logout()" 
                    title="Cambiar de usuario o cerrar sesión"
                    class="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1.5 rounded border border-slate-700 transition-colors">
              <span class="material-symbols-outlined text-sm">logout</span>
              <span class="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
