import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoMesa, Mesa } from '../models/mesa.model';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/mesas';

  listarMesas(estado?: EstadoMesa): Observable<Mesa[]> {
    const url = estado ? `${this.apiUrl}?estado=${estado}` : this.apiUrl;
    return this.http.get<Mesa[]>(url);
  }

  obtenerMesa(id: number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
  }

  crearMesa(mesa: Mesa): Observable<Mesa> {
    return this.http.post<Mesa>(this.apiUrl, mesa);
  }

  actualizarMesa(id: number, mesa: Mesa): Observable<Mesa> {
    return this.http.put<Mesa>(`${this.apiUrl}/${id}`, mesa);
  }

  cambiarEstado(id: number, estado: EstadoMesa): Observable<Mesa> {
    return this.http.patch<Mesa>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminarMesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
