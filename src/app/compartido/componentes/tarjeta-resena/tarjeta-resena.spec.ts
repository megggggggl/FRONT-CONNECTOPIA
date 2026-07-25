import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaResena } from './tarjeta-resena';

describe('TarjetaResena', () => {
  let component: TarjetaResena;
  let fixture: ComponentFixture<TarjetaResena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaResena],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaResena);
    component = fixture.componentInstance;
    component.resena = {
      author: null,
      servicio_nombre: 'Servicio',
      rating: 5,
      comment: 'Comentario de prueba',
      created_at: new Date().toISOString(),
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
