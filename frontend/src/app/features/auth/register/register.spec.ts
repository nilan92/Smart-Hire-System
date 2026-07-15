import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Register } from './register';

describe('Register', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('validates registration form', () => {
    const fixture = TestBed.createComponent(Register);
    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('shows provider fields only for provider role', () => {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Provider profile');

    fixture.componentInstance.form.controls.role.setValue('provider');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Provider profile');
  });
});
