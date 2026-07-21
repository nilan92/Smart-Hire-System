import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { SubmitReviewFormComponent } from './submit-review-form';

describe('SubmitReviewFormComponent', () => {
  let fixture: ComponentFixture<SubmitReviewFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitReviewFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitReviewFormComponent);
    fixture.componentRef.setInput('bookingId', 12);
    fixture.componentRef.setInput('customerId', 6);
    fixture.componentRef.setInput('providerId', 7);
    fixture.componentRef.setInput('serviceId', 2);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the success state once the review is saved, without a manual detectChanges call', () => {
    fixture.componentInstance.setRating(5);
    fixture.componentInstance.submitReview();

    httpMock.expectOne(`${environment.apiUrl}/reviews/`).flush({ id: 1 });

    // No second fixture.detectChanges() here: the component itself must
    // schedule a re-render once the async response resolves.
    expect(fixture.nativeElement.textContent).toContain('Thank You!');
  });
});
