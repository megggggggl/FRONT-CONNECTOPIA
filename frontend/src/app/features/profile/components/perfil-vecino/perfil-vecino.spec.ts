import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PerfilVecino } from './perfil-vecino';

describe('PerfilVecino', () => {
  let component: PerfilVecino;
  let fixture: ComponentFixture<PerfilVecino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilVecino],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilVecino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
