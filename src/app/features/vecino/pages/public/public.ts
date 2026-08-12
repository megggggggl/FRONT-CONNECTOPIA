import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
@Component({
  selector: 'app-public-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public.html',
=======
import { PublicidadComponent } from '../../../../compartido/componentes/publicidad/publicidad.component';
@Component({
  selector: 'app-public-feed',
  standalone: true,
  imports: [CommonModule, PublicidadComponent],
  template: `
    <section class="mis-publicaciones-page">
      <header>
        <h1>Mis Publicaciones</h1>
        <p>Consulta y administra el contenido que has compartido.</p>
      </header>
      <app-publicidad [soloAutorActual]="true"></app-publicidad>
    </section>
  `,
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
  styleUrls: ['./public.css']
})
export class PublicPageComponent {
  // Aquí va la lógica de tu componente (copiala del archivo original)
  // Si tenías propiedades y métodos, asegúrate de mantenerlos.
}
