import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceModeration } from './service-moderation';

describe('ServiceModeration', () => {
  let component: ServiceModeration;
  let fixture: ComponentFixture<ServiceModeration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceModeration],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceModeration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
