import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoPedido, Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/pedidos';

  listarPedidos(estado?: EstadoPedido): Observable<Pedido[]> {
    const url = estado ? `${this.apiUrl}?estado=${estado}` : this.apiUrl;
    return this.http.get<Pedido[]>(url);
  }

  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  obtenerActivoPorMesa(mesaId: number): Observable<Pedido | null> {
    return this.http.get<Pedido | null>(`${this.apiUrl}/mesa/${mesaId}/activo`);
  }

  crearPedido(pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  actualizarPedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido);
  }

  cobrarPedido(id: number, datosCobro: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/${id}/cobrar`, datosCobro);
  }

  cobrarDirecto(datosCobro: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/cobrar-directo`, datosCobro);
  }

  actualizarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
