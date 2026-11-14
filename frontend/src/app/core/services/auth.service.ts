import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api/auth';

  readonly currentUser = signal<Usuario | null>(this.getStoredUser());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.token);
        const user: Usuario = {
          id: res.id,
          nombre: res.nombre,
          apellido: '',
          email: res.email,
          rol: res.rol
        };
        localStorage.setItem('user_info', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getRole(): string {
    return this.currentUser()?.rol ?? '';
  }

  private getStoredUser(): Usuario | null {
    const raw = localStorage.getItem('user_info');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
