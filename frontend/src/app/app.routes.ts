import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { AdminPlatosComponent } from './features/admin/admin-platos.component';
import { AdminPedidosComponent } from './features/admin/admin-pedidos.component';
import { MeseroSalonComponent } from './features/mesero/mesero-salon.component';
import { CocinaKdsComponent } from './features/cocina/cocina-kds.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/platos', component: AdminPlatosComponent },
  { path: 'admin/pedidos', component: AdminPedidosComponent },
  { path: 'mesero/salon', component: MeseroSalonComponent },
  { path: 'cocina/kds', component: CocinaKdsComponent },
  { path: '**', redirectTo: 'login' }
];
