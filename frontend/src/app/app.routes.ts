import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { AdminPlatosComponent } from './features/admin/admin-platos.component';
import { AdminCategoriasComponent } from './features/admin/admin-categorias.component';
import { AdminMesasComponent } from './features/admin/admin-mesas.component';
import { AdminUsuariosComponent } from './features/admin/admin-usuarios.component';
import { AdminPedidosComponent } from './features/admin/admin-pedidos.component';
import { MeseroSalonComponent } from './features/mesero/mesero-salon.component';
import { CocinaKdsComponent } from './features/cocina/cocina-kds.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/platos', component: AdminPlatosComponent, data: { seccion: 'PLATOS' } },
  { path: 'admin/categorias', component: AdminCategoriasComponent, data: { seccion: 'CATEGORIAS' } },
  { path: 'admin/mesas', component: AdminMesasComponent, data: { seccion: 'MESAS' } },
  { path: 'admin/usuarios', component: AdminUsuariosComponent, data: { seccion: 'USUARIOS' } },
  { path: 'admin/pedidos', component: AdminPedidosComponent },
  { path: 'mesero/salon', component: MeseroSalonComponent },
  { path: 'cocina/kds', component: CocinaKdsComponent },
  { path: '**', redirectTo: 'login' }
];
