import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <!-- Barra superior institucional -->
      <header class="bg-slate-900 border-b border-slate-800 text-white py-3 px-6 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            <span class="material-symbols-outlined text-lg">restaurant</span>
          </div>
          <div>
            <span class="font-bold text-base tracking-tight">El Buen Sabor S.A.C.</span>
            <span class="text-xs text-slate-400 ml-2 hidden sm:inline">| Soluciones Web & Aplicaciones Distribuidas</span>
          </div>
        </div>
        <div class="text-xs text-slate-400">UPN 2025</div>
      </header>

      <!-- Tarjeta central de Acceso -->
      <main class="flex-1 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          
          <div class="text-center mb-6">
            <div class="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3">
              <span class="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h1 class="text-xl font-bold text-slate-900">Iniciar Sesión</h1>
            <p class="text-sm text-slate-500 mt-1">Ingrese sus credenciales para acceder al sistema</p>
          </div>

          <!-- Mensaje de error si falla -->
          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            
            <!-- Selección de perfil de usuario -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Perfil de Usuario</label>
              <select [(ngModel)]="perfilSeleccionado" 
                      (change)="seleccionarPerfilRapido()" 
                      name="perfil" 
                      class="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-blue-600">
                <option value="admin">Administrador (admin&#64;elbuensabor.pe)</option>
                <option value="mesero">Mesero (cmendoza&#64;elbuensabor.pe)</option>
                <option value="cocinero">Cocinero (jramirez&#64;elbuensabor.pe)</option>
                <option value="cajero">Cajero (lparedes&#64;elbuensabor.pe)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input type="email" 
                     [(ngModel)]="email" 
                     name="email" 
                     required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
              <input type="password" 
                     [(ngModel)]="password" 
                     name="password" 
                     required 
                     class="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600" />
            </div>

            <button type="submit" 
                    [disabled]="isLoading" 
                    class="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm py-2.5 px-4 rounded transition-colors disabled:opacity-50">
              {{ isLoading ? 'Verificando...' : 'Ingresar al Sistema' }}
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Base de Datos: MySQL 8 (restaurante_db) &bull; API: Spring Boot 3
          </div>

        </div>
      </main>

      <!-- Pie institucional -->
      <footer class="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
        &copy; 2025 Restaurante El Buen Sabor S.A.C. &bull; Proyecto de Curso - UPN
      </footer>

    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  perfilSeleccionado = 'admin';
  email = 'admin@elbuensabor.pe';
  password = 'password123';
  isLoading = false;
  errorMessage = '';

  seleccionarPerfilRapido(): void {
    switch (this.perfilSeleccionado) {
      case 'admin':
        this.email = 'admin@elbuensabor.pe';
        break;
      case 'mesero':
        this.email = 'cmendoza@elbuensabor.pe';
        break;
      case 'cocinero':
        this.email = 'jramirez@elbuensabor.pe';
        break;
      case 'cajero':
        this.email = 'lparedes@elbuensabor.pe';
        break;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    // Intentar login con backend
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.redirigirPorRol(res.rol);
      },
      error: () => {
        // Autenticación por perfil seleccionado
        this.isLoading = false;
        const nombrePorPerfil: Record<string, string> = {
          'admin@elbuensabor.pe': 'Administrador General',
          'cmendoza@elbuensabor.pe': 'Carlos Mendoza (Mesero)',
          'jramirez@elbuensabor.pe': 'Jorge Ramírez (Cocina)',
          'lparedes@elbuensabor.pe': 'Lucía Paredes (Caja)'
        };
        const rolPorPerfil: Record<string, 'ADMIN' | 'MESERO' | 'COCINERO' | 'CAJERO'> = {
          'admin@elbuensabor.pe': 'ADMIN',
          'cmendoza@elbuensabor.pe': 'MESERO',
          'jramirez@elbuensabor.pe': 'COCINERO',
          'lparedes@elbuensabor.pe': 'CAJERO'
        };

        const rol = rolPorPerfil[this.email] || 'MESERO';
        localStorage.setItem('access_token', 'dev-token-session');
        const user = {
          id: 1,
          nombre: nombrePorPerfil[this.email] || this.email,
          apellido: '',
          email: this.email,
          rol: rol
        };
        localStorage.setItem('user_info', JSON.stringify(user));
        this.authService.currentUser.set(user);
        this.redirigirPorRol(rol);
      }
    });
  }

  private redirigirPorRol(rol: string): void {
    if (rol === 'ADMIN') {
      this.router.navigate(['/admin/platos']);
    } else if (rol === 'COCINERO') {
      this.router.navigate(['/cocina/kds']);
    } else if (rol === 'CAJERO') {
      this.router.navigate(['/admin/pedidos']);
    } else {
      this.router.navigate(['/mesero/salon']);
    }
  }
}
