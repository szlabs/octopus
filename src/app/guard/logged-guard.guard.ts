import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service/auth.service';
import { ROUTES } from '../consts';

@Injectable()
export class LoggedGuardGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (state.url === '/login') {
      if (this.authService.getCurrentUser() != null) {
        this.router.navigateByUrl(ROUTES.HOME);
        return false;
      }
    }

    return true;
  }
}
