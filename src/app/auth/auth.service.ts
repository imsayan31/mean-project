import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root'})
export class AuthService {
  private token: string;
  private userId: string;
  private isAuth = false;
  private tokenTimer: any;
  private authStatus = new Subject<boolean>();

  constructor(private http: HttpClient, private route: Router) {

  }

  /* Get Auth Token */
  getToken() {
    return this.token;
  }

  /* Get Current User Id */
  getUserId() {
    return this.userId;
  }

  /* Get Is Auth */
  getIsAuth() {
    return this.isAuth;
  }

  /* Get Auth Status */
  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  /* Create User */
  createUser(email: string, password: string) {
    const authData: AuthData = {
      // tslint:disable-next-line:object-literal-shorthand
      email: email,
      // tslint:disable-next-line:object-literal-shorthand
      password: password
    };
    this.http.post('http://localhost:3000/api/user/signup', authData)
    .subscribe(response => {
      this.route.navigate(['/login']);
    }, error => {
      this.authStatus.next(false);
    });
  }

  /* Log In User */
  loginUser(email: string, password: string) {
    const authData: AuthData = {
      // tslint:disable-next-line:object-literal-shorthand
      email: email,
      // tslint:disable-next-line:object-literal-shorthand
      password: password,
    };
    this.http
      .post<{ token: string, expiresIn: number, userId: string}>('http://localhost:3000/api/user/login', authData)
      .subscribe((response) => {
        const token = response.token;
        const expiringIn = response.expiresIn;
        if (token) {
          this.token = token;
          this.userId = response.userId;
          this.isAuth = true;
          this.authStatus.next(true);
          this.tokenTimer = setTimeout(() => {
            this.logoutUser();
          }, expiringIn * 1000);
          const now = new Date();
          const expiringTime = new Date(now.getTime() + (expiringIn * 1000));
          this.setAuthData(token, expiringTime, this.userId);
          this.route.navigate(['/']);
        }
      }, error => {
        this.authStatus.next(false);
      });
  }

  logoutUser() {
    this.token = null;
    this.userId = null;
    this.isAuth = false;
    this.authStatus.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.route.navigate(['/']);
  }

  autoAuthData() {
    const getAuthData = this.getAuthData();
    const now = new Date();
    if (!getAuthData) {
      return;
    }
    const expiringTime = getAuthData.expiresIn.getTime() - now.getTime();
    if (expiringTime > 0) {
      this.token = getAuthData.token;
      this.userId = getAuthData.userId;
      this.isAuth = true;
      this.authStatus.next(true);
      this.tokenTimer = setTimeout(() => {
        this.logoutUser();
      }, expiringTime);
    }
  }

  private setAuthData(token: string, expiresIn: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiresIn', expiresIn.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('userId');
  }

  getAuthData() {
    const token = localStorage.getItem('token');
    const expiresIn = localStorage.getItem('expiresIn');
    const userId = localStorage.getItem('userId');
    if (!token || !expiresIn) {
      return;
    }
    return {
      token: token,
      expiresIn: new Date(expiresIn),
      userId: userId
    };

  }

}
