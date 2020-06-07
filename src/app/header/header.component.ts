import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private getAuthenticatedStatus = new Subscription();
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    /* this.authService.autoAuthData(); */
    this.isAuthenticated = this.authService.getIsAuth();
    this.getAuthenticatedStatus = this.authService.getAuthStatus().subscribe((response) => {
      this.isAuthenticated = response;
    });
  }

  onLogOut() {
    this.authService.logoutUser();
  }

  ngOnDestroy() {
    this.getAuthenticatedStatus.unsubscribe();
  }

}
