import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceModerationComponent } from './service-moderation';

describe('ServiceModerationComponent', () => {
  let component: ServiceModerationComponent;
  let fixture: ComponentFixture<ServiceModerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceModerationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceModerationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
