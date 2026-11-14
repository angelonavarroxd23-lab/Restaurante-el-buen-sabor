import { Component } from '@angular/core';
import { AdminPlatosComponent } from './admin-platos.component';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [AdminPlatosComponent],
  template: `<app-admin-platos></app-admin-platos>`
})
export class AdminCategoriasComponent {}
