import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingMonitoringComponent } from './booking-monitoring';

describe('BookingMonitoringComponent', () => {
  let component: BookingMonitoringComponent;
  let fixture: ComponentFixture<BookingMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingMonitoringComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMonitoringComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
