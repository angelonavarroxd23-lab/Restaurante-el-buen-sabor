import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/plato.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/categorias';

  listarCategorias(activas = true): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?activas=${activas}`);
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }
}
