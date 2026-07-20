import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncabezadoPerfil } from './encabezado-perfil';

describe('EncabezadoPerfil', () => {
  let component: EncabezadoPerfil;
  let fixture: ComponentFixture<EncabezadoPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncabezadoPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(EncabezadoPerfil);
    component = fixture.componentInstance;
    component.perfil = {
      name: 'Usuario',
      email: 'usuario@example.com',
      role: 'vecino',
      avatar_url: null,
      is_active: true,
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
