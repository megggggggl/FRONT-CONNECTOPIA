import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionesPageComponent } from './gestiones';

describe('GestionesPageComponent', () => {
  let component: GestionesPageComponent;
  let fixture: ComponentFixture<GestionesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionesPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionesPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});