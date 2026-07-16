import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../utils/app-routes';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true;
  }

  return router.createUrlTree([APP_ROUTES.login]);
};
