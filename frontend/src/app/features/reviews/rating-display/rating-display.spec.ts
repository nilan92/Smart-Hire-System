import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingDisplayComponent } from './rating-display';

describe('RatingDisplayComponent', () => {
  let component: RatingDisplayComponent;
  let fixture: ComponentFixture<RatingDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate exactly 5 stars', () => {
    component.rating = 3;
    fixture.detectChanges();
    expect(component.stars.length).toBe(5);
  });

  it('should calculate the correct number of filled stars based on rating', () => {
    component.rating = 3.5;
    component.updateStars();
    
    // 3.5 rounds up to 4 filled stars
    const filledCount = component.stars.filter(s => s === true).length;
    expect(filledCount).toBe(4);
  });
});
