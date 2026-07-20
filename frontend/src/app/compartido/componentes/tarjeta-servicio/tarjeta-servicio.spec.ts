import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaServicio } from './tarjeta-servicio';

describe('TarjetaServicio', () => {
  let component: TarjetaServicio;
  let fixture: ComponentFixture<TarjetaServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaServicio);
    component = fixture.componentInstance;
    component.servicio = {
      name: 'Servicio de prueba',
      description: 'Descripcion de prueba',
      images: [],
      status: 'active',
      price: 100,
      avg_rating: 0,
      reviews_count: 0,
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});