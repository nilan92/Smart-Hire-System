import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { ProviderReviewListComponent } from './provider-review-list';

describe('ProviderReviewListComponent', () => {
  let fixture: ComponentFixture<ProviderReviewListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderReviewListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderReviewListComponent);
    fixture.componentRef.setInput('providerId', 7);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('renders fetched reviews once the HTTP response resolves', () => {
    fixture.detectChanges(); // triggers ngOnInit -> HTTP request

    httpMock.expectOne(`${environment.apiUrl}/reviews/provider/7`).flush([
      {
        id: 1,
        booking_id: 1,
        customer_id: 5,
        provider_id: 7,
        service_id: 1,
        rating: 5,
        comment: 'Great work',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);

    // Deliberately no second fixture.detectChanges() call here: the component
    // itself must schedule a re-render after the async response resolves,
    // the same way every other async-data component in this app does.
    expect(fixture.nativeElement.textContent).toContain('Great work');
  });
});
