import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plato } from '../models/plato.model';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/platos';

  listarPlatos(): Observable<Plato[]> {
    return this.http.get<Plato[]>(this.apiUrl);
  }

  listarPorCategoria(categoriaId: number): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  crearPlato(plato: Plato): Observable<Plato> {
    return this.http.post<Plato>(this.apiUrl, plato);
  }

  actualizarPlato(id: number, plato: Plato): Observable<Plato> {
    return this.http.put<Plato>(`${this.apiUrl}/${id}`, plato);
  }

  cambiarDisponibilidad(id: number, disponible: boolean): Observable<Plato> {
    return this.http.patch<Plato>(`${this.apiUrl}/${id}/disponibilidad?disponible=${disponible}`, {});
  }

  eliminarPlato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
