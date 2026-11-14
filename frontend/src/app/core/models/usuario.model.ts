export type RolUsuario = 'ADMIN' | 'MESERO' | 'COCINERO' | 'CAJERO';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}
