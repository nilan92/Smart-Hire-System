import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderReviewList } from './provider-review-list';

describe('ProviderReviewList', () => {
  let component: ProviderReviewList;
  let fixture: ComponentFixture<ProviderReviewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderReviewList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderReviewList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
