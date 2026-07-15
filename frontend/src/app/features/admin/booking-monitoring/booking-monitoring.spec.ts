import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingMonitoring } from './booking-monitoring';

describe('BookingMonitoring', () => {
  let component: BookingMonitoring;
  let fixture: ComponentFixture<BookingMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingMonitoring],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
