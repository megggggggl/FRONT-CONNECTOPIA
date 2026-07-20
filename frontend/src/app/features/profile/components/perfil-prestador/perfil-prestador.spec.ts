import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PerfilPrestador } from './perfil-prestador';

describe('PerfilPrestador', () => {
  let component: PerfilPrestador;
  let fixture: ComponentFixture<PerfilPrestador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPrestador],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPrestador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
