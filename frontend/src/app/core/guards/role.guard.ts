import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { UserRole } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] ?? []) as UserRole[];
  const currentUser = authService.currentUser();

  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
