import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TurismoPageComponent } from './turismo';

describe('TurismoPageComponent', () => {
  let component: TurismoPageComponent;
  let fixture: ComponentFixture<TurismoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurismoPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TurismoPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});