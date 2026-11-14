import { Component } from '@angular/core';
import { AdminPlatosComponent } from './admin-platos.component';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [AdminPlatosComponent],
  template: `<app-admin-platos></app-admin-platos>`
})
export class AdminUsuariosComponent {}
