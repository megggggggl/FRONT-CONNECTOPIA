import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionDashboard } from './seccion-dashboard';

describe('SeccionDashboard', () => {
  let component: SeccionDashboard;
  let fixture: ComponentFixture<SeccionDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
