import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitReviewForm } from './submit-review-form';

describe('SubmitReviewForm', () => {
  let component: SubmitReviewForm;
  let fixture: ComponentFixture<SubmitReviewForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitReviewForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitReviewForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
