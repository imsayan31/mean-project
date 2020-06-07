import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  isAuthenticated: boolean;
  constructor(private authService: AuthService, private route: Router) {

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    this.isAuthenticated = this.authService.getIsAuth();
    if (!this.isAuthenticated) {
      this.route.navigate(['/login']);
    }
    return this.isAuthenticated;
  }
}
