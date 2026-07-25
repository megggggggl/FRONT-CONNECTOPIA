import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Pgeventos } from './pgeventos';

describe('Pgeventos', () => {
  let component: Pgeventos;
  let fixture: ComponentFixture<Pgeventos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pgeventos],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Pgeventos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
