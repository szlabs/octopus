import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service/auth.service';
import { ROUTES } from '../consts';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

	constructor(
		private authService: AuthService,
		private router: Router
		){}

	canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if (this.authService.getCurrentUser() == null) {
			console.info("null session")
			this.router.navigateByUrl(ROUTES.LOGIN)
			return Promise.resolve(false);
		}

	    return Promise.resolve(true);
	}

	
	canActivateChild(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
	  	return this.canActivate(next, state);
	}
}
